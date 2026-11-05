"""One-command photo metadata -> normalized CSV -> interactive map pipeline.

From the photo_metadata_tool directory:
    python run_pipeline.py images/IMG_2967.jpeg
    python run_pipeline.py images/                   # all images in directory
    python run_pipeline.py images/photo1.jpg images/photo2.heic

Each new file gets a stable SHA-256 photo_id, so re-running the same photo
will not append it twice. No coordinates are invented. If the accumulated
CSV has no GPS coordinates, it is updated but a map cannot be generated yet.
"""

import argparse
import csv
import hashlib
import math
from pathlib import Path
import sys

from PIL import UnidentifiedImageError
import pandas as pd

from metadata_extractor import extract_metadata
from metadata_processor import SIGHTING_FIELDS, process_metadata
from map_visualization import load_sightings, save_map

SUPPORTED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp", ".tif", ".tiff", ".bmp", ".mpo",
}


def photo_digest(path: Path) -> str:
    """Hash image bytes to identify repeated uploads, even if renamed."""
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def image_paths(inputs: list[Path]) -> list[Path]:
    """Collect explicitly named images and images in specified folders."""
    found: list[Path] = []
    seen: set[Path] = set()
    for item in inputs:
        if item.is_dir():
            candidates = sorted(
                (p for p in item.iterdir()
                 if p.is_file() and p.suffix.lower() in SUPPORTED_EXTENSIONS),
                key=lambda p: p.name.lower(),
            )
        elif item.is_file():
            candidates = [item]
        else:
            print(f"Skipping missing path: {item}", file=sys.stderr)
            continue
        for path in candidates:
            normalized_path = path.resolve()
            if normalized_path not in seen:
                found.append(normalized_path)
                seen.add(normalized_path)
    return found


def existing_ids(csv_path: Path) -> set[str]:
    """Read existing IDs, rejecting incompatible CSV schemas before writing."""
    if not csv_path.exists():
        return set()
    with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames != SIGHTING_FIELDS:
            raise ValueError(
                f"{csv_path} has a different CSV column layout. "
                "Choose another --csv path or migrate the CSV first; "
                "the pipeline will not overwrite or corrupt it."
            )
        return {row["photo_id"] for row in reader if row.get("photo_id")}


def append_records(csv_path: Path, rows: list[dict]) -> None:
    """Append with a header only for new files; never overwrite old records."""
    if not rows:
        return
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    is_new = not csv_path.exists()
    with csv_path.open("a", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=SIGHTING_FIELDS, extrasaction="ignore")
        if is_new:
            writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract photo metadata, append new sightings to CSV, then update an HTML map."
    )
    parser.add_argument("images", nargs="+", type=Path,
                        help="One or more photos and/or folders of photos")
    parser.add_argument("--csv", type=Path, default=Path("sightings.csv"),
                        help="Cumulative CSV filename (default: sightings.csv)")
    parser.add_argument("--map", dest="map_path", type=Path,
                        default=Path("lanternfly_map.html"),
                        help="Generated map filename (default: lanternfly_map.html)")
    parser.add_argument("--test-latitude", type=float,
                        help="Explicitly assign fictional/test latitude (NOT from photo)")
    parser.add_argument("--test-longitude", type=float,
                        help="Explicitly assign fictional/test longitude (NOT from photo)")
    args = parser.parse_args()

    if (args.test_latitude is None) != (args.test_longitude is None):
        parser.error("--test-latitude and --test-longitude must be provided together")
    use_test_location = args.test_latitude is not None
    if use_test_location:
        if not (math.isfinite(args.test_latitude) and -90 <= args.test_latitude <= 90
                and math.isfinite(args.test_longitude) and -180 <= args.test_longitude <= 180):
            parser.error("Test GPS coordinates must be finite and in valid latitude/longitude ranges")
        print("TEST MODE: supplied coordinates will be tagged 'manual_test', NOT treated as real GPS.")

    paths = image_paths(args.images)
    if not paths:
        parser.exit(1, "No images found. Check the path(s) you supplied.\n")

    try:
        known = existing_ids(args.csv)
        new_records = []
        failed = 0
        duplicates = 0
        for path in paths:
            try:
                photo_id = photo_digest(path)
                if photo_id in known:
                    print(f"Already saved, skipping: {path.name}")
                    duplicates += 1
                    continue
                metadata = extract_metadata(path)
                sighting = process_metadata(metadata, photo_id=photo_id)
                if use_test_location:
                    sighting["latitude"] = args.test_latitude
                    sighting["longitude"] = args.test_longitude
                    sighting["location_source"] = "manual_test"
                new_records.append(sighting)
                known.add(photo_id)
                gps_message = ("TEST location supplied" if use_test_location
                               else "GPS found" if sighting["location_source"] else "no GPS")
                print(f"Processed: {path.name} ({gps_message})")
            except (OSError, UnidentifiedImageError, ValueError, TypeError) as exc:
                failed += 1
                print(f"Failed to read {path.name}: {exc}", file=sys.stderr)

        append_records(args.csv, new_records)
        print(f"CSV: {args.csv} (+{len(new_records)} new, {duplicates} duplicates, {failed} failed)")

        if not args.csv.exists():
            parser.exit(1, "No valid photos processed; CSV and map were not created.\n")

        # Always regenerate the map from *all* accumulated CSV rows, not just today's uploads.
        data = load_sightings(args.csv)
        if data.empty:
            print("CSV has no sightings yet; no map was generated.")
            return
        lat = pd.to_numeric(data["latitude"], errors="coerce")
        lon = pd.to_numeric(data["longitude"], errors="coerce")
        has_gps = lat.between(-90, 90) & lon.between(-180, 180)
        if not has_gps.any():
            print("No sighting has GPS coordinates yet. CSV saved, but map not generated.")
            print("This is expected for photos without GPS EXIF data.")
            return
        args.map_path.parent.mkdir(parents=True, exist_ok=True)
        # Include the full images/ folder so previous photos remain discoverable.
        # Existing CSV schema remains unchanged.
        sources = list(args.images)
        default_images = Path("images")
        if default_images.is_dir():
            sources.append(default_images)
        map_file = save_map(data, args.map_path, image_sources=sources)
        print(f"Map: {map_file} ({int(has_gps.sum())} geolocated sighting(s)); open in a browser.")
    except (OSError, UnicodeError, ValueError, TypeError) as exc:
        parser.exit(1, f"Error: {exc}\n")


if __name__ == "__main__":
    main()
