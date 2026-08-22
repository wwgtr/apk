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

function add(section: HeritageSection, list: unknown): HeritageEntry[] {
  return Array.isArray(list) ? (list as RawEntry[]).map((row) => toEntry(row, section)) : [];
}

export const heritageEntries: HeritageEntry[] = [
  ...add("dua", duaSahifa),
  ...add("dua", duaIndividual),
  ...add("khutab", khitabNahj),
  ...add("khutab", khitabVerified),
  ...add("khutab", khitabExtended),
  ...add("khutab", khitabCoverage),
  ...add("sayings", sayingsReason),
  ...add("sayings", sayingsCharacter),
  ...add("sayings", sayingsRelations),
  ...add("sayings", sayingsSpiritual),
  ...add("sayings", sayingsCoverage),
  ...add("visits", visitsWeekly),
  ...add("works", worksDaily),
  ...add("works", worksMonthly),
  ...add("visits", visitsCatalog),
  ...add("wasaya", wasayaLetters),
  ...add("ihtijaj", ihtijaj),
  ...add("manaqib", manaqib),
];

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
