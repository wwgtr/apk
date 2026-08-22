import archiveManifestRaw from "@/assets/data/heritage/archive/open_imami_archive_manifest.json";

export type ArchiveChunk = {
  id: string;
  title: string;
  source_name: string;
  source_file: string;
  part: number;
  count: number;
  asset_path: string;
  description: string;
};

export type ArchiveEntry = {
  id: string;
  title: string;
  text: string;
  source_name: string;
  author_or_compiler: string;
  source_locator: string;
  source_url: string;
  attribution_status: string;
  verification_note: string;
  tags: string[];
  figure_candidates?: string[];
  topic_candidates?: string[];
  content_type_candidate?: string;
};

export const archiveChunks = archiveManifestRaw as ArchiveChunk[];

const chunkLoaders: Record<string, () => ArchiveEntry[]> = {
  "u0627-u0644-u0627-u062d-u062a-u062c-u0627-u06-01": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0627-u062d-u062a-u062c-u0627-u06-01.json"),
  "u0627-u0644-u0627-u062d-u062a-u062c-u0627-u06-02": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0627-u062d-u062a-u062c-u0627-u06-02.json"),
  "u0627-u0644-u0627-u062d-u062a-u062c-u0627-u06-03": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0627-u062d-u062a-u062c-u0627-u06-03.json"),
  "u062f-u0644-u0627-u0626-u0644-u0627-u0644-u06-01": () => require("../assets/data/heritage/archive/open_imami_library/u062f-u0644-u0627-u0626-u0644-u0627-u0644-u06-01.json"),
  "u062f-u0644-u0627-u0626-u0644-u0627-u0644-u06-02": () => require("../assets/data/heritage/archive/open_imami_library/u062f-u0644-u0627-u0626-u0644-u0627-u0644-u06-02.json"),
  "u062f-u0644-u0627-u0626-u0644-u0627-u0644-u06-03": () => require("../assets/data/heritage/archive/open_imami_library/u062f-u0644-u0627-u0626-u0644-u0627-u0644-u06-03.json"),
  "u062f-u0644-u0627-u0626-u0644-u0627-u0644-u06-04": () => require("../assets/data/heritage/archive/open_imami_library/u062f-u0644-u0627-u0626-u0644-u0627-u0644-u06-04.json"),
  "u062a-u062d-u0641-u0627-u0644-u0639-u0642-u06-01": () => require("../assets/data/heritage/archive/open_imami_library/u062a-u062d-u0641-u0627-u0644-u0639-u0642-u06-01.json"),
  "u062a-u062d-u0641-u0627-u0644-u0639-u0642-u06-02": () => require("../assets/data/heritage/archive/open_imami_library/u062a-u062d-u0641-u0627-u0644-u0639-u0642-u06-02.json"),
  "u062a-u062d-u0641-u0627-u0644-u0639-u0642-u06-03": () => require("../assets/data/heritage/archive/open_imami_library/u062a-u062d-u0641-u0627-u0644-u0639-u0642-u06-03.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book-txt-01": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book-txt-01.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book-txt-02": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book-txt-02.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book-txt-03": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book-txt-03.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book-txt-04": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book-txt-04.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book2-txt-01": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book2-txt-01.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book2-txt-02": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book2-txt-02.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book2-txt-03": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book2-txt-03.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book2-txt-04": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book2-txt-04.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book3-txt-01": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book3-txt-01.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book3-txt-02": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book3-txt-02.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book3-txt-03": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book3-txt-03.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book3-txt-04": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book3-txt-04.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book4-txt-01": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book4-txt-01.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book4-txt-02": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book4-txt-02.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book4-txt-03": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book4-txt-03.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book4-txt-04": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book4-txt-04.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book5-txt-01": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book5-txt-01.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book5-txt-02": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book5-txt-02.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book5-txt-03": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book5-txt-03.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book5-txt-04": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book5-txt-04.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book6-txt-01": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book6-txt-01.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book6-txt-02": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book6-txt-02.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book6-txt-03": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book6-txt-03.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book6-txt-04": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book6-txt-04.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book7-txt-01": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book7-txt-01.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book7-txt-02": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book7-txt-02.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book7-txt-03": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book7-txt-03.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book8-txt-01": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book8-txt-01.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book8-txt-02": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book8-txt-02.json"),
  "u0627-u0644-u0643-u0627-u0641-u064a-book8-txt-03": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0643-u0627-u0641-u064a-book8-txt-03.json"),
  "u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-01": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-01.json"),
  "u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-02": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-02.json"),
  "u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-03": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-03.json"),
  "u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-04": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-04.json"),
  "u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-05": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-05.json"),
  "u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-06": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-06.json"),
  "u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-07": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-07.json"),
  "u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-08": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-08.json"),
  "u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-09": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-09.json"),
  "u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-10": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-10.json"),
  "u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-11": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u0623-u0645-u0627-u0644-u064a-boo-11.json"),
  "u0627-u0644-u062a-u0648-u062d-u064a-u062f-boo-01": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u062a-u0648-u062d-u064a-u062f-boo-01.json"),
  "u0627-u0644-u062a-u0648-u062d-u064a-u062f-boo-02": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u062a-u0648-u062d-u064a-u062f-boo-02.json"),
  "u0627-u0644-u062a-u0648-u062d-u064a-u062f-boo-03": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u062a-u0648-u062d-u064a-u062f-boo-03.json"),
  "u0643-u0645-u0627-u0644-u0627-u0644-u062f-u06-01": () => require("../assets/data/heritage/archive/open_imami_library/u0643-u0645-u0627-u0644-u0627-u0644-u062f-u06-01.json"),
  "u0643-u0645-u0627-u0644-u0627-u0644-u062f-u06-02": () => require("../assets/data/heritage/archive/open_imami_library/u0643-u0645-u0627-u0644-u0627-u0644-u062f-u06-02.json"),
  "u0627-u0644-u062e-u0635-u0627-u0644-book-txt-01": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u062e-u0635-u0627-u0644-book-txt-01.json"),
  "u0627-u0644-u062e-u0635-u0627-u0644-book-txt-02": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u062e-u0635-u0627-u0644-book-txt-02.json"),
  "u0627-u0644-u063a-u064a-u0628-u0629-book-txt-01": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u063a-u064a-u0628-u0629-book-txt-01.json"),
  "u0627-u0644-u063a-u064a-u0628-u0629-book-txt-02": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u063a-u064a-u0628-u0629-book-txt-02.json"),
  "u0627-u0644-u063a-u064a-u0628-u0629-book-txt-03": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u063a-u064a-u0628-u0629-book-txt-03.json"),
  "u0627-u0644-u063a-u064a-u0628-u0629-book-txt-04": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u063a-u064a-u0628-u0629-book-txt-04.json"),
  "u0627-u0644-u063a-u064a-u0628-u0629-book-txt-05": () => require("../assets/data/heritage/archive/open_imami_library/u0627-u0644-u063a-u064a-u0628-u0629-book-txt-05.json"),
  "u0639-u0644-u0644-u0627-u0644-u0634-u0631-u06-01": () => require("../assets/data/heritage/archive/open_imami_library/u0639-u0644-u0644-u0627-u0644-u0634-u0631-u06-01.json"),
  "u0639-u0644-u0644-u0627-u0644-u0634-u0631-u06-02": () => require("../assets/data/heritage/archive/open_imami_library/u0639-u0644-u0644-u0627-u0644-u0634-u0631-u06-02.json"),
  "u0645-u0639-u0627-u0646-u064a-u0627-u0644-u06-01": () => require("../assets/data/heritage/archive/open_imami_library/u0645-u0639-u0627-u0646-u064a-u0627-u0644-u06-01.json"),
  "u0645-u0639-u0627-u0646-u064a-u0627-u0644-u06-02": () => require("../assets/data/heritage/archive/open_imami_library/u0645-u0639-u0627-u0646-u064a-u0627-u0644-u06-02.json"),
  "u0645-u0639-u0627-u0646-u064a-u0627-u0644-u06-03": () => require("../assets/data/heritage/archive/open_imami_library/u0645-u0639-u0627-u0646-u064a-u0627-u0644-u06-03.json"),
  "u0642-u0631-u0628-u0627-u0644-u0625-u0633-u06-01": () => require("../assets/data/heritage/archive/open_imami_library/u0642-u0631-u0628-u0627-u0644-u0625-u0633-u06-01.json"),
  "u0642-u0631-u0628-u0627-u0644-u0625-u0633-u06-02": () => require("../assets/data/heritage/archive/open_imami_library/u0642-u0631-u0628-u0627-u0644-u0625-u0633-u06-02.json"),
  "u0642-u0631-u0628-u0627-u0644-u0625-u0633-u06-03": () => require("../assets/data/heritage/archive/open_imami_library/u0642-u0631-u0628-u0627-u0644-u0625-u0633-u06-03.json"),
  "u062a-u0641-u0633-u064a-u0631-u0627-u0644-u06-01": () => require("../assets/data/heritage/archive/open_imami_library/u062a-u0641-u0633-u064a-u0631-u0627-u0644-u06-01.json"),
  "u062a-u0641-u0633-u064a-u0631-u0627-u0644-u06-02": () => require("../assets/data/heritage/archive/open_imami_library/u062a-u0641-u0633-u064a-u0631-u0627-u0644-u06-02.json"),
  "u062a-u0641-u0633-u064a-u0631-u0627-u0644-u06-03": () => require("../assets/data/heritage/archive/open_imami_library/u062a-u0641-u0633-u064a-u0631-u0627-u0644-u06-03.json"),
};

export function archiveBooks() {
  const groups = new Map<string, { sourceName: string; count: number; chunks: ArchiveChunk[] }>();
  for (const chunk of archiveChunks) {
    const current = groups.get(chunk.source_name) ?? { sourceName: chunk.source_name, count: 0, chunks: [] };
    current.count += chunk.count;
    current.chunks.push(chunk);
    groups.set(chunk.source_name, current);
  }
  return [...groups.values()].sort((left, right) => right.count - left.count);
}

export function chunksForSource(sourceName: string) {
  return archiveChunks.filter((chunk) => chunk.source_name === sourceName).sort((left, right) => left.part - right.part);
}

export function loadArchiveChunk(id: string): ArchiveEntry[] {
  return chunkLoaders[id]?.() ?? [];
}
