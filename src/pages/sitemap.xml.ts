// /sitemap.xml: every page on the site, for Google Search Console.
//
// Plain pages are found by reading src/pages, so a new page is listed without
// touching this file. Product, smells-like and city pages come from the same
// data their getStaticPaths use. `npm run build` then checks the result against
// the built site (scripts/check-sitemap.mjs) and fails if any page is missing.
import type { APIRoute } from 'astro';
import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { perfumes, smellsLikePages } from '../lib/data';
import { CITIES } from '../lib/cities';
import { abs } from '../lib/site';

interface Entry { path: string; lastmod?: string; images?: string[] }

function plainPages(dir = 'src/pages'): string[] {
  const out: string[] = [];
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, f.name);
    if (f.isDirectory()) out.push(...plainPages(full));
    else if (f.name.endsWith('.astro') && !f.name.startsWith('_') && !/\[|^404\./.test(f.name)) {
      const route = relative('src/pages', full).split(sep).join('/').replace(/(^|\/)index\.astro$/, '').replace(/\.astro$/, '');
      out.push(route ? `/${route}/` : '/');
    }
  }
  return out;
}

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function sitemapEntries(): Entry[] {
  return [
    ...plainPages().sort((a, b) => a.length - b.length || a.localeCompare(b)).map((path) => ({ path })),
    ...CITIES.map((c) => ({ path: `/delivery/${c.slug}/` })),
    ...smellsLikePages().map((l) => ({ path: `/smells-like/${l.slug}/` })),
    ...perfumes.map((p) => ({
      path: `/p/${p.slug}/`,
      lastmod: isDate(p.checkedOn) ? p.checkedOn : undefined,
      images: p.photo ? [abs(p.photo)] : undefined,
    })),
  ];
}

export const GET: APIRoute = () => {
  const urls = sitemapEntries().map((e) => {
    const parts = [`<loc>${esc(abs(e.path))}</loc>`];
    if (e.lastmod) parts.push(`<lastmod>${e.lastmod}</lastmod>`);
    for (const img of e.images ?? []) parts.push(`<image:image><image:loc>${esc(img)}</image:loc></image:image>`);
    return `  <url>${parts.join('')}</url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
