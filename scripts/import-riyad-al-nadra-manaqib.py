"""Create readable, attributed manaqib excerpts from a reviewed public text page."""

from __future__ import annotations

import json
import re
from pathlib import Path


PROJECT = Path(__file__).resolve().parents[1]
SOURCE = Path("/home/ubuntu/page_texts/tableegh.imamali.net__id_1069.md")
OUTPUT = PROJECT / "assets/data/heritage/manaqib_riyad_al_nadra_excerpts.json"


def clean(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    return text


def title_for(text: str, number: int) -> str:
    lead = re.sub(r"^(عن|قال)\s+", "", text)
    lead = clean(lead)
    return f"فضيلة من فضائل أمير المؤمنين عليه السلام ({number}): {lead[:54]}"


def main() -> None:
    raw = SOURCE.read_text(encoding="utf-8")
    start = raw.find("فضائل أمير المؤمنين (عليه السلام)")
    if start < 0:
        raise RuntimeError("لم يُعثر على متن فضائل أمير المؤمنين في المصدر")
    body = raw[start:]
    body = body.split("## أضف تعليقك", 1)[0]
    chunks = re.split(r"\n\s*ـ{20,}\s*\n", body)
    rows = []
    for index, chunk in enumerate(chunks, start=1):
        lines = [clean(line) for line in chunk.splitlines() if clean(line)]
        if len(lines) < 2:
            continue
        locator = lines[-1]
        text = clean(" ".join(lines[:-1]))
        if len(text) < 70 or not any(token in locator for token in ("ج", "ص", "الأمالي", "الكافي", "بحار", "المناقب", "جامع")):
            continue
        source_name = locator.split(":", 1)[0].strip() or "مصدر مناقب مذكور في الصفحة"
        rows.append({
            "id": f"manaqib-ali-riyad-{index:03d}",
            "topic": "المناقب والفضائل",
            "title": title_for(text, index),
            "text": text,
            "speaker": "روايات في فضائل الإمام علي بن أبي طالب عليه السلام",
            "source_name": source_name,
            "author_or_compiler": "بحسب الإحالة الظاهرة في المصدر الناقل",
            "source_locator": locator,
            "source_url": "https://tableegh.imamali.net/?id=1069",
            "attribution_status": "needs_edition_check",
            "verification_note": "مقتطف موضعي من صفحة تنسب النص إلى الرياض النضرة. لا يقرر التطبيق صحة الإسناد أو يحسم اختلاف الألفاظ بين الطبعات.",
            "tags": ["الإمام علي", "مناقب", "فضائل", "الرياض النضرة"],
            "is_original_quote": True,
            "text_scope": "substantial_excerpt",
        })
    OUTPUT.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(rows)} manaqib excerpts")


if __name__ == "__main__":
    main()
