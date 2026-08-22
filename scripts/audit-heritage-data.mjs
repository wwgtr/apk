import fs from "node:fs";
import path from "node:path";

const heritageDir = path.resolve("assets/data/heritage");
const files = fs.readdirSync(heritageDir).filter((name) => name.endsWith(".json"));

function inferredSection(fileName, row) {
  const id = typeof row.id === "string" ? row.id : "";
  if (id.includes("balaghah-khutab")) return "khutab";
  if (id.includes("balaghah-wasaya")) return "wasaya";
  if (id.includes("balaghah-sayings")) return "sayings";
  if (id.startsWith("dialogue-")) return "ihtijaj";
  if (id.startsWith("ihtijaj-")) return "ihtijaj";
  if (id.startsWith("manaqib-")) return "manaqib";
  if (fileName.includes("enriched_ihtijaj")) return row.tags?.includes("مناقب") ? "manaqib" : "ihtijaj";
  if (fileName.includes("__01_wasaya")) return "wasaya";
  if (fileName.includes("__02_ihtijaj")) return "ihtijaj";
  if (fileName.includes("__03_manaqib")) return "manaqib";
  if (fileName.includes("visits_works")) {
    return fileName.includes("daily_weekly") || fileName.includes("monthly_works") ? "works" : "visits";
  }
  if (fileName.includes("dua")) return "dua";
  if (fileName.includes("khutab")) return "khutab";
  if (fileName.includes("sayings")) return "sayings";
  return "unknown";
}

const report = {};
for (const fileName of files) {
  const rows = JSON.parse(fs.readFileSync(path.join(heritageDir, fileName), "utf8"));
  for (const row of rows) {
    const section = inferredSection(fileName, row);
    const contentLength = typeof row.text === "string" ? row.text.trim().length : 0;
    const isCoverage = row.category === "source_catalog_or_coverage" || row.text_scope === "coverage_note";
    const hasSubstantiveText = contentLength >= 180 && !isCoverage;
    report[section] ??= { total: 0, substantive: 0, catalogOrShort: 0 };
    report[section].total += 1;
    if (hasSubstantiveText) report[section].substantive += 1;
    else report[section].catalogOrShort += 1;
  }
}

console.table(report);
console.log("\nنصوص كاملة فقط:", Object.fromEntries(Object.entries(report).map(([section, counts]) => [section, counts.substantive])));
