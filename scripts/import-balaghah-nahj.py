"""Import the Arabic text of Nahj al-Balagha from a reviewed public source.

The source page explicitly permits quotation with attribution. This importer keeps
the upstream URL on every entry, reads sequentially, and makes no network writes.
"""

from __future__ import annotations

import json
import os
import re
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


BASE_URL = "http://arabic.balaghah.net"
PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT = PROJECT_ROOT / "assets" / "data" / "heritage" / "nahj_al_balagha_arabic_full.json"
NOTICE = PROJECT_ROOT / "assets" / "data" / "heritage" / "licenses" / "BALAGHAH_SOURCE_NOTICE.md"

SECTIONS = {
    "khutab": "/شیخ-فارس-الحسون/الخطب/النص-النهج-البلاغة",
    "wasaya": "/شیخ-فارس-الحسون/الرسائل/النص-النهج-البلاغة",
    "sayings": "/شیخ-فارس-الحسون/الحکم/النص-النهج-البلاغة",
}

SECTION_META = {
    "khutab": ("خطب نهج البلاغة", "خطبة"),
    "wasaya": ("رسائل ووصايا نهج البلاغة", "رسالة"),
    "sayings": ("حكم نهج البلاغة", "حكمة"),
}


def normalize(value: str) -> str:
    value = value.replace("\xa0", " ")
    return re.sub(r"\s+", " ", value).strip()


def fetch(session: requests.Session, url: str) -> BeautifulSoup | None:
    for attempt in range(3):
        try:
            response = session.get(url, timeout=12 + attempt * 6)
            response.raise_for_status()
            response.encoding = response.apparent_encoding or response.encoding
            time.sleep(0.12)
            return BeautifulSoup(response.text, "html.parser")
        except requests.RequestException:
            time.sleep(0.5 + attempt)
    print(f"Skipped unavailable source URL: {url}")
    return None


def index_links(session: requests.Session, section_path: str) -> list[tuple[str, str]]:
    links: dict[str, str] = {}
    for page in range(0, 40):
        soup = fetch(session, f"{BASE_URL}{section_path}?page={page}")
        if soup is None:
            continue
        page_links = []
        for anchor in soup.select(".view-text .views-field-title a[href^='/node/']"):
            href = anchor.get("href", "")
            title = normalize(anchor.get_text(" ", strip=True))
            if href and title:
                page_links.append((urljoin(BASE_URL, href), title))
        if not page_links:
            break
        for url, title in page_links:
            links[url] = title
    return list(links.items())


def article_text(soup: BeautifulSoup) -> str:
    selectors = (
        "#nb-node-container .nb-article-node-body",
        ".node .field-name-body .field-item",
        ".node .field-item.even",
        "#main-content .node .content",
        "#block-system-main .node .content",
    )
    for selector in selectors:
        element = soup.select_one(selector)
        if element:
            for note in element.select("a[id^='_ftnref'], a[id^='_ftn']"):
                note.decompose()
            for child in element.find_all("div", recursive=False):
                if normalize(child.get_text(" ", strip=True)).startswith("---"):
                    child.decompose()
            for unwanted in element.select("script, style, .field-name-field-image"):
                unwanted.decompose()
            text = normalize(element.get_text("\n", strip=True))
            if len(text) >= 16:
                return text
    return ""


def number_from_title(title: str, fallback: int) -> int:
    match = re.search(r"(\d+)", title)
    return int(match.group(1)) if match else fallback


def main() -> None:
    session = requests.Session()
    session.headers["User-Agent"] = "SirajAlWilayaContentBuilder/0.1 (attributed archival use)"
    entries: list[dict[str, object]] = []
    if OUTPUT.exists():
        entries = json.loads(OUTPUT.read_text(encoding="utf-8"))
    imported_urls = {entry.get("source_url") for entry in entries}
    requested_section = os.environ.get("SIRAJ_NAHJ_SECTION")
    batch_size = int(os.environ.get("SIRAJ_NAHJ_BATCH_SIZE", "60"))
    batch_start = int(os.environ.get("SIRAJ_NAHJ_BATCH_START", "0"))
    for section, path in SECTIONS.items():
        if requested_section and section != requested_section:
            continue
        topic, singular = SECTION_META[section]
        links = index_links(session, path)
        print(f"{section}: {len(links)} index links")
        batch_links = links[batch_start:batch_start + batch_size]
        for fallback, (url, title) in enumerate(batch_links, start=batch_start + 1):
            if url in imported_urls:
                continue
            source_page = fetch(session, url)
            if source_page is None:
                continue
            text = article_text(source_page)
            if len(text) < 16:
                continue
            number = number_from_title(title, fallback)
            entries.append(
                {
                    "id": f"balaghah-{section}-{number:03d}",
                    "title": title,
                    "text": text,
                    "speaker": "الإمام علي بن أبي طالب عليه السلام",
                    "topic": topic,
                    "source_name": "نهج البلاغة",
                    "author_or_compiler": "الشريف الرضي",
                    "source_locator": f"{singular} رقم {number}",
                    "source_url": url,
                    "attribution_status": "imami_transmission",
                    "verification_note": "نص عربي من مصدر يصرح بالسماح بالاقتباس مع ذكر المصدر؛ لا يمثل ذلك حكماً مستقلاً على السند أو على اختلاف الطبعات.",
                    "tags": ["نهج البلاغة", topic, "الإمام علي"],
                    "is_original_quote": True,
                    "text_scope": "full_text",
                }
            )
            OUTPUT.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    unique = {entry["id"]: entry for entry in entries}
    output = list(unique.values())
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    NOTICE.write_text(
        "# إشعار مصدر نهج البلاغة\n\n"
        "أُنشئ `nahj_al_balagha_arabic_full.json` من موقع `arabic.balaghah.net`، "
        "الذي يذكر في صفحة الفهرس أن الاقتباس مسموح مع ذكر المصدر. يحتفظ كل سجل برابطه المباشر. "
        "هذه المادة لا تحكم على الأسانيد وتحتاج مقابلة طبعة محققة في الدراسة الأكاديمية.\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(output)} records to {OUTPUT}")


if __name__ == "__main__":
    main()
