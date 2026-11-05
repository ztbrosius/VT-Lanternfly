"""Visualize VT LanternFly sighting locations on an interactive HTML map.

Inputs: the CSV or JSON from metadata_processor.py, or a pandas DataFrame.
The script does not depend on a live website, camera, database, or FastAPI.

Standalone:
    python map_visualization.py sample_sightings.csv --output lanternfly_map.html
    python map_visualization.py sightings.csv --output my_map.html

As a module:
    from map_visualization import generate_map
    map_object = generate_map(my_dataframe)
    map_object.save("lanternfly_map.html")

The HTML uses Leaflet tile resources loaded from the internet when opened.
"""

import argparse
from html import escape
import hashlib
import json
import os
from pathlib import Path
from urllib.parse import quote
from typing import Any

import folium
from folium.plugins import HeatMap, MarkerCluster
import pandas as pd
from PIL import Image, ImageOps

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    pass  # PNG/JPEG maps still work without optional HEIC support.

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp", ".tif", ".tiff", ".bmp", ".mpo"}


def _photo_hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def find_photo_paths(image_sources: list[str | Path] | None) -> dict[str, Path]:
    """Index existing images by original filename and SHA-256 ID.

    SHA-256 indexing also supports photographs renamed after import.
    """
    matches: dict[str, Path] = {}
    for source in image_sources or []:
        entry = Path(source)
        files = (sorted(entry.iterdir()) if entry.is_dir() else [entry] if entry.is_file() else [])
        for path in files:
            if not path.is_file() or path.suffix.lower() not in IMAGE_EXTENSIONS:
                continue
            matches.setdefault(path.name, path.resolve())
            try:
                matches.setdefault(_photo_hash(path), path.resolve())
            except OSError:
                pass
    return matches


def _browser_image(path: Path, output_path: Path) -> Path | None:
    """Convert HEIC/HEIF to JPEG thumbnails for browsers that cannot display HEIC."""
    if path.suffix.lower() not in {".heic", ".heif", ".tif", ".tiff", ".bmp", ".mpo"}:
        return path
    try:
        previews = output_path.resolve().parent / ".map_previews"
        previews.mkdir(parents=True, exist_ok=True)
        destination = previews / (_photo_hash(path) + ".jpg")
        if not destination.exists():
            with Image.open(path) as original:
                preview = ImageOps.exif_transpose(original)
                preview.thumbnail((800, 800))
                preview.convert("RGB").save(destination, "JPEG", quality=85)
        return destination
    except (OSError, ValueError):
        return None


def _photo_html(path: Path | None, output_path: Path | None) -> str:
    """Create relative, URL-encoded image link for an HTML map served via localhost."""
    if path is None or output_path is None:
        return ""
    display_path = _browser_image(path, output_path)
    if display_path is None:
        return ""
    relative = Path(os.path.relpath(display_path.resolve(), output_path.resolve().parent))
    # Map must be hosted with access to the image's path (e.g. localhost root).
    url = quote(relative.as_posix(), safe="/")
    return (
        f'<img src="{escape(url, quote=True)}" alt="Photograph of sighting" '
        'style="display:block;max-width:100%;width:260px;max-height:230px;'
        'object-fit:contain;margin-bottom:8px;border-radius:6px" loading="lazy">'
    )


def load_sightings(path: str | Path) -> pd.DataFrame:
    """Read a normalized .csv or .json sighting file into a DataFrame."""
    source = Path(path)
    if source.suffix.lower() == ".csv":
        return pd.read_csv(source)
    if source.suffix.lower() == ".json":
        data = json.loads(source.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            data = [data]
        if not isinstance(data, list) or not all(isinstance(x, dict) for x in data):
            raise ValueError("JSON must contain one sighting object or a list of objects")
        return pd.DataFrame(data)
    raise ValueError("Input file must end in .csv or .json")


def _verification_status(value: Any) -> bool | None:
    if value is None or (not isinstance(value, (dict, list)) and pd.isna(value)):
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)) and value in (0, 1):
        return bool(value)
    if isinstance(value, str):
        key = value.strip().lower()
        if key in ("true", "yes", "verified", "1"):
            return True
        if key in ("false", "no", "unverified", "rejected", "0"):
            return False
    return None


def _display(value: Any) -> str:
    if value is None:
        return "Unknown"
    try:
        if bool(pd.isna(value)):
            return "Unknown"
    except (TypeError, ValueError):
        pass
    as_string = str(value)
    return escape(as_string) if as_string.strip() else "Unknown"


def generate_map(
    sightings: pd.DataFrame | list[dict[str, Any]],
    *,
    verified_only: bool = False,
    image_sources: list[str | Path] | None = None,
    output_path: str | Path | None = None,
    image_urls: dict[str, str] | None = None,
    allow_empty: bool = False,
) -> folium.Map:
    """Return an interactive Folium map containing valid sighting coordinates.

    Markers are green (verified), red (rejected/unverified), or blue (unknown).
    A sighting without valid latitude AND longitude is skipped. By default,
    all geolocated sightings are shown, regardless of verification status.
    """
    df = pd.DataFrame(sightings).copy()
    required = {"latitude", "longitude"}
    if not required.issubset(df.columns):
        raise ValueError("Sightings must include 'latitude' and 'longitude' columns")

    df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
    valid = (
        df["latitude"].between(-90, 90)
        & df["longitude"].between(-180, 180)
    )
    df = df.loc[valid].copy()
    if "verified" in df.columns:
        df["_verified"] = df["verified"].map(_verification_status)
    else:
        df["_verified"] = None
    if verified_only:
        df = df.loc[df["_verified"] == True].copy()  # noqa: E712
    if df.empty and not allow_empty:
        raise ValueError(
            "No sightings with usable GPS coordinates were found. "
            "Try sample_sightings.csv, or provide browser GPS data for your photos."
        )

    photo_paths = find_photo_paths(image_sources)
    html_path = Path(output_path) if output_path is not None else None

    center = [float(df["latitude"].mean()), float(df["longitude"].mean())] if not df.empty else [37.2296, -80.4139]
    map_object = folium.Map(location=center, zoom_start=15, control_scale=True)
    # The overlay menu in Leaflet lets users independently show/hide markers and heat density.
    cluster = MarkerCluster(name="Photo markers", show=True).add_to(map_object)

    # Each geolocated sighting contributes one point. With only one or two sightings,
    # the heatmap will show small isolated spots rather than a broad density pattern.
    heat_points = df[["latitude", "longitude"]].values.tolist()
    if heat_points:
        heat_layer = folium.FeatureGroup(name="Heatmap", show=False)
        HeatMap(
            heat_points,
            radius=28,
            blur=20,
            min_opacity=0.35,
            max_zoom=17,
        ).add_to(heat_layer)
        heat_layer.add_to(map_object)

    for _, row in df.iterrows():
        status = row["_verified"]
        status_text = "Verified" if status is True else (
            "Not verified" if status is False else "Unknown"
        )
        color = "green" if status is True else (
            "red" if status is False else "blue"
        )
        if row.get("detection_status") == "detected" and status is not True:
            status_text = "AI detected — pending review"
            color = "orange"
        raw_id = row.get("photo_id")
        raw_name = row.get("file_name")
        photo_key = "" if pd.isna(raw_id) else str(raw_id)
        file_key = "" if pd.isna(raw_name) else str(raw_name)
        image_path = photo_paths.get(photo_key) or photo_paths.get(file_key)
        photo_image = _photo_html(image_path, html_path)
        # In the web app, image bytes are served by FastAPI, not relative filesystem paths.
        if image_urls and photo_key in image_urls:
            image_url = escape(image_urls[photo_key], quote=True)
            photo_image = (
                f'<img src="{image_url}" alt="Uploaded sighting" '
                'style="display:block;max-width:100%;width:260px;max-height:230px;'
                'object-fit:contain;margin-bottom:8px;border-radius:6px" loading="lazy">'
            )
        photo = _display(file_key or photo_key)
        timestamp = _display(row.get("timestamp", row.get("date_time_original")))
        location_source = _display(row.get("location_source"))
        accuracy = _display(row.get("accuracy_meters"))
        latitude = float(row["latitude"])
        longitude = float(row["longitude"])
        popup = (
            photo_image +
            f"<strong>Photo:</strong> {photo}<br>"
            f"<strong>Time:</strong> {timestamp}<br>"
            f"<strong>Status:</strong> {status_text}<br>"
            f"<strong>Location source:</strong> {location_source}<br>"
            f"<strong>GPS accuracy (m):</strong> {accuracy}<br>"
            f"<strong>Coordinates:</strong> {latitude:.6f}, {longitude:.6f}"
        )
        folium.Marker(
            location=[latitude, longitude],
            tooltip=f"Photo {photo} — {status_text}",
            popup=folium.Popup(popup, max_width=320),
            icon=folium.Icon(color=color, icon="info-sign"),
        ).add_to(cluster)

    if len(df) > 1:
        bounds = [
            [float(df["latitude"].min()), float(df["longitude"].min())],
            [float(df["latitude"].max()), float(df["longitude"].max())],
        ]
        map_object.fit_bounds(bounds, padding=(25, 25))
    folium.LayerControl().add_to(map_object)
    return map_object


def save_map(
    sightings: pd.DataFrame | list[dict[str, Any]],
    output: str | Path = "lanternfly_map.html",
    *,
    verified_only: bool = False,
    image_sources: list[str | Path] | None = None,
) -> Path:
    """Build an interactive HTML map and save it to disk."""
    destination = Path(output)
    map_object = generate_map(
        sightings, verified_only=verified_only,
        image_sources=image_sources, output_path=destination,
    )
    map_object.save(str(destination))
    return destination


def main() -> None:
    parser = argparse.ArgumentParser(description="Create an interactive map of photo sightings.")
    parser.add_argument("input", type=Path, help="Normalized sightings CSV or JSON")
    parser.add_argument("--output", "-o", type=Path,
                        default=Path("lanternfly_map.html"), help="Output HTML filename")
    parser.add_argument("--verified-only", action="store_true",
                        help="Show only rows whose verified field is True")
    parser.add_argument("--images", type=Path, nargs="+", default=None,
                        help="Image folders/files for clickable popup photographs (default: images/ beside CSV)")
    args = parser.parse_args()
    try:
        data = load_sightings(args.input)
        images = args.images if args.images is not None else [args.input.parent / "images"]
        path = save_map(data, args.output, verified_only=args.verified_only,
                        image_sources=images)
        print(f"Map saved to {path} — open it in your web browser.")
        print("The background map requires an internet connection to load tiles.")
    except (OSError, UnicodeError, json.JSONDecodeError, pd.errors.EmptyDataError,
            pd.errors.ParserError, ValueError, TypeError) as exc:
        parser.exit(1, f"Error: {exc}\n")


if __name__ == "__main__":
    main()
