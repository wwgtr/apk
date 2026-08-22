import { describe, expect, it } from "vitest";

import { calendar, calendarDays, heritageEntries, heritageSections } from "@/lib/siraj-data";

describe("بيانات سراج الولاية", () => {
  it("يدمج تقويم 1448هـ المرفق كاملاً", () => {
    expect(calendar.year_hijri).toBe(1448);
    expect(calendar.months).toHaveLength(12);
    expect(calendarDays).toHaveLength(354);
    expect(calendarDays.filter((day) => day.events.length > 0)).toHaveLength(137);
  });

  it("يوفر مجموعات التراث الثماني المدمجة", () => {
    expect(heritageEntries.length).toBeGreaterThanOrEqual(537);
    expect(heritageSections).toHaveLength(8);
    expect(heritageSections.find((section) => section.key === "dua")?.count).toBeGreaterThan(0);
    expect(heritageSections.find((section) => section.key === "khutab")?.count).toBeGreaterThan(0);
  });

  it("يحافظ على بيانات المصدر في كل سجل", () => {
    for (const entry of heritageEntries) {
      expect(entry.id).toBeTruthy();
      expect(entry.sourceName).toBeTruthy();
      expect(entry.sourceLocator).toBeTruthy();
      expect(entry.attributionStatus).toBeTruthy();
    }
  });
});
