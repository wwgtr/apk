import calendarRaw from "@/assets/data/hijri_calendar_1448_complete.json";
import duaSahifa from "@/assets/data/heritage/ahlulbayt_dua_corpus__01_sahifa_sajjadiya_full.json";
import duaIndividual from "@/assets/data/heritage/ahlulbayt_dua_corpus__02_individual_attributions.json";
import khitabNahj from "@/assets/data/heritage/ahlulbayt_khutab_corpus__01_nahj_al_balagha_sermons_index.json";
import khitabVerified from "@/assets/data/heritage/ahlulbayt_khutab_corpus__02_verified_khutab_catalog.json";
import khitabExtended from "@/assets/data/heritage/ahlulbayt_khutab_corpus__03_extended_discourses_not_strict_khutab.json";
import khitabCoverage from "@/assets/data/heritage/ahlulbayt_khutab_corpus__04_coverage_notes.json";
import sayingsReason from "@/assets/data/heritage/ahlulbayt_sayings_advice_corpus__01_knowledge_reason.json";
import sayingsCharacter from "@/assets/data/heritage/ahlulbayt_sayings_advice_corpus__02_character_self.json";
import sayingsRelations from "@/assets/data/heritage/ahlulbayt_sayings_advice_corpus__03_social_relations.json";
import sayingsSpiritual from "@/assets/data/heritage/ahlulbayt_sayings_advice_corpus__04_spiritual_practice.json";
import sayingsCoverage from "@/assets/data/heritage/ahlulbayt_sayings_advice_corpus__05_source_catalogs_coverage.json";
import visitsWeekly from "@/assets/data/heritage/ahlulbayt_visits_works_corpus__01_weekly_visits.json";
import worksDaily from "@/assets/data/heritage/ahlulbayt_visits_works_corpus__02_daily_weekly_works.json";
import worksMonthly from "@/assets/data/heritage/ahlulbayt_visits_works_corpus__03_monthly_works_calendar.json";
import visitsCatalog from "@/assets/data/heritage/ahlulbayt_visits_works_corpus__04_ziyarat_catalog.json";
import wasayaLetters from "@/assets/data/heritage/ahlulbayt_wasaya_ihtijaj_manaqib_corpus__01_wasaya_letters_tawqi_at.json";
import ihtijaj from "@/assets/data/heritage/ahlulbayt_wasaya_ihtijaj_manaqib_corpus__02_ihtijaj_munazarat.json";
import manaqib from "@/assets/data/heritage/ahlulbayt_wasaya_ihtijaj_manaqib_corpus__03_manaqib_karamat.json";
import nahjFull from "@/assets/data/heritage/open_source_nahj_al_balagha_full.json";
import mafatihFull from "@/assets/data/heritage/open_source_mafatih_full.json";
import enrichedReadings from "@/assets/data/heritage/enriched_ihtijaj_manaqib_readings.json";
import expandedIhtijajManaqib from "@/assets/data/heritage/expanded_ihtijaj_manaqib_readings.json";
import riyadManaqib from "@/assets/data/heritage/manaqib_riyad_al_nadra_excerpts.json";
import nahjArabicFull from "@/assets/data/heritage/nahj_al_balagha_arabic_full.json";

export type HeritageSection = "dua" | "visits" | "works" | "khutab" | "sayings" | "wasaya" | "ihtijaj" | "manaqib";

export type HeritageEntry = {
  id: string;
  title: string;
  text: string;
  speaker: string;
  topic: string;
  section: HeritageSection;
  sourceName: string;
  authorOrCompiler: string;
  sourceLocator: string;
  sourceUrl: string;
  attributionStatus: string;
  verificationNote: string;
  tags: string[];
  isOriginalQuote: boolean;
};

type RawEntry = Record<string, unknown>;

export type CalendarDay = {
  hijri_day: number;
  day_of_week: string;
  gregorian_date: string;
  iso_date: string;
  events: string[];
};

export type CalendarMonth = {
  month_order: number;
  name: string;
  year_hijri: number;
  total_days: number;
  gregorian_period: string;
  crescent_forecast?: {
    primary_night?: { visibility_expectation?: string } | null;
  };
  days: CalendarDay[];
};

const sectionMeta: Record<HeritageSection, { title: string; color: string; icon: string }> = {
  dua: { title: "الأدعية", color: "#0C6B61", icon: "auto-stories" },
  visits: { title: "الزيارات", color: "#B88737", icon: "place" },
  works: { title: "الأعمال", color: "#6D5D9F", icon: "check-circle" },
  khutab: { title: "الخطب", color: "#9B4A3D", icon: "format-quote" },
  sayings: { title: "الأقوال", color: "#2E6F9E", icon: "lightbulb" },
  wasaya: { title: "الوصايا", color: "#7A5E35", icon: "mail-outline" },
  ihtijaj: { title: "الاحتجاجات", color: "#865A76", icon: "forum" },
  manaqib: { title: "المناقب", color: "#3F7A72", icon: "stars" },
};

function asText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toEntry(raw: RawEntry, section: HeritageSection): HeritageEntry {
  const text = asText(raw.text);
  const topic = asText(raw.topic, sectionMeta[section].title);
  const explicitTitle = asText(raw.title);
  return {
    id: asText(raw.id),
    title: explicitTitle || topic || text.slice(0, 48),
    text,
    speaker: asText(raw.speaker, "غير محدد"),
    topic,
    section,
    sourceName: asText(raw.source_name, "المصدر غير مدرج"),
    authorOrCompiler: asText(raw.author_or_compiler),
    sourceLocator: asText(raw.source_locator, "يحتاج إلى مقابلة طبعة"),
    sourceUrl: asText(raw.source_url),
    attributionStatus: asText(raw.attribution_status, "needs_edition_check"),
    verificationNote: asText(raw.verification_note),
    tags: Array.isArray(raw.tags) ? raw.tags.filter((tag): tag is string => typeof tag === "string") : [],
    isOriginalQuote: raw.is_original_quote === true,
  };
}

function isReadableEntry(raw: RawEntry) {
  const category = asText(raw.category);
  const textScope = asText(raw.text_scope);
  return Boolean(asText(raw.text).trim()) && category !== "source_catalog_or_coverage" && !textScope.includes("catalog");
}

function add(section: HeritageSection, list: unknown): HeritageEntry[] {
  return Array.isArray(list) ? (list as RawEntry[]).filter(isReadableEntry).map((row) => toEntry(row, section)) : [];
}

export const heritageEntries: HeritageEntry[] = [
  ...add("dua", duaSahifa),
  ...add("dua", duaIndividual),
  ...add("khutab", (nahjArabicFull as RawEntry[]).filter((row) => asText(row.id).startsWith("balaghah-khutab-"))),
  ...add("wasaya", (nahjArabicFull as RawEntry[]).filter((row) => asText(row.id).startsWith("balaghah-wasaya-"))),
  ...add("sayings", (nahjArabicFull as RawEntry[]).filter((row) => asText(row.id).startsWith("balaghah-sayings-"))),
  ...add("khutab", (nahjFull as RawEntry[]).filter((row) => asText(row.id).startsWith("nahj-khutab-"))),
  ...add("khutab", khitabNahj),
  ...add("khutab", khitabVerified),
  ...add("khutab", khitabExtended),
  ...add("khutab", khitabCoverage),
  ...add("sayings", (nahjFull as RawEntry[]).filter((row) => asText(row.id).startsWith("nahj-sayings-"))),
  ...add("sayings", sayingsReason),
  ...add("sayings", sayingsCharacter),
  ...add("sayings", sayingsRelations),
  ...add("sayings", sayingsSpiritual),
  ...add("sayings", sayingsCoverage),
  ...add("visits", (mafatihFull as RawEntry[]).filter((row) => asText(row.id).startsWith("mafatih-visits-"))),
  ...add("visits", visitsWeekly),
  ...add("works", (mafatihFull as RawEntry[]).filter((row) => asText(row.id).startsWith("mafatih-works-"))),
  ...add("works", worksDaily),
  ...add("works", worksMonthly),
  ...add("visits", visitsCatalog),
  ...add("wasaya", (nahjFull as RawEntry[]).filter((row) => asText(row.id).startsWith("nahj-wasaya-"))),
  ...add("wasaya", wasayaLetters),
  ...add("ihtijaj", (enrichedReadings as RawEntry[]).filter((row) => asText(row.id).startsWith("ihtijaj-"))),
  ...add("ihtijaj", (expandedIhtijajManaqib as RawEntry[]).filter((row) => asText(row.id).startsWith("ihtijaj-"))),
  ...add("ihtijaj", ihtijaj),
  ...add("manaqib", (enrichedReadings as RawEntry[]).filter((row) => asText(row.id).startsWith("manaqib-"))),
  ...add("manaqib", (expandedIhtijajManaqib as RawEntry[]).filter((row) => asText(row.id).startsWith("manaqib-"))),
  ...add("manaqib", riyadManaqib),
  ...add("manaqib", manaqib),
];

export const heritageFigures = [
  { key: "prophet", label: "النبي ﷺ", terms: ["النبي", "الرسول", "محمد"] },
  { key: "ali", label: "علي ع", terms: ["الإمام علي", "أمير المؤمنين", "علي بن أبي طالب"] },
  { key: "hasan", label: "الحسن ع", terms: ["الإمام الحسن", "الحسن بن علي"] },
  { key: "husayn", label: "الحسين ع", terms: ["الإمام الحسين", "الحسين بن علي"] },
  { key: "sajjad", label: "السجاد ع", terms: ["السجاد", "زين العابدين", "علي بن الحسين"] },
  { key: "baqir", label: "الباقر ع", terms: ["محمد الباقر", "الإمام الباقر", "الباقر"] },
  { key: "sadiq", label: "الصادق ع", terms: ["الصادق", "جعفر بن محمد"] },
  { key: "kadhim", label: "الكاظم ع", terms: ["الكاظم", "موسى بن جعفر"] },
  { key: "rida", label: "الرضا ع", terms: ["الرضا", "علي بن موسى"] },
  { key: "jawad", label: "الجواد ع", terms: ["محمد بن علي الجواد", "الإمام الجواد", "الجواد"] },
  { key: "hadi", label: "الهادي ع", terms: ["علي بن محمد الهادي", "علي النقي", "الإمام الهادي", "الهادي"] },
  { key: "askari", label: "العسكري ع", terms: ["الحسن العسكري", "الإمام العسكري", "العسكري"] },
  { key: "mahdi", label: "المهدي عج", terms: ["المهدي", "الحجة", "القائم"] },
] as const;

export function figureForEntry(entry: HeritageEntry) {
  const haystack = `${entry.speaker} ${entry.title} ${entry.tags.join(" ")}`;
  const matches = heritageFigures.flatMap((figure) => figure.terms.filter((term) => haystack.includes(term)).map((term) => ({ figure, term })));
  return matches.sort((left, right) => right.term.length - left.term.length)[0]?.figure.key;
}

export const heritageSections = (Object.keys(sectionMeta) as HeritageSection[]).map((key) => ({
  key,
  ...sectionMeta[key],
  count: heritageEntries.filter((entry) => entry.section === key).length,
}));

export const calendar = calendarRaw as {
  title: string;
  source: string;
  year_hijri: number;
  general_info: { introduction: string };
  months: CalendarMonth[];
};

export const calendarDays = calendar.months.flatMap((month) =>
  month.days.map((day) => ({ ...day, monthName: month.name, monthOrder: month.month_order })),
);

export function getEntryById(id: string | string[] | undefined) {
  const normalized = Array.isArray(id) ? id[0] : id;
  return heritageEntries.find((entry) => entry.id === normalized);
}

export function getCalendarDay(isoDate: string | string[] | undefined) {
  const normalized = Array.isArray(isoDate) ? isoDate[0] : isoDate;
  return calendarDays.find((day) => day.iso_date === normalized);
}

export function displayAttribution(status: string) {
  const map: Record<string, string> = {
    imami_transmission: "منقول في مصدر إمامي",
    meaning_paraphrase: "تلخيص أو نقل بالمعنى",
    attribution_disputed: "نسبة تحتاج مراجعة",
    needs_edition_check: "يحتاج مقابلة طبعة",
  };
  return map[status] ?? "بيانات مصدرية";
}

export function getSectionMeta(section: HeritageSection) {
  return sectionMeta[section];
}
