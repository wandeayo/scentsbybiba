// Loads the perfume list from src/data/perfumes.csv at build time.
// Refresh that file from the Google Sheet with `npm run sync-sheet`.
import raw from '../data/perfumes.csv?raw';
import { existsSync } from 'node:fs';
import { familyGroup, type FamilyGroup } from './families';

export type Availability = 'in-store' | 'sold-before' | 'order-in';

export interface Perfume {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandKnown: boolean;
  type: string;
  gender: 'Men' | 'Women' | 'Unisex';
  family: string;
  group: FamilyGroup;
  occasions: string[];
  notes: string;
  smellsLike: string;
  longevity: number;
  projection: number;
  size: string;
  price: number;
  availability: Availability;
  description: string;
  checkedOn: string;
  photo: string;      // URL of a product photo, or '' to use the drawn bottle
  photoCutout: boolean; // true when the photo is a bottle on a transparent background
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function availabilityOf(kind: string): Availability {
  if (kind.startsWith('In store')) return 'in-store';
  if (kind.startsWith('Sold before')) return 'sold-before';
  return 'order-in';
}

// A photo_url in the sheet wins. Otherwise a cut-out bottle in public/products/<slug>.webp is used.
// Cut-outs sit on the arch like the drawings; any other photo fills the frame.
function photoFor(slug: string, url: string): { photo: string; photoCutout: boolean } {
  if (url) return { photo: url, photoCutout: /\/products\/[^/]+\.webp$/.test(url) };
  const local = `public/products/${slug}.webp`;
  return existsSync(local) ? { photo: `/products/${slug}.webp`, photoCutout: true } : { photo: '', photoCutout: false };
}

const [header, ...body] = parseCSV(raw);
const col = (name: string) => header.indexOf(name);

const seen = new Set<string>();
export const perfumes: Perfume[] = body.map((r) => {
  const get = (k: string) => (r[col(k)] ?? '').trim();
  const brand = get('brand');
  const brandKnown = !/confirm/i.test(brand);
  const name = get('name');
  let slug = slugify(brandKnown ? `${name} ${brand}` : name);
  while (seen.has(slug)) slug += '-2';
  seen.add(slug);
  const family = get('scent_family');
  return {
    id: get('id'),
    slug,
    name,
    brand: brandKnown ? brand : '',
    brandKnown,
    type: get('type'),
    gender: (get('gender') as Perfume['gender']) || 'Unisex',
    family,
    group: familyGroup(family, get('key_notes')),
    occasions: get('occasions').split(',').map((s) => s.trim()).filter(Boolean),
    notes: /to confirm|varies/i.test(get('key_notes')) ? '' : get('key_notes'),
    smellsLike: get('smells_like'),
    longevity: Number(get('longevity_1to3')) || 0,
    projection: Number(get('projection_1to3')) || 0,
    size: get('size_ml'),
    price: Number(get('price_ngn')) || 0,
    availability: availabilityOf(get('kind')),
    description: get('description'),
    checkedOn: get('price_checked_on'),
    ...photoFor(slug, col('photo_url') >= 0 ? get('photo_url') : ''),
  };
});

export const bySlug = new Map(perfumes.map((p) => [p.slug, p]));

export function similar(p: Perfume, n = 4): Perfume[] {
  return perfumes
    .filter((q) => q.slug !== p.slug && q.group === p.group && q.type !== 'Home')
    .map((q) => ({
      q,
      score:
        (q.availability === 'in-store' ? 3 : q.availability === 'sold-before' ? 2 : 0) +
        (q.gender === p.gender || q.gender === 'Unisex' ? 2 : 0) -
        Math.abs(q.price - p.price) / 20000,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.q);
}

export function smellsLikeIndex(): { name: string; slug: string; items: Perfume[] }[] {
  const map = new Map<string, Perfume[]>();
  for (const p of perfumes) {
    if (!p.smellsLike || /style|to confirm/i.test(p.smellsLike)) continue;
    const key = p.smellsLike.replace(/\s*\(.*\)$/, '');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  return [...map.entries()]
    .map(([name, items]) => ({
      name,
      slug: slugify(name),
      items: items.sort((a, b) => a.price - b.price),
    }))
    .sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name));
}

// Comparisons that get their own /smells-like/<slug>/ page: at least one inspired
// alternative, not only the designer original.
export function smellsLikePages() {
  return smellsLikeIndex().filter((l) => l.items.some((p) => !/Designer|Niche/.test(p.type)));
}

export const availabilityLabel: Record<Availability, string> = {
  'in-store': 'In the boutique',
  'sold-before': 'Ask if it’s in stock',
  'order-in': 'Order-in',
};

export function priceLabel(p: Perfume): string {
  const n = '₦' + p.price.toLocaleString('en-NG');
  return p.availability === 'order-in' ? `About ${n}` : n;
}

// What the order bag keeps about a perfume. Short keys keep the saved bag small.
export interface BagItem { s: string; n: string; b: string; z: string; r: string; p: number; a: Availability }
export function bagItem(p: Perfume): string {
  const item: BagItem = { s: p.slug, n: p.name, b: p.brandKnown ? p.brand : '', z: p.size, r: p.id, p: p.price, a: p.availability };
  return JSON.stringify(item);
}

export function orderMessage(p: Perfume, query?: string, city?: string): string {
  const price = priceLabel(p);
  const what = `${p.name}${p.brand ? ` by ${p.brand}` : ''} (${price})`;
  if (query) return `Hi Biba, I was looking for "${query}" on your website and saw ${what}. Is it available?`;
  if (city) return `Hi Biba, I’m in ${city} and I’d like ${what}. How much is delivery?`;
  return `Hi Biba, I’d like ${what}. I saw it on your website.`;
}
