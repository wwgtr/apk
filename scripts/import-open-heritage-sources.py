"""Build locally bundled heritage records from reviewed open-source source copies.

Input source copies are deliberately kept outside the app project. This script only
reads their data files and writes normalized JSON records plus local license notices.
"""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
HERITAGE_DIR = PROJECT_ROOT / "assets" / "data" / "heritage"
NOTICE_DIR = HERITAGE_DIR / "licenses"
NAHJ_SQL = Path("/home/ubuntu/nahj-source-review/nahj-al-balaghe.sql")
NAHJ_LICENSE = Path("/home/ubuntu/nahj-source-review/LICENSE")
MAFATIH_JSON = Path("/home/ubuntu/mafatih-source-review/mafatih-server/chapters.json")
MAFATIH_LICENSE = Path("/home/ubuntu/mafatih-source-review/LICENSE")

PERSIAN_TO_ARABIC = str.maketrans({"ي": "ي", "ی": "ي", "ک": "ك", "ۀ": "ة", "‌": " "})


def compact(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "").translate(PERSIAN_TO_ARABIC)).strip()


def arabic_ratio(value: str) -> float:
    meaningful = [character for character in value if not character.isspace()]
    if not meaningful:
        return 0.0
    arabic = sum("\u0600" <= character <= "\u06ff" for character in meaningful)
    return arabic / len(meaningful)


def write_json(name: str, rows: list[dict[str, object]]) -> None:
    target = HERITAGE_DIR / name
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{target.name}: {len(rows)} records")


def parse_mysql_value_tuple(value_source: str) -> list[object]:
    """Parse one quoted MySQL VALUES tuple without evaluating source code."""
    values: list[object] = []
    index = 0
    length = len(value_source)
    while index < length:
        while index < length and value_source[index] in " \t\r\n,()":
            index += 1
        if index >= length:
            break
        if value_source[index] == "'":
            index += 1
            buffer: list[str] = []
            while index < length:
                character = value_source[index]
                if character == "\\" and index + 1 < length:
                    escaped = value_source[index + 1]
                    buffer.append({"n": "\n", "r": "\r", "t": "\t", "0": "\0"}.get(escaped, escaped))
                    index += 2
                    continue
                if character == "'":
                    index += 1
                    break
                buffer.append(character)
                index += 1
            values.append("".join(buffer))
            continue
        end = index
        while end < length and value_source[end] not in ",)":
            end += 1
        token = value_source[index:end].strip()
        values.append(None if token.upper() == "NULL" else int(token))
        index = end
    return values


def read_nahj_sql_records() -> list[list[object]]:
    if not NAHJ_SQL.exists():
        raise FileNotFoundError(f"Missing reviewed Nahj source: {NAHJ_SQL}")
    source = NAHJ_SQL.read_text(encoding="utf-8")
    records: list[list[object]] = []
    marker = "INSERT INTO `nahj` VALUES "
    start = 0
    while True:
        insertion_start = source.find(marker, start)
        if insertion_start == -1:
            break
        tuple_start = source.find("(", insertion_start + len(marker))
        index = tuple_start
        in_string = False
        escaped = False
        while index < len(source):
            character = source[index]
            if in_string:
                if escaped:
                    escaped = False
                elif character == "\\":
                    escaped = True
                elif character == "'":
                    in_string = False
            elif character == "'":
                in_string = True
            elif character == ";":
                break
            index += 1
        statement = source[tuple_start:index]
        records.append(parse_mysql_value_tuple(statement))
        start = index + 1
    return records


def import_nahj() -> None:
    section_by_category = {1: "khutab", 2: "wasaya", 3: "sayings"}
    title_by_category = {1: "خطب نهج البلاغة", 2: "رسائل نهج البلاغة", 3: "حكم نهج البلاغة"}
    rows: list[dict[str, object]] = []

    for record in read_nahj_sql_records():
        if len(record) != 8:
            continue
        _, category, number, source_title, _, arabic, _, _ = record
        if not isinstance(category, int) or not isinstance(number, int):
            continue
        section = section_by_category.get(category)
        text = compact(arabic)
        if section is None or len(text) < 24:
            continue
        kind = title_by_category[category]
        rows.append(
            {
                "id": f"nahj-{section}-{number:03d}",
                "topic": kind,
                "title": f"{kind[:-1]} رقم {number}",
                "text": text,
                "speaker": "الإمام علي بن أبي طالب عليه السلام",
                "source_name": "نهج البلاغة",
                "author_or_compiler": "الشريف الرضي",
                "source_locator": f"{kind[:-1]} رقم {number}",
                "source_url": "https://github.com/geraked/application-nahj",
                "attribution_status": "imami_transmission",
                "verification_note": (
                    "النص مستورد من قاعدة بيانات مفتوحة بترخيص MIT؛ "
                    "يستحسن مقابلته بطبعة محققة عند الدراسة النصية أو السندية."
                ),
                "tags": ["نهج البلاغة", kind, "الإمام علي"],
                "is_original_quote": True,
                "text_scope": "full_text",
                "upstream_title": compact(source_title),
            }
        )
    write_json("open_source_nahj_al_balagha_full.json", rows)


def import_mafatih() -> None:
    if not MAFATIH_JSON.exists():
        raise FileNotFoundError(f"Missing reviewed Mafatih source: {MAFATIH_JSON}")

    source = json.loads(MAFATIH_JSON.read_text(encoding="utf-8"))
    counters = {"visits": 0, "works": 0}
    rows: list[dict[str, object]] = []

    for chapter in source:
        chapter_title = compact(chapter.get("title"))
        for chapter_section in chapter.get("sections", []):
            section_title = compact(chapter_section.get("title"))
            for article in chapter_section.get("articles", []):
                article_title = compact(article.get("title"))
                pieces = [
                    compact(item.get("content"))
                    for item in article.get("items", [])
                    if item.get("type") == "Text" and compact(item.get("content"))
                ]
                text = "\n\n".join(pieces)
                if len(text) < 100 or arabic_ratio(text) < 0.5:
                    continue
                haystack = f"{chapter_title} {section_title} {article_title}".lower()
                section = "visits" if "زيارت" in haystack or "زيارة" in haystack else "works"
                counters[section] += 1
                sequence = counters[section]
                title = article_title or f"مادة من مفاتيح الجنان {sequence}"
                rows.append(
                    {
                        "id": f"mafatih-{section}-{sequence:03d}",
                        "topic": "الزيارات" if section == "visits" else "الأعمال والأدعية",
                        "title": title,
                        "text": text,
                        "speaker": "مروي في مفاتيح الجنان",
                        "source_name": "مفاتيح الجنان",
                        "author_or_compiler": "الشيخ عباس القمي",
                        "source_locator": " / ".join(filter(None, [chapter_title, section_title, article_title])),
                        "source_url": "https://github.com/aminpaydar/Mafatih/blob/master/mafatih-server/chapters.json",
                        "attribution_status": "imami_transmission",
                        "verification_note": (
                            "النص مستورد من بيانات مفتوحة بترخيص Apache-2.0؛ "
                            "يلزم مقابلة طبعة مفاتيح الجنان عند الدراسة النصية أو السندية."
                        ),
                        "tags": ["مفاتيح الجنان", "نص عربي", "زيارة" if section == "visits" else "عمل"],
                        "is_original_quote": True,
                        "text_scope": "full_text",
                    }
                )
    write_json("open_source_mafatih_full.json", rows)


def copy_licenses() -> None:
    NOTICE_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(NAHJ_LICENSE, NOTICE_DIR / "MIT-application-nahj.txt")
    shutil.copyfile(MAFATIH_LICENSE, NOTICE_DIR / "Apache-2.0-Mafatih.txt")


def main() -> None:
    import_nahj()
    import_mafatih()
    copy_licenses()


if __name__ == "__main__":
    main()
