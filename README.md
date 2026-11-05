# VT-Lanternfly (development)

React/TypeScript frontend and FastAPI metadata-upload backend. This integration does **not** implement accounts, database persistence, AI classification, verified sightings, or real map data yet. The legacy wireframe uses simulated data.

## Start backend (terminal 1)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn main:app --reload
```

Backend health check: http://127.0.0.1:8000/api/health . API docs: http://127.0.0.1:8000/docs .

## Start frontend (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:8443/ then **Report a Lanternfly**. Select a JPEG, PNG, WebP or HEIC file (up to 15 MB) and press **Upload & read metadata**. The frontend forwards `/api` requests through the Vite development proxy (default port 8443). Keep both processes running.

The API extracts existing image metadata. Missing EXIF dates/GPS are shown as unavailable; no location is invented. It stores the file temporarily under `backend/uploads/` (ignored by Git); image records are **not** persisted in a database or associated with an account. Never deploy this initial open upload endpoint publicly without authentication, rate limits, and storage controls. Photo verification, map population and points are **not** triggered by these uploads.

## Existing standalone scripts

The original `metadata_extractor.py`, `metadata_processor.py`, `map_visualization.py`, and `run_pipeline.py` are preserved in `backend/` for reference/standalone use. They are not called as a pipeline by FastAPI: FastAPI imports the extractor and processor functions directly. For the legacy pipeline, run from `backend/` with arguments as shown in `python run_pipeline.py --help`.

## YOLO lanternfly detection (phase 1.5)

The `backend/models/my_model.pt` weights are provided by a teammate. **Only load
checkpoint files from people you trust**: PyTorch files may execute code when loaded.
The new `backend/services/image_verifier.py` uses the Ultralytics YOLO runtime,
with a 0.25 confidence cutoff and 512-pixel inference size. It reads the
EXIF-oriented first image frame, including Apple MPO-JPEG files.

Install the updated `backend/requirements.txt` in the backend virtualenv:

```bash
cd backend
source .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn main:app --reload
```

With the frontend running (`cd frontend && npm install && npm run dev`),
use **Report a Lanternfly** and choose a photo. The response now contains a
`detection` object with `status` (`detected`, `not_detected`, or `unavailable`),
model confidence scores and pixel bounding boxes (`bbox_xyxy`). API documentation:
http://127.0.0.1:8000/docs . The first request may be slower while the model
loads on CPU. If model inference fails, the upload still returns metadata and
`detection.status="unavailable"`; inspect backend terminal logs.

**Important:** Detection does not equal verification. `verification_status` stays
`pending_review`; there is no automatic public map publication, points award,
login, or database persistence. The current result screen for the older
wireframe is demo-only. Weights (~19 MB) are included in this ZIP; coordinate
with your team before committing the weight file to Git. If using Git LFS,
track `*.pt` rather than adding a huge binary to ordinary Git history.

Note: iPhone JPEGs can be read as MPO by Pillow; the backend now accepts MPO.


## Interactive sightings map (local development)

The Map tab now loads the original Folium/Leaflet map directly from FastAPI at
`/api/map` (through the frontend Vite proxy). Upload a photo via **Report a
Lanternfly**. The backend stores the photo under `backend/uploads/` and
appends a temporary record in `backend/sightings.jsonl`.

**Only photos with a YOLO detection and valid EXIF GPS coordinates appear as
map markers.** Click a marker to view a JPEG preview, filename, timestamp,
coordinates, and AI review status. Press **Refresh** to show new uploads.
The map initially centers on Virginia Tech if no matching sightings exist.
If the uploaded photo lacks GPS, it is indexed but not mapped.
Previously uploaded images are not automatically indexed: upload them again.

This is local **JSONL storage, not the planned user-account database**.
No claims of confirmed identification or point awards are made. For now the
map displays original EXIF coordinates as requested; use only in local testing.
Internet connectivity is required to fetch Leaflet/Folium map assets and tiles.
Start FastAPI with `uvicorn main:app --reload` inside `backend/` and the
React app with `npm run dev` in `frontend/`.
