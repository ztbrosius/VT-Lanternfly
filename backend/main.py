"""VT-Lanternfly development API: upload, EXIF extraction, and YOLO inference.

No accounts, automatic verification, points, database or public map feed yet.
"""
import hashlib
import io
import re
from datetime import datetime, timezone
import os
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool
from fastapi.responses import HTMLResponse, Response
import logging

from services.image_verifier import detect_lanternflies

logger = logging.getLogger(__name__)
from PIL import Image, UnidentifiedImageError

from metadata_extractor import extract_metadata
from metadata_processor import process_metadata
from sighting_store import append_sighting, read_sightings
from map_visualization import generate_map

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = Path(os.environ.get("LANTERNFLY_UPLOAD_DIR", BASE_DIR / "uploads"))
SIGHTINGS_FILE = UPLOAD_DIR.parent / "sightings.jsonl"
MAX_UPLOAD_BYTES = 15 * 1024 * 1024
ALLOWED_FORMATS = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp", "HEIF": ".heif", "HEIC": ".heic", "MPO": ".jpg"}

app = FastAPI(title="VT-Lanternfly API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8443", "http://127.0.0.1:8443", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


def _mapped_sightings() -> list[dict]:
    """Only AI-detected sightings with actual coordinates appear on the prototype map."""
    return [
        record for record in read_sightings(SIGHTINGS_FILE)
        if record.get("detection_status") == "detected"
        and record.get("latitude") is not None
        and record.get("longitude") is not None
    ]


@app.get("/api/sightings/summary")
def sighting_summary():
    records = read_sightings(SIGHTINGS_FILE)
    return {
        "uploaded": len(records),
        "mapped": len(_mapped_sightings()),
        "detected": sum(record.get("detection_status") == "detected" for record in records),
    }


@app.get("/api/photos/{image_id}")
def sighting_photo(image_id: str):
    """Serve a browser-compatible preview of a locally indexed uploaded photograph."""
    if not re.fullmatch(r"[0-9a-f]{32}", image_id):
        raise HTTPException(status_code=404, detail="Photograph not found")
    record = next((item for item in read_sightings(SIGHTINGS_FILE) if item.get("image_id") == image_id), None)
    if record is None:
        raise HTTPException(status_code=404, detail="Photograph not found")
    path = UPLOAD_DIR / record["stored_name"]
    if not path.is_file() or path.parent.resolve() != UPLOAD_DIR.resolve():
        raise HTTPException(status_code=404, detail="Photograph not found")
    from PIL import ImageOps
    with Image.open(path) as source:
        preview = ImageOps.exif_transpose(source).convert("RGB")
        preview.thumbnail((900, 900))
        output = io.BytesIO()
        preview.save(output, format="JPEG", quality=85)
    return Response(content=output.getvalue(), media_type="image/jpeg")


@app.get("/api/map", response_class=HTMLResponse)
def sightings_map():
    """Render the original Folium/Leaflet map inside the React frontend."""
    mapped = _mapped_sightings()
    image_urls = {str(r["photo_id"]): f"/api/photos/{r['image_id']}" for r in mapped}
    rows = [
        {**record, "verified": None}
        for record in mapped
    ]
    if not rows:
        rows = [{"latitude": None, "longitude": None, "verified": None}]
    map_object = generate_map(rows, image_urls=image_urls, allow_empty=True)
    return HTMLResponse(
        map_object.get_root().render(),
        headers={"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"},
    )


@app.post("/api/sightings", status_code=201)
async def upload_sighting(photo: UploadFile = File(...)):
    """Validate and store photo; return EXIF metadata and YOLO detections.

    Stored files are private and not yet associated with a user or database.
    """
    extension = Path(photo.filename or "").suffix.lower()
    if extension not in {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".mpo"}:
        raise HTTPException(status_code=400, detail="Use a JPG, PNG, WebP, HEIC, or MPO photo.")

    destination = None
    try:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        # Always generate our own filename; never use user-supplied paths.
        destination = UPLOAD_DIR / f"{uuid4().hex}{extension}"
        size = 0
        digest = hashlib.sha256()
        with destination.open("xb") as handle:
            while chunk := await photo.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_UPLOAD_BYTES:
                    raise HTTPException(status_code=413, detail="Photo exceeds 15 MB limit.")
                handle.write(chunk)
                digest.update(chunk)
        if size == 0:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")

        try:
            with Image.open(destination) as img:
                image_format = img.format
                img.verify()
            if image_format not in ALLOWED_FORMATS:
                raise ValueError("Unsupported image format")
        except (UnidentifiedImageError, OSError, ValueError) as exc:
            raise HTTPException(status_code=400, detail="Invalid or unsupported image file.") from exc

        raw_metadata = extract_metadata(destination)
        # Preserve the user's original filename only in the response metadata.
        raw_metadata["file_name"] = Path(photo.filename or "photo").name
        metadata = process_metadata(raw_metadata, photo_id=digest.hexdigest())
        # Model inference is CPU-intensive and must not block FastAPI's event loop.
        # Preserve the upload and metadata even if the optional model fails.
        try:
            detection = await run_in_threadpool(detect_lanternflies, destination)
        except Exception:
            logger.exception("Lanternfly model inference failed")
            detection = {
                "status": "unavailable", "model": "my_model.pt",
                "detections": [], "detection_count": 0,
                "message": "Detection model is unavailable; see backend logs.",
            }
        # A temporary JSONL index lets the live map survive server restarts.
        # This is not a user-account database and does not imply AI approval.
        stored_record = {
            **metadata,
            "image_id": destination.stem,
            "stored_name": destination.name,
            "detection_status": detection["status"],
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
        }
        try:
            await run_in_threadpool(append_sighting, SIGHTINGS_FILE, stored_record)
        except OSError:
            logger.exception("Failed to persist local sighting index")
            raise HTTPException(status_code=500, detail="Could not save sighting locally.")
        return {
            "message": "Photo received; metadata extracted and AI detection attempted. Indexed locally for the development map; not verified or saved to a database.",
            "photo_id": digest.hexdigest(),
            "metadata": metadata,
            "detection": detection,
            "verification_status": "pending_review",
        }
    except HTTPException:
        if destination is not None:
            destination.unlink(missing_ok=True)
        raise
    except (OSError, ValueError, UnidentifiedImageError) as exc:
        if destination is not None:
            destination.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Could not process image.") from exc
    finally:
        await photo.close()
