import { describe, expect, it } from "vitest";

import { archiveBooks, archiveChunks, chunksForSource, loadArchiveChunk } from "@/lib/siraj-archive";

describe("الأرشيف المحلي عند الطلب", () => {
  it("يفهرس corpus الموسع في كتب ودفعات صغيرة", () => {
    const books = archiveBooks();
    const total = books.reduce((sum, book) => sum + book.count, 0);

    expect(books.length).toBeGreaterThanOrEqual(10);
    expect(archiveChunks.length).toBeGreaterThan(50);
    expect(total).toBe(11245);
  });

  it("يحمّل دفعة واحدة فقط وتبقى بيانات المصدر والمتن متاحة", () => {
    const first = archiveChunks[0];
    const entries = loadArchiveChunk(first.id);

    expect(entries).toHaveLength(first.count);
    expect(entries[0]).toMatchObject({
      source_name: first.source_name,
      source_locator: expect.any(String),
      text: expect.any(String),
    });
    expect(chunksForSource(first.source_name).length).toBeGreaterThan(0);
  });
});
