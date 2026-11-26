// Runs after `astro build`. Fails the build if the sitemap and the built site disagree:
// a page Google can't find, or a sitemap link that leads nowhere.
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const dist = 'dist';
const xml = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
const listed = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1].replace(/&amp;/g, '&')).pathname));

function pages(dir) {
  const out = [];
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, f.name);
    if (f.isDirectory()) out.push(...pages(full));
    else if (f.name === 'index.html') {
      const html = readFileSync(full, 'utf8');
      // Redirect stubs and noindex pages don't belong in a sitemap.
      if (/http-equiv="refresh"|name="robots" content="[^"]*noindex/i.test(html)) continue;
      const route = relative(dist, dir).split(sep).join('/');
      out.push(route ? `/${route}/` : '/');
    }
  }
  return out;
}

const built = new Set(pages(dist));
const missing = [...built].filter((p) => !listed.has(p));
const dead = [...listed].filter((p) => !built.has(p));

if (missing.length || dead.length) {
  if (missing.length) console.error(`Pages missing from sitemap.xml:\n  ${missing.join('\n  ')}`);
  if (dead.length) console.error(`sitemap.xml lists pages that don't exist:\n  ${dead.join('\n  ')}`);
  process.exit(1);
}
console.log(`sitemap.xml lists all ${built.size} pages.`);
