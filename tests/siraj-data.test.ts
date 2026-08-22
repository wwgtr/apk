import { describe, expect, it } from "vitest";

import { calendar, calendarDays, figureForEntry, heritageEntries, heritageFigures, heritageSections } from "@/lib/siraj-data";

describe("بيانات سراج الولاية", () => {
  it("يدمج تقويم 1448هـ المرفق كاملاً", () => {
    expect(calendar.year_hijri).toBe(1448);
    expect(calendar.months).toHaveLength(12);
    expect(calendarDays).toHaveLength(354);
    expect(calendarDays.filter((day) => day.events.length > 0)).toHaveLength(137);
  });

  it("يوفر نصوصاً قابلة للقراءة في الأقسام الثمانية", () => {
    expect(heritageEntries.length).toBeGreaterThanOrEqual(400);
    expect(heritageSections).toHaveLength(8);
    expect(heritageSections.every((section) => section.count > 0)).toBe(true);
    expect(heritageSections.find((section) => section.key === "visits")?.count).toBeGreaterThanOrEqual(80);
    expect(heritageSections.find((section) => section.key === "works")?.count).toBeGreaterThanOrEqual(180);
    expect(heritageEntries.filter((entry) => entry.text.length >= 180).length).toBeGreaterThanOrEqual(300);
    expect(heritageEntries.some((entry) => entry.text.startsWith("يفهرس الاحتجاج"))).toBe(false);
    expect(heritageFigures.filter((figure) => !heritageEntries.some((entry) => figureForEntry(entry) === figure.key)).map((figure) => figure.key)).toEqual([]);
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
