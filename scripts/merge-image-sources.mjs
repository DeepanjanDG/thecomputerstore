// Merges JSON from stdin into prisma/seed/image-sources.json (helper for collecting sources).
import { readFileSync, writeFileSync } from "node:fs";
const file = "prisma/seed/image-sources.json";
const cur = JSON.parse(readFileSync(file, "utf8"));
const add = JSON.parse(readFileSync(0, "utf8"));
Object.assign(cur, add);
const sorted = Object.fromEntries(Object.entries(cur).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(file, JSON.stringify(sorted, null, 2) + "\n");
console.log(`${Object.keys(add).length} added/updated, ${Object.keys(sorted).length} total`);
