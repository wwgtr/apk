"""Stage Arabic Imami source texts for review before categorisation.

This collector deliberately stores page-sized raw source segments instead of
claiming a speaker, topic, or authentication grade. Those are assigned only
after the deduplication and editorial phase.
"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = Path("/home/ubuntu/source-reviews/ciyoku-repo/books")
OUTPUT = ROOT / "assets/data/heritage/staging/open_imami_library_raw_pages.json"

BOOKS = (
    ("الإحتجاج", "book.txt", "الاحتجاج على أهل اللجاج", "أحمد بن علي الطبرسي"),
    ("دلائل الإمامة", "book.txt", "دلائل الإمامة", "محمد بن جرير الطبري الإمامي"),
    ("تحف العقول", "book.txt", "تحف العقول عن آل الرسول", "الحسن بن علي بن شعبة الحراني"),
    ("الكافي", "book.txt", "الكافي", "محمد بن يعقوب الكليني"),
    ("الكافي", "book2.txt", "الكافي", "محمد بن يعقوب الكليني"),
    ("الكافي", "book3.txt", "الكافي", "محمد بن يعقوب الكليني"),
    ("الكافي", "book4.txt", "الكافي", "محمد بن يعقوب الكليني"),
    ("الكافي", "book5.txt", "الكافي", "محمد بن يعقوب الكليني"),
    ("الكافي", "book6.txt", "الكافي", "محمد بن يعقوب الكليني"),
    ("الكافي", "book7.txt", "الكافي", "محمد بن يعقوب الكليني"),
    ("الكافي", "book8.txt", "الكافي", "محمد بن يعقوب الكليني"),
    ("الأمالي-الصدوق", "book.txt", "الأمالي", "محمد بن علي بن الحسين الصدوق"),
    ("الأمالي-الطوسي", "book.txt", "الأمالي", "محمد بن الحسن الطوسي"),
    ("الأمالي-المفيد", "book.txt", "الأمالي", "محمد بن محمد بن النعمان المفيد"),
    ("التوحيد", "book.txt", "التوحيد", "محمد بن علي بن الحسين الصدوق"),
    ("كمال الدين و تمام النعمة", "book.txt", "كمال الدين وتمام النعمة", "محمد بن علي بن الحسين الصدوق"),
    ("الخصال", "book.txt", "الخصال", "محمد بن علي بن الحسين الصدوق"),
    ("الغيبة", "book.txt", "الغيبة", "محمد بن الحسن الطوسي"),
    ("الغيبة للنعماني", "book.txt", "الغيبة", "محمد بن إبراهيم النعماني"),
    ("علل-الشرائع", "book.txt", "علل الشرائع", "محمد بن علي بن الحسين الصدوق"),
    ("معاني-الأخبار", "book.txt", "معاني الأخبار", "محمد بن علي بن الحسين الصدوق"),
    ("قرب-الإسناد", "book.txt", "قرب الإسناد", "عبد الله بن جعفر الحميري"),
    ("تفسير القمي", "book.txt", "تفسير القمي", "علي بن إبراهيم القمي"),
)


def normalise(text: str) -> str:
    text = text.replace("\ufeff", "").replace("\r", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def source_key(book_slug: str, page: int, text: str) -> str:
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()[:12]
    return f"raw-{book_slug}-{page:04d}-{digest}"


def main() -> None:
    rows: list[dict[str, object]] = []
    for folder, file_name, title, compiler in BOOKS:
        raw = (SOURCE_ROOT / folder / file_name).read_text(encoding="utf-8")
        pages = raw.split("PAGE_SEPARATOR")
        slug = hashlib.sha256(f"{folder}/{file_name}".encode("utf-8")).hexdigest()[:10]
        for page_number, page in enumerate(pages, start=1):
            text = normalise(page)
            if len(text) < 240:
                continue
            rows.append(
                {
                    "id": source_key(slug, page_number, text),
                    "collection_stage": "raw_source_collection",
                    "title": f"{title} — مقطع المصدر {page_number}",
                    "text": text,
                    "speaker": "غير مصنف بعد",
                    "topic": "غير مصنف بعد",
                    "source_name": title,
                    "author_or_compiler": compiler,
                    "source_locator": f"الملف الرقمي {file_name}، مقطع {page_number}",
                    "source_url": "https://github.com/Ciyoku/ciyoku.github.io",
                    "attribution_status": "source_text_pending_editorial_classification",
                    "verification_note": "نص عربي خام مجموع قبل التصنيف. لا تمثل هذه المرحلة حكماً بسند الرواية أو تعيين القائل.",
                    "tags": ["corpus_raw", folder],
                    "is_original_quote": True,
                    "text_scope": "raw_page_segment",
                    "source_text_sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
                }
            )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    counts: dict[str, int] = {}
    for row in rows:
        key = str(row["source_name"])
        counts[key] = counts.get(key, 0) + 1
    print(json.dumps({"total_raw_segments": len(rows), "by_source": counts}, ensure_ascii=False))


if __name__ == "__main__":
    main()
