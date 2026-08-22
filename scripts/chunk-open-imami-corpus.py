"""Split classified corpus records into small local archive JSON files.

Each file is intentionally capped so the reader can load one archive portion
on demand instead of loading the entire corpus when the app launches.
"""

from __future__ import annotations

import json
import re
import shutil
from collections import Counter
from pathlib import Path

import ijson


ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "assets/data/heritage/staging/open_imami_library_classified_pages.json"
ARCHIVE_DIR = ROOT / "assets/data/heritage/archive/open_imami_library"
MANIFEST = ROOT / "assets/data/heritage/archive/open_imami_archive_manifest.json"
CHUNK_SIZE = 180


def safe_slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.encode("unicode_escape").decode().lower()).strip("-")[:45]


def source_file(row: dict[str, object]) -> str:
    locator = str(row.get("source_locator", ""))
    match = re.search(r"الملف الرقمي\s+([^،]+)", locator)
    return match.group(1) if match else "book.txt"


def write_chunk(key: tuple[str, str], part: int, rows: list[dict[str, object]], manifest: list[dict[str, object]]) -> None:
    source_name, file_name = key
    slug = safe_slug(f"{source_name}-{file_name}")
    filename = f"{slug}-{part:02d}.json"
    target = ARCHIVE_DIR / filename
    target.write_text(json.dumps(rows, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    manifest.append(
        {
            "id": filename.removesuffix(".json"),
            "title": f"{source_name} — {file_name} — الجزء {part}",
            "source_name": source_name,
            "source_file": file_name,
            "part": part,
            "count": len(rows),
            "asset_path": f"./open_imami_library/{filename}",
            "description": "مقاطع مصدر عربية مصنفة مبدئيًا؛ راجع بيانات المصدر داخل كل مادة.",
        }
    )


def main() -> None:
    if ARCHIVE_DIR.exists():
        shutil.rmtree(ARCHIVE_DIR)
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)

    current_key: tuple[str, str] | None = None
    current_rows: list[dict[str, object]] = []
    parts = Counter()
    manifest: list[dict[str, object]] = []
    total = 0

    def flush() -> None:
        nonlocal current_rows
        if current_key is None or not current_rows:
            return
        parts[current_key] += 1
        write_chunk(current_key, parts[current_key], current_rows, manifest)
        current_rows = []

    with INPUT.open("rb") as source:
        for raw in ijson.items(source, "item"):
            row = dict(raw)
            key = (str(row.get("source_name", "مصدر عربي")), source_file(row))
            if current_key is not None and key != current_key:
                flush()
            current_key = key
            current_rows.append(row)
            total += 1
            if len(current_rows) >= CHUNK_SIZE:
                flush()
        flush()

    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"records": total, "chunks": len(manifest), "max_chunk_size": CHUNK_SIZE}, ensure_ascii=False))


if __name__ == "__main__":
    main()
