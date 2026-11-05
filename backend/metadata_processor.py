"""Normalize photo metadata into one consistent sighting record.

Works with the dictionaries produced by metadata_extractor.extract_metadata().
It does NOT request GPS permission or guess a missing location: the future
website must supply browser_location and browser_timestamp explicitly.

Standalone usage:
    python metadata_extractor.py images/photo.jpg --output metadata.json
    python metadata_processor.py metadata.json --output sightings.csv

Python usage:
    from metadata_processor import process_metadata
    sighting = process_metadata(raw_exif, browser_location=location,
                               browser_timestamp=capture_time)
"""

import argparse
import csv
from datetime import datetime
import json
import math
from pathlib import Path
import re
from typing import Any, Mapping


# Consistent field order for CSV and future database / visualization integration.
SIGHTING_FIELDS = [
    "photo_id", "file_name", "timestamp", "timestamp_source",
    "latitude", "longitude", "location_source", "accuracy_meters",
    "location_timestamp", "verified", "exif_timestamp",
    "exif_latitude", "exif_longitude", "browser_timestamp",
    "browser_latitude", "browser_longitude", "camera_make",
    "camera_model", "image_format", "width", "height",
]

_OFFSET = re.compile(r"^[+-](?:0\d|1[0-4]):[0-5]\d$")


def _iso_datetime(value: Any) -> str | None:
    """Return an ISO 8601 timestamp, preserving supplied timezone information.

    Accepts EXIF 'YYYY:MM:DD HH:MM:SS' and ISO 8601. A missing timezone
    stays missing; we deliberately do not assume UTC or the server timezone.
    """
    if not isinstance(value, str) or not value.strip():
        return None
    value = value.strip()
    try:
        if re.match(r"^\d{4}:\d{2}:\d{2} ", value):
            return datetime.strptime(value, "%Y:%m:%d %H:%M:%S").isoformat()
        return datetime.fromisoformat(value.replace("Z", "+00:00")).isoformat()
    except ValueError:
        return None


def _exif_timestamp(metadata: Mapping[str, Any]) -> str | None:
    timestamp = _iso_datetime(metadata.get("date_time_original"))
    if timestamp is None:
        return None
    offset = metadata.get("timezone_offset")
    if not isinstance(offset, str) or not _OFFSET.fullmatch(offset):
        return timestamp
    # EXIF date_time_original is often naive; apply its separate OffsetTimeOriginal.
    if datetime.fromisoformat(timestamp).tzinfo is None:
        return timestamp + offset
    return timestamp


def _coordinate(value: Any, limit: float) -> float | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        number = float(value)
    except (ValueError, TypeError, OverflowError):
        return None
    if not math.isfinite(number) or abs(number) > limit:
        return None
    return number


def _valid_location(location: Mapping[str, Any]) -> tuple[float, float] | None:
    lat = _coordinate(location.get("latitude"), 90)
    lon = _coordinate(location.get("longitude"), 180)
    return (lat, lon) if lat is not None and lon is not None else None


def _accuracy(value: Any) -> float | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        number = float(value)
    except (ValueError, TypeError, OverflowError):
        return None
    return number if math.isfinite(number) and number >= 0 else None


def process_metadata(
    metadata: Mapping[str, Any],
    *,
    browser_location: Mapping[str, Any] | None = None,
    browser_timestamp: str | None = None,
    photo_id: str | int | None = None,
    verified: bool | None = None,
) -> dict[str, Any]:
    """Turn the extractor's metadata into a consistent, JSON-ready record.

    When valid browser data exists it is preferred for the *sighting* timestamp
    and location; both original EXIF and browser readings remain in the record.

    browser_location example:
        {"latitude": 37.23, "longitude": -80.41,
         "accuracy_meters": 10, "timestamp": "2026-10-08T09:55:00-04:00"}

    The caller is responsible for obtaining user consent for browser location.
    Browser GPS is measured at request time, not proof of where a photo was taken.
    """
    if not isinstance(metadata, Mapping):
        raise TypeError("metadata must be a dictionary-like object")
    if browser_location is not None and not isinstance(browser_location, Mapping):
        raise TypeError("browser_location must be a dictionary-like object")

    exif_position = _valid_location(metadata)
    web_position = _valid_location(browser_location) if browser_location else None
    exif_time = _exif_timestamp(metadata)
    web_time = _iso_datetime(browser_timestamp)

    position = web_position if web_position is not None else exif_position
    location_source = "browser" if web_position is not None else (
        "exif" if exif_position is not None else None
    )
    timestamp = web_time if web_time is not None else exif_time
    timestamp_source = "browser" if web_time is not None else (
        "exif" if exif_time is not None else None
    )

    location_time = None
    if browser_location and web_position is not None:
        location_time = _iso_datetime(browser_location.get("timestamp"))

    return {
        "photo_id": photo_id if photo_id is not None else metadata.get("photo_id"),
        "file_name": metadata.get("file_name"),
        "timestamp": timestamp,
        "timestamp_source": timestamp_source,
        "latitude": position[0] if position is not None else None,
        "longitude": position[1] if position is not None else None,
        "location_source": location_source,
        "accuracy_meters": _accuracy(browser_location.get("accuracy_meters"))
        if location_source == "browser" and browser_location else None,
        "location_timestamp": location_time,
        "verified": verified if verified is not None else metadata.get("verified"),
        "exif_timestamp": exif_time,
        "exif_latitude": exif_position[0] if exif_position is not None else None,
        "exif_longitude": exif_position[1] if exif_position is not None else None,
        "browser_timestamp": web_time,
        "browser_latitude": web_position[0] if web_position is not None else None,
        "browser_longitude": web_position[1] if web_position is not None else None,
        "camera_make": metadata.get("camera_make"),
        "camera_model": metadata.get("camera_model"),
        "image_format": metadata.get("format"),
        "width": metadata.get("width"),
        "height": metadata.get("height"),
    }


def process_many(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Normalize a list of results from the extractor CLI."""
    return [process_metadata(record) for record in records if "error" not in record]


def save_sightings(records: list[dict[str, Any]], path: str | Path) -> Path:
    """Save normalized records to CSV or JSON (chosen by file extension)."""
    destination = Path(path)
    if destination.suffix.lower() == ".json":
        destination.write_text(json.dumps(records, indent=2) + "\n", encoding="utf-8")
    elif destination.suffix.lower() == ".csv":
        with destination.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=SIGHTING_FIELDS, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(records)
    else:
        raise ValueError("Output filename must end in .csv or .json")
    return destination


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize EXIF JSON into sighting CSV/JSON.")
    parser.add_argument("input", type=Path, help="JSON from metadata_extractor.py --output")
    parser.add_argument("--output", "-o", type=Path, default=Path("sightings.csv"),
                        help="Where to save the normalized data (default: sightings.csv)")
    parser.add_argument("--browser-latitude", type=float,
                        help="Optional location supplied by a browser (for testing)")
    parser.add_argument("--browser-longitude", type=float,
                        help="Optional location supplied by a browser (for testing)")
    parser.add_argument("--accuracy-meters", type=float)
    parser.add_argument("--captured-at", type=str,
                        help="Browser capture time in ISO 8601 format")
    args = parser.parse_args()

    if (args.browser_latitude is None) != (args.browser_longitude is None):
        parser.error("--browser-latitude and --browser-longitude must be supplied together")

    try:
        raw = json.loads(args.input.read_text(encoding="utf-8"))
        raw_records = raw if isinstance(raw, list) else [raw]
        if not all(isinstance(x, dict) for x in raw_records):
            raise ValueError("Input must be a JSON object or an array of objects")
        location = None
        if args.browser_latitude is not None:
            location = {
                "latitude": args.browser_latitude,
                "longitude": args.browser_longitude,
                "accuracy_meters": args.accuracy_meters,
            }
            if _valid_location(location) is None:
                parser.error("Browser latitude/longitude are outside valid ranges")
        if args.captured_at is not None and _iso_datetime(args.captured_at) is None:
            parser.error("--captured-at must be a valid ISO 8601 timestamp")
        processed = [
            process_metadata(item, browser_location=location,
                             browser_timestamp=args.captured_at)
            for item in raw_records if "error" not in item
        ]
        if not processed:
            raise ValueError("Input contains no successfully extracted photos")
        dest = save_sightings(processed, args.output)
        no_gps = sum(x["location_source"] is None for x in processed)
        print(f"Saved {len(processed)} sighting(s) to {dest}")
        if no_gps:
            print(f"Note: {no_gps} sighting(s) have no GPS coordinates; "
                  "they cannot be plotted until a location is provided.")
    except (OSError, UnicodeError, json.JSONDecodeError, ValueError, TypeError) as exc:
        parser.exit(1, f"Error: {exc}\n")


if __name__ == "__main__":
    main()
