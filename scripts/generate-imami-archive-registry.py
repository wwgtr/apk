"""Generate literal Metro requires for locally bundled archive chunks."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets/data/heritage/archive/open_imami_archive_manifest.json"
OUTPUT = ROOT / "lib/siraj-archive.ts"


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    registry = "\n".join(
        f'  "{item["id"]}": () => require("../assets/data/heritage/archive/open_imami_library/{item["id"]}.json"),'
        for item in manifest
    )
    OUTPUT.write_text(
        f'''import archiveManifestRaw from "@/assets/data/heritage/archive/open_imami_archive_manifest.json";

export type ArchiveChunk = {{
  id: string;
  title: string;
  source_name: string;
  source_file: string;
  part: number;
  count: number;
  asset_path: string;
  description: string;
}};

export type ArchiveEntry = {{
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
}};

export const archiveChunks = archiveManifestRaw as ArchiveChunk[];

const chunkLoaders: Record<string, () => ArchiveEntry[]> = {{
{registry}
}};

export function archiveBooks() {{
  const groups = new Map<string, {{ sourceName: string; count: number; chunks: ArchiveChunk[] }}>();
  for (const chunk of archiveChunks) {{
    const current = groups.get(chunk.source_name) ?? {{ sourceName: chunk.source_name, count: 0, chunks: [] }};
    current.count += chunk.count;
    current.chunks.push(chunk);
    groups.set(chunk.source_name, current);
  }}
  return [...groups.values()].sort((left, right) => right.count - left.count);
}}

export function chunksForSource(sourceName: string) {{
  return archiveChunks.filter((chunk) => chunk.source_name === sourceName).sort((left, right) => left.part - right.part);
}}

export function loadArchiveChunk(id: string): ArchiveEntry[] {{
  return chunkLoaders[id]?.() ?? [];
}}
''',
        encoding="utf-8",
    )
    print(f"Wrote registry for {{len(manifest)}} chunks")


if __name__ == "__main__":
    main()
