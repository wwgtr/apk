"""Create a concise coverage report from the streamed corpus manifest."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets/data/heritage/staging/open_imami_library_classification_manifest.json"
REPORT = ROOT / "notes/open-imami-corpus-coverage-v1.md"

FIGURES = (
    ("prophet", "النبي محمد ﷺ"),
    ("ali", "أمير المؤمنين علي عليه السلام"),
    ("fatima", "فاطمة الزهراء عليها السلام"),
    ("hasan", "الإمام الحسن عليه السلام"),
    ("husayn", "الإمام الحسين عليه السلام"),
    ("sajjad", "الإمام السجاد عليه السلام"),
    ("baqir", "الإمام الباقر عليه السلام"),
    ("sadiq", "الإمام الصادق عليه السلام"),
    ("kadhim", "الإمام الكاظم عليه السلام"),
    ("rida", "الإمام الرضا عليه السلام"),
    ("jawad", "الإمام الجواد عليه السلام"),
    ("hadi", "الإمام الهادي عليه السلام"),
    ("askari", "الإمام العسكري عليه السلام"),
    ("mahdi", "الإمام المهدي عجل الله فرجه"),
)


def table(rows: list[tuple[str, int]]) -> str:
    body = ["| المعصوم | مقاطع مرشحة |", "|---|---:|"]
    body.extend(f"| {name} | {count} |" for name, count in rows)
    return "\n".join(body)


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    figures = manifest["by_figure_candidate"]
    figure_rows = [(name, int(figures.get(key, 0))) for key, name in FIGURES]
    gaps = [name for name, count in figure_rows if count == 0]

    content_type_rows = "\n".join(
        f"| {name} | {count} |" for name, count in manifest["by_content_type_candidate"].items()
    )
    topic_rows = "\n".join(
        f"| {name} | {count} |" for name, count in manifest["by_topic_candidate"].items()
    )
    REPORT.write_text(
        f"""# تقرير تغطية corpus العربي الإمامي — دفعة الجمع الأولى

## النتيجة الكمية

جمعت الدفعة الخام **{manifest['unique_segments']:,} مقطعًا عربيًا فريدًا** من ثلاثة عشر مسارًا كتابيًا، وأزيل **{manifest['exact_duplicates_removed']}** تكرارًا مطابقًا حرفيًا. هذه الأرقام تقيس مقاطع المصدر، لا عدد الروايات المصححة ولا عدد النصوص المنسوبة يقينًا إلى كل معصوم.

## التغطية المرشحة بحسب المعصوم

{table(figure_rows)}

## التصنيف المرشح بحسب النوع

| النوع | المقاطع |
|---|---:|
{content_type_rows}

## التصنيف المرشح بحسب الموضوع

| الموضوع | المقاطع |
|---|---:|
{topic_rows}

## الفجوات الظاهرة

لا توجد في الدفعة الحالية مقاطع تطابق مرشحات الأسماء مباشرةً لـ: **{', '.join(gaps) if gaps else 'لا توجد فجوات اسمية'}**. ولا يعني ذلك عدم وجود هذه الشخصيات في المتون؛ فالنصوص قد تستخدم كنية أو ضميرًا أو سياقًا سابقًا. لذلك لا تُحل الفجوات بالحدس، بل بإضافة مرشحات مكنى وألقاب بعد مراجعة عينة لكل كتاب.

## قاعدة الإدماج

لا تُضاف المقاطع الخام كلها إلى واجهة التطبيق مباشرةً. الإدماج التالي ينتقي المواد التي تملك متنا متماسكًا وبيانات مصدرية، ويعرضها تحت عبارة **«منقول من مصدر»** أو **«يحتاج مقابلة طبعة»** بحسب مستوى الموضع. تظل بقية الدفعة في منطقة التجميع للمراجعة والفرز، كي لا تتحول المكتبة إلى نتائج بحث غير محررة.
""",
        encoding="utf-8",
    )
    print(f"Wrote {REPORT}")


if __name__ == "__main__":
    main()
