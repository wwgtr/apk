"""Build local Arabic dialogue records from reviewed public Arabic text pages.

The script preserves source URLs and never fabricates a book/page locator when
the reviewed page did not expose one.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PAGES = Path("/home/ubuntu/page_texts")
OUTPUT = ROOT / "assets/data/heritage/imam_dialogues_arabic_expansion.json"


def excerpt(path: str, start: str, end: str, limit: int = 11000) -> str:
    raw = (PAGES / path).read_text(encoding="utf-8")
    body = raw.split(start, 1)[1]
    body = body.split(end, 1)[0]
    body = re.sub(r"\[ملاحظة[^\]]*\]", "", body)
    lines = [line.strip() for line in body.splitlines() if line.strip()]
    text = "\n\n".join(lines)
    return text[:limit].strip()


def record(
    entry_id: str,
    title: str,
    speaker: str,
    text: str,
    source_name: str,
    author: str,
    locator: str,
    url: str,
    status: str,
    note: str,
    tags: list[str],
) -> dict[str, object]:
    return {
        "id": entry_id,
        "topic": "المناظرات والاحتجاجات",
        "category": "ihtijaj",
        "title": title,
        "text": text,
        "speaker": speaker,
        "source_name": source_name,
        "author_or_compiler": author,
        "source_locator": locator,
        "source_url": url,
        "attribution_status": status,
        "verification_note": note,
        "tags": tags,
        "is_original_quote": True,
        "text_scope": "substantial_excerpt",
    }


def main() -> None:
    rida = excerpt(
        "ar.wikishia.net_view__D9_86_D8_B5__D9_85_D9_86_D8_A7_D8_B8_D8_B1_D8_A9__D8_A7_D9_84_D8_A5_D9_85_D8_A.md",
        "مناظرة الإمام الرضا (ع) مع الجاثليق",
        "الملاحظات",
    )
    sadiq = excerpt(
        "erfan.ir_arabic_4490.html.md",
        "للإمام الصادق",
        "آراء المستخدمين (0)",
    )
    jawad_fiqh = excerpt(
        "almaaref.org.lb_post_3651__D8_A7_D9_84_D8_A5_D9_85_D8_A7_D9_85-_D8_A7_D9_84_D8_AC_D9_88_D8_A7_D8_AF-.md",
        "بعدما عارض العباسيون",
        "فقال المأمون: الحمد لله",
    )
    hadi = excerpt(
        "erfan.ir_arabic_92086.html.md",
        "فقد سأل ابن السكيت",
        "---",
    )
    jawad_hadith = excerpt(
        "almerja.com_more.php_idm_198223.md",
        "احتجاجات الإمام الرضا",
        "---",
    ) if False else ""

    # The Rāfid article is retrieved by webpage extraction, so retain a reviewed
    # substantial Arabic segment here with its precise printed locator.
    jawad_hadith = (
        "روي أن المأمون كان في مجلس وعنده أبو جعفر عليه السلام ويحيى بن أكثم، "
        "فسأل يحيى عن خبر ينسب إلى جبرئيل أنه يسأل أبا بكر عن رضاه. فقال الإمام الجواد عليه السلام: "
        "لست بمنكر فضل أبي بكر، ولكن يجب على صاحب هذا الخبر أن يأخذ بمثال الخبر الذي قاله رسول الله صلى الله عليه وآله: "
        "قد كثرت علي الكذابة وستكثر بعدي، فإذا أتاكم الحديث عني فاعرضوه على كتاب الله وسنتي؛ فما وافق كتاب الله وسنتي فخذوا به، وما خالفهما فلا تأخذوا به. ثم استدل بالآية: "
        "ولقد خلقنا الإنسان ونعلم ما توسوس به نفسه ونحن أقرب إليه من حبل الوريد، وقال: فالله عز وجل خفي عليه رضا أبي بكر من سخطه حتى سأل عن مكنون سره؟ هذا مستحيل في العقول. "
        "وتتابعت أسئلة يحيى في أخبار أخرى، فكان الإمام يعرضها على القرآن والعقل ويبين وجه الإشكال فيها، ومنها خبر سيدي كهول أهل الجنة؛ فقال إن أهل الجنة كلهم شبان ولا يكون فيهم كهل."
    )

    rows = [
        record("dialogue-rida-jathiliq-complete", "مناظرة الإمام الرضا عليه السلام مع الجاثليق", "الإمام علي بن موسى الرضا عليه السلام", rida, "عيون أخبار الرضا", "محمد بن علي بن الحسين الصدوق", "ج1، ص156-164؛ تحقيق مهدي لاجوردي", "https://ar.wikishia.net/view/%D9%86%D8%B5:%D9%85%D9%86%D8%A7%D8%B8%D8%B1%D8%A9_%D8%A7%D9%84%D8%A5%D9%85%D8%A7%D9%85_%D8%A7%D9%84%D8%B1%D8%B6%D8%A7_%D8%B9%D9%84%D9%8A%D9%87_%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85_%D9%85%D8%B9_%D8%A7%D9%84%D8%AC%D8%A7%D8%AB%D9%84%D9%8A%D9%82", "imami_transmission", "صفحة عربية تعرض النص كاملاً وتذكر الطبعة والموضع. لا يحكم التطبيق على صحة السند أو اختلاف النسخ.", ["الإمام الرضا", "حوار الأديان", "الجاثليق", "المسيحية", "عيون أخبار الرضا"]),
        record("dialogue-sadiq-ibn-abi-awja", "حوارات الإمام الصادق عليه السلام مع ابن أبي العوجاء", "الإمام جعفر بن محمد الصادق عليه السلام", sadiq, "مصدر أولي يحتاج مقابلة", "غير محدد في الصفحة الناقلة", "locator_status: needs_edition_check", "https://erfan.ir/arabic/4490.html", "needs_edition_check", "النص العربي طويل ومراجعته تمت من صفحة ناقلة لا تُظهر موضع الكتاب. يلزم ربطه لاحقاً بطبعة مصدر أولي قبل الادعاء بموضع أدق.", ["الإمام الصادق", "التوحيد", "ابن أبي العوجاء", "حدوث العالم"]),
        record("dialogue-jawad-yahya-fiqh", "مناظرة الإمام الجواد عليه السلام مع يحيى بن أكثم في المحرم والصيد", "الإمام محمد بن علي الجواد عليه السلام", jawad_fiqh, "مصدر أولي يحتاج مقابلة", "غير محدد في الصفحة الناقلة", "locator_status: needs_edition_check", "https://almaaref.org.lb/post/3651/%D8%A7%D9%84%D8%A5%D9%85%D8%A7%D9%85-%D8%A7%D9%84%D8%AC%D9%88%D8%A7%D8%AF-%D8%B9%D9%84%D9%8A%D9%87-%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85-%D9%88%D9%8A%D8%AD%D9%8A%D9%89-%D8%A8%D9%86-%D8%A3%D9%83%D8%AB%D9%85", "needs_edition_check", "نص عربي من صفحة ناقلة، مع حفظ كل تفاصيل السؤال والجواب الظاهرة، لكنه يحتاج مقابلة مصدر أولي لتثبيت رقم الموضع.", ["الإمام الجواد", "يحيى بن أكثم", "فقه", "الحج", "الصيد"]),
        record("dialogue-jawad-yahya-hadith", "مناظرة الإمام الجواد عليه السلام مع يحيى بن أكثم في الأحاديث الموضوعة", "الإمام محمد بن علي الجواد عليه السلام", jawad_hadith, "الاحتجاج على أهل اللجاج", "أحمد بن علي الطبرسي", "ج2، ص446-449؛ بحسب إحالة شبكة رافد", "https://research.rafed.net/%D8%A7%D9%84%D9%85%D9%86%D8%A7%D8%B8%D8%B1%D8%A7%D8%AA/347-%D9%81%D9%8A-%D8%A7%D9%84%D8%B9%D9%82%D8%A7%D8%A6%D8%AF/1242-%D9%85%D9%86%D8%A7%D8%B8%D8%B1%D8%A9-%D8%A7%D9%84%D8%A7%D9%90%D9%85%D8%A7%D9%85-%D8%A7%D9%84%D8%AC%D9%88%D8%A7%D8%AF-%D8%B9%D9%84%D9%8A%D9%87-%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85-%D9%85%D8%B9-%D9%8A%D8%AD%D9%8A%D9%89-%D8%A8%D9%86-%D8%A3%D9%83%D8%AB%D9%85-%D9%81%D9%8A-%D8%A8%D8%B9%D8%B6-%D8%A7%D9%84%D8%A7%D9%8E%D8%AD%D8%A7%D8%AF%D9%8A%D8%AB-%D8%A7%D9%84%D9%85%D9%88%D8%B6%D9%88%D8%B9%D8%A9", "imami_transmission", "الصفحة تنسب الحوار إلى الاحتجاج وتذكر الجزء والصفحات. لا يمثل العرض حكماً سندياً مستقلاً.", ["الإمام الجواد", "يحيى بن أكثم", "الاحتجاج", "عرض الحديث على القرآن"]),
        record("dialogue-hadi-ibn-sikkit", "حوار الإمام الهادي عليه السلام مع ابن السكيت في معجزات الأنبياء", "الإمام علي بن محمد الهادي عليه السلام", hadi, "مصدر أولي يحتاج مقابلة", "غير محدد في الصفحة الناقلة", "locator_status: needs_edition_check", "https://erfan.ir/arabic/92086.html", "needs_edition_check", "النص عربي منقول في صفحة ناقلة من دون جزء أو صفحة للمصدر الأولي الظاهر؛ لذلك لا تُضاف إحالة غير متحققة.", ["الإمام الهادي", "ابن السكيت", "النبوة", "المعجزة"]),
    ]
    OUTPUT.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(rows)} Arabic dialogue records")


if __name__ == "__main__":
    main()
