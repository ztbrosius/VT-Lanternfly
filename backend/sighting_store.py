"""Temporary local JSONL sighting index until the database is implemented."""
import json
import threading
from pathlib import Path

_STORE_LOCK = threading.Lock()


def append_sighting(path: Path, record: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with _STORE_LOCK, path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def read_sightings(path: Path) -> list[dict]:
    if not path.is_file():
        return []
    with _STORE_LOCK, path.open("r", encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]
