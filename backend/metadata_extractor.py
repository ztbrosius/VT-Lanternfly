"""Extract image EXIF metadata without modifying the original image.

Install: python -m pip install -r requirements.txt
Usage:   python metadata_extractor.py photo.jpg
         python metadata_extractor.py photo1.jpg photo2.jpg --output results.json
"""

import argparse
import json
from pathlib import Path
from typing import Any

from PIL import ExifTags, Image, UnidentifiedImageError
try:
    from pillow_heif import register_heif_opener
    # Register HEIC/HEIF decoding with Pillow, including access to embedded EXIF.
    register_heif_opener()
except ImportError:
    pass  # JPEG/PNG work without HEIF support; install requirements for HEIC.



def _text(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace").strip("\x00 ")
    return str(value).strip("\x00 ")


def _decimal_coordinate(parts: Any, ref: Any) -> float | None:
    """Convert EXIF degrees/minutes/seconds and direction to decimal degrees."""
    if not isinstance(parts, (tuple, list)) or len(parts) != 3:
        return None
    try:
        degrees, minutes, seconds = (float(x) for x in parts)
        direction = (_text(ref) or "").upper()
        if direction not in {"N", "S", "E", "W"}:
            return None
        if not (0 <= minutes < 60 and 0 <= seconds < 60):
            return None
        if degrees < 0:
            return None
        value = degrees + minutes / 60 + seconds / 3600
        if (direction in ("N", "S") and value > 90) or (direction in ("E", "W") and value > 180):
            return None
        return round(-value if direction in ("S", "W") else value, 7)
    except (ValueError, TypeError, ZeroDivisionError, OverflowError):
        return None


def extract_metadata(image_path: str | Path) -> dict[str, Any]:
    """Return JSON-compatible metadata for one image; missing fields are None.

    Date/time is the camera-recorded EXIF value, usually without a timezone.
    The function does not infer capture time or location from file timestamps.
    """
    path = Path(image_path)
    result: dict[str, Any] = {
        "file_name": path.name,
        "format": None,
        "width": None,
        "height": None,
        "date_time_original": None,
        "timezone_offset": None,
        "date_time_digitized": None,
        "date_time_modified": None,
        "latitude": None,
        "longitude": None,
        "altitude_meters": None,
        "camera_make": None,
        "camera_model": None,
        "software": None,
        "has_exif": False,
    }

    with Image.open(path) as img:
        result["format"] = img.format
        result["width"], result["height"] = img.size
        exif = img.getexif()
        result["has_exif"] = bool(exif)
        exif_sub = exif.get_ifd(ExifTags.IFD.Exif)

        def field(tag: int) -> Any:
            return exif_sub.get(tag, exif.get(tag))

        result["date_time_original"] = _text(field(36867))
        result["timezone_offset"] = _text(field(36881))  # OffsetTimeOriginal
        result["date_time_digitized"] = _text(field(36868))
        result["date_time_modified"] = _text(exif.get(306))
        result["camera_make"] = _text(exif.get(271))
        result["camera_model"] = _text(exif.get(272))
        result["software"] = _text(exif.get(305))

        gps = exif.get_ifd(ExifTags.IFD.GPSInfo)
        if gps:
            result["latitude"] = _decimal_coordinate(gps.get(2), gps.get(1))
            result["longitude"] = _decimal_coordinate(gps.get(4), gps.get(3))
            if gps.get(6) is not None:
                try:
                    altitude = float(gps[6])
                    if gps.get(5, 0) in (1, b"\x01"):
                        altitude = -altitude
                    result["altitude_meters"] = round(altitude, 2)
                except (TypeError, ValueError, ZeroDivisionError, OverflowError):
                    pass
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract photo EXIF metadata as JSON.")
    parser.add_argument("images", nargs="+", type=Path, help="One or more image files")
    parser.add_argument("--output", "-o", type=Path, help="Save JSON to this file")
    args = parser.parse_args()

    results = []
    for path in args.images:
        try:
            results.append(extract_metadata(path))
        except (OSError, UnidentifiedImageError, ValueError) as exc:
            results.append({"file_name": path.name, "error": str(exc)})

    payload = results[0] if len(results) == 1 else results
    content = json.dumps(payload, indent=2, ensure_ascii=False)
    if args.output:
        args.output.write_text(content + "\n", encoding="utf-8")
        print(f"Saved metadata to {args.output}")
    else:
        print(content)


if __name__ == "__main__":
    main()
