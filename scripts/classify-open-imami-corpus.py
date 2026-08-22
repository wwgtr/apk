"""Classify a large Arabic Imami raw corpus without loading it all into memory.

Classification is deliberately labelled as a candidate. A page can mention more
than one Imam, so the app keeps all detected figures and never treats this
machine-readable grouping as a verdict on authorship or sanad.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from pathlib import Path

import ijson


ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "assets/data/heritage/staging/open_imami_library_raw_pages.json"
OUTPUT = ROOT / "assets/data/heritage/staging/open_imami_library_classified_pages.json"
MANIFEST = ROOT / "assets/data/heritage/staging/open_imami_library_classification_manifest.json"

FIGURES = (
    ("prophet", ("رسول الله", "النبي محمد", "محمد صلى الله")),
    ("ali", ("أمير المؤمنين", "علي بن أبي طالب", "الإمام علي")),
    ("fatima", ("فاطمة عليها السلام", "فاطمة الزهراء", "الصديقة فاطمة")),
    ("hasan", ("الحسن بن علي", "الإمام الحسن")),
    ("husayn", ("الحسين بن علي", "الإمام الحسين")),
    ("sajjad", ("زين العابدين", "علي بن الحسين", "الإمام السجاد")),
    ("baqir", ("محمد الباقر", "الإمام الباقر", "أبو جعفر الباقر")),
    ("sadiq", ("جعفر الصادق", "الإمام الصادق", "أبو عبد الله الصادق")),
    ("kadhim", ("موسى الكاظم", "الإمام الكاظم", "أبو الحسن الكاظم")),
    ("rida", ("علي الرضا", "الإمام الرضا", "أبو الحسن الرضا")),
    ("jawad", ("محمد الجواد", "الإمام الجواد", "أبو جعفر الثاني")),
    ("hadi", ("علي الهادي", "الإمام الهادي", "أبو الحسن الثالث", "النقي عليه السلام")),
    ("askari", ("الحسن العسكري", "الإمام العسكري", "أبو محمد العسكري")),
    ("mahdi", ("الإمام المهدي", "القائم", "الحجة بن الحسن", "صاحب الزمان")),
)

FIGURE_TAGS = {
    "prophet": "النبي محمد",
    "ali": "أمير المؤمنين",
    "fatima": "فاطمة الزهراء",
    "hasan": "الإمام الحسن",
    "husayn": "الإمام الحسين",
    "sajjad": "الإمام السجاد",
    "baqir": "الإمام الباقر",
    "sadiq": "الإمام الصادق",
    "kadhim": "الإمام الكاظم",
    "rida": "الإمام الرضا",
    "jawad": "الإمام الجواد",
    "hadi": "الإمام الهادي",
    "askari": "الإمام العسكري",
    "mahdi": "الإمام المهدي",
}

TOPICS = (
    ("التوحيد", ("التوحيد", "الخالق", "البارئ", "القدرة", "الصفات")),
    ("الإمامة", ("الإمامة", "الإمام", "الوصي", "النص على", "الحجة")),
    ("الفقه والعبادة", ("الصلاة", "الصوم", "الحج", "الزكاة", "الوضوء", "النكاح")),
    ("الأخلاق والآداب", ("الأخلاق", "الآداب", "الصبر", "الصدق", "الرحمة")),
    ("الغيبة والمهدي", ("الغيبة", "القائم", "المهدي", "الظهور")),
    ("الفضائل والمناقب", ("فضائل", "مناقب", "كرامة", "معجزة")),
    ("القرآن والتفسير", ("القرآن", "الآية", "التفسير", "تنزيل")),
)


def normalise(value: str) -> str:
    value = re.sub(r"[\u064B-\u065F\u0670]", "", value)
    value = value.translate(str.maketrans({"أ": "ا", "إ": "ا", "آ": "ا", "ى": "ي", "ة": "ه"}))
    return re.sub(r"[^\w\u0600-\u06FF]+", "", value).lower()


def matches(text: str, choices: tuple[tuple[str, tuple[str, ...]], ...]) -> list[str]:
    norm = normalise(text)
    found: list[str] = []
    for label, terms in choices:
        if any(normalise(term) in norm for term in terms):
            found.append(label)
    return found


def classify_type(text: str, source: str) -> str:
    norm = normalise(text)
    if any(normalise(term) in norm for term in ("احتجاج", "مناظرة", "سأله", "فقال له", "حاج")):
        return "حوار واحتجاج"
    if any(normalise(term) in norm for term in ("دعا", "دعاء", "اللهم")):
        return "دعاء"
    if any(normalise(term) in norm for term in ("وصية", "عهد", "كتاب إلى")):
        return "وصية أو رسالة"
    if any(normalise(term) in norm for term in ("خطبة", "خطب")):
        return "خطبة"
    if any(normalise(term) in norm for term in ("منقبة", "فضيلة", "كرامة", "معجزة")):
        return "فضائل ومناقب"
    if "تفسير" in source or "آية" in text:
        return "تفسير وبيان قرآني"
    return "رواية أو أثر"


def suggested_section(kind: str) -> str:
    return {
        "حوار واحتجاج": "ihtijaj",
        "دعاء": "dua",
        "وصية أو رسالة": "wasaya",
        "خطبة": "khutab",
        "فضائل ومناقب": "manaqib",
    }.get(kind, "sayings")


def main() -> None:
    seen: set[str] = set()
    stats = Counter()
    figure_stats = Counter()
    topic_stats = Counter()
    kind_stats = Counter()

    with INPUT.open("rb") as source, OUTPUT.open("w", encoding="utf-8") as target:
        target.write("[\n")
        first = True
        for row in ijson.items(source, "item"):
            text = str(row.get("text", "")).strip()
            normalized = normalise(text)
            fingerprint = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
            if not normalized or fingerprint in seen:
                stats["exact_duplicates_removed"] += 1
                continue
            seen.add(fingerprint)
            figures = matches(text, FIGURES)
            topics = matches(text, TOPICS)
            kind = classify_type(text, str(row.get("source_name", "")))
            section = suggested_section(kind)
            lead = re.sub(r"\s+", " ", text).strip()[:74].rstrip("،.؛: ")
            source_tags = [tag for tag in row.get("tags", []) if isinstance(tag, str)]
            classified = {
                **row,
                "collection_stage": "classified_source_collection",
                "title": f"{row.get('source_name', 'مصدر عربي')} — {kind}: {lead}",
                "tags": [*source_tags, *(FIGURE_TAGS[key] for key in figures), *(topics or ["عام"]), kind],
                "normalized_text_sha256": fingerprint,
                "figure_candidates": figures,
                "topic_candidates": topics or ["عام"],
                "content_type_candidate": kind,
                "suggested_section": section,
                "similarity_group": "|".join([figures[0] if figures else "unspecified", kind, (topics or ["عام"])[0]]),
                "verification_note": (
                    "مقطع مصدر عربي جُمِع وصُنِّف آليًا بحسب الكلمات الظاهرة. "
                    "المعصوم والنوع والموضوع مرشحات تحريرية لا حكم نسبة أو تصحيح سند. "
                    + str(row.get("verification_note", ""))
                ).strip(),
            }
            if not first:
                target.write(",\n")
            json.dump(classified, target, ensure_ascii=False, separators=(",", ":"))
            first = False
            stats["unique_segments"] += 1
            kind_stats[kind] += 1
            for figure in figures:
                figure_stats[figure] += 1
            for topic in topics or ["عام"]:
                topic_stats[topic] += 1
        target.write("\n]\n")

    MANIFEST.write_text(
        json.dumps(
            {
                "input": str(INPUT.relative_to(ROOT)),
                "output": str(OUTPUT.relative_to(ROOT)),
                "unique_segments": stats["unique_segments"],
                "exact_duplicates_removed": stats["exact_duplicates_removed"],
                "by_content_type_candidate": dict(kind_stats.most_common()),
                "by_figure_candidate": dict(figure_stats.most_common()),
                "by_topic_candidate": dict(topic_stats.most_common()),
                "method": "streaming exact-hash deduplication plus candidate keyword grouping",
                "editorial_warning": "Candidates require editorial review before being presented as a specific Imam's statement.",
            },
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"unique": stats["unique_segments"], "duplicates_removed": stats["exact_duplicates_removed"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
