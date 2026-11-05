"""Run the teammate-provided YOLO lanternfly detector on an uploaded photo.

A detection is a model prediction, NOT a confirmed sighting. Model weights must
come from a trusted teammate: PyTorch checkpoint files can execute code on load.
"""
from functools import lru_cache
from pathlib import Path
from threading import Lock

from PIL import Image, ImageOps

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "my_model.pt"
CONFIDENCE_THRESHOLD = 0.25
IMAGE_SIZE = 1024  # Improved detection of small lanternflies in uploaded photos.
_model_lock = Lock()


@lru_cache(maxsize=1)
def _load_model():
    if not MODEL_PATH.is_file():
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
    # Import lazily so API health checks work even if ML packages aren't installed.
    from ultralytics import YOLO
    return YOLO(str(MODEL_PATH))


def detect_lanternflies(image_path: str | Path) -> dict:
    """Return model detections with pixel bounding boxes and confidences.

    Converts the first image frame to an EXIF-corrected RGB array so that
    Apple MPO JPEGs, HEIC, and other Pillow formats can be processed alike.
    Confidence is a model score, not a probability of species verification.
    """
    import numpy as np

    with Image.open(image_path) as original:
        frame = ImageOps.exif_transpose(original)
        rgb = frame.convert("RGB")
        width, height = rgb.size
        pixels = np.asarray(rgb)

    with _model_lock:
        model = _load_model()
        predictions = model.predict(
            source=pixels,
            conf=CONFIDENCE_THRESHOLD,
            imgsz=IMAGE_SIZE,
            device="cpu",
            verbose=False,
        )

    detections = []
    if predictions:
        result = predictions[0]
        names = result.names
        if result.boxes is not None:
            for box in result.boxes:
                class_id = int(box.cls.item())
                label = names.get(class_id, str(class_id)) if isinstance(names, dict) else names[class_id]
                coords = [round(float(x), 1) for x in box.xyxy[0].tolist()]
                detections.append({
                    "class_id": class_id,
                    "label": str(label),
                    "confidence": round(float(box.conf.item()), 4),
                    "bbox_xyxy": coords,
                })

    return {
        "status": "detected" if detections else "not_detected",
        "model": MODEL_PATH.name,
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "image_width": width,
        "image_height": height,
        "detections": detections,
        "detection_count": len(detections),
    }
