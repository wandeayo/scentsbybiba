// Pulls the perfume list from the published Google Sheet into src/data/perfumes.csv.
// In Google Sheets: File > Share > Publish to web > the Perfumes tab > CSV, then copy the link.
// Run: SHEET_CSV_URL="https://docs.google.com/.../pub?output=csv" npm run sync-sheet
import { writeFile } from 'node:fs/promises';

const url = process.env.SHEET_CSV_URL;
if (!url) {
  console.error('Set SHEET_CSV_URL to the published CSV link of the Perfumes tab.');
  process.exit(1);
}
const res = await fetch(url);
if (!res.ok) {
  console.error(`Could not download the sheet: ${res.status} ${res.statusText}`);
  process.exit(1);
}
const text = await res.text();
const header = text.split(/\r?\n/, 1)[0];
for (const col of ['name', 'brand', 'price_ngn', 'kind', 'scent_family', 'gender']) {
  if (!header.split(',').includes(col)) {
    console.error(`The sheet is missing the "${col}" column, so nothing was changed.`);
    process.exit(1);
  }
}
await writeFile(new URL('../src/data/perfumes.csv', import.meta.url), text);
console.log(`Saved ${text.trim().split(/\r?\n/).length - 1} perfumes to src/data/perfumes.csv`);
