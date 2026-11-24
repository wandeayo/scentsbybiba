// "Ask the shop" search. Runs in the browser over the compact product list.
// Version 1 reads the request with keyword rules. Version 2 can send the
// request plus the top candidates to an AI model; keep `rank` as the fallback.

export interface Item {
  s: string;   // slug
  n: string;   // name
  b: string;   // brand
  g: string;   // gender
  f: string;   // family group
  fl: string;  // family text
  o: string;   // occasions
  k: string;   // key notes
  l: string;   // smells like
  t: string;   // type
  p: number;   // price
  a: string;   // availability
  lo: number;  // longevity 1-3
  ph?: string; // cut-out photo URL, when there is one
}

export interface Parsed {
  max?: number;
  min?: number;
  gender?: 'Men' | 'Women';
  groups: string[];
  words: string[];
  occasions: string[];
  like?: string;
  gift: boolean;
  mini: boolean;
}

const GROUP_WORDS: Record<string, string[]> = {
  fresh: ['fresh', 'clean', 'citrus', 'lemon', 'aquatic', 'ocean', 'sea', 'blue', 'light', 'soapy', 'hot weather', 'heat'],
  sweet: ['sweet', 'gourmand', 'vanilla', 'caramel', 'candy', 'sugar', 'dessert', 'edible', 'chocolate', 'coffee', 'pistachio', 'toffee', 'honey', 'creamy', 'marshmallow'],
  floral: ['floral', 'flower', 'flowers', 'rose', 'jasmine', 'girly', 'feminine'],
  fruity: ['fruity', 'fruit', 'mango', 'cherry', 'apple', 'berry', 'berries', 'strawberry', 'pineapple', 'coconut', 'tropical', 'juicy'],
  woody: ['woody', 'wood', 'spicy', 'spice', 'amber', 'leather', 'tobacco', 'smoky', 'warm', 'masculine', 'manly', 'bold'],
  oud: ['oud', 'arabian', 'agarwood', 'oudh'],
  musky: ['musk', 'musky', 'powdery', 'soft', 'skin scent', 'subtle', 'layering'],
};

const OCCASIONS: Record<string, string[]> = {
  Office: ['office', 'work', 'meeting', 'interview', 'church'],
  Dates: ['date', 'romantic', 'valentine', 'sexy', 'seductive'],
  Evening: ['night', 'evening', 'dinner', 'club', 'owambe'],
  Parties: ['party', 'parties', 'club', 'owambe'],
  Weddings: ['wedding', 'weddings', 'owambe'],
  'Hot weather': ['hot weather', 'heat', 'sun', 'summer'],
  Everyday: ['everyday', 'every day', 'daily', 'signature'],
};

const LIKE_ALIASES: Record<string, string> = {
  br540: 'MFK Baccarat Rouge 540', 'baccarat': 'MFK Baccarat Rouge 540', 'rouge 540': 'MFK Baccarat Rouge 540',
  aventus: 'Creed Aventus', sauvage: 'Dior Sauvage', 'sauvage elixir': 'Dior Sauvage Elixir',
  'my way': 'Armani My Way', 'eden': 'Kayali Eden Juicy Apple', 'juicy apple': 'Kayali Eden Juicy Apple',
  'queen of silk': 'Creed Queen of Silk', 'bleu de chanel': 'Bleu de Chanel', 'bleu': 'Bleu de Chanel',
  'coco mademoiselle': 'Chanel Coco Mademoiselle', 'delina': 'Parfums de Marly Delina', 'lost cherry': 'Tom Ford Lost Cherry',
  'tobacco vanille': 'Tom Ford Tobacco Vanille', 'tuscan leather': 'Tom Ford Tuscan Leather', 'angels share': "Kilian Angels' Share",
  "angels' share": "Kilian Angels' Share", 'ultra male': 'JPG Ultra Male', 'scandal': 'JPG Scandal Pour Homme',
  'pure musc': 'Narciso Rodriguez Pure Musc', 'oud for greatness': 'Initio Oud for Greatness', yara: 'Lattafa Yara',
  khamrah: 'Lattafa Khamrah', eclaire: 'Lattafa Eclaire', 'silver mountain': 'Creed Silver Mountain Water',
  'green irish': 'Creed Green Irish Tweed', 'althair': 'Parfums de Marly Althaïr', "l'immensite": "Louis Vuitton L'Immensité",
};

function money(s: string): number {
  const m = s.replace(/[₦n,\s]/gi, '');
  const k = /k$/i.test(m);
  const v = parseFloat(m);
  return k ? v * 1000 : v < 1000 ? v * 1000 : v;
}

export function parse(q: string): Parsed {
  const t = ' ' + q.toLowerCase().replace(/[’']/g, "'") + ' ';
  const out: Parsed = { groups: [], words: [], occasions: [], gift: false, mini: false };
  const range = t.match(/between\s*(?:₦|n)?\s*([\d,.]+k?)\s*(?:and|to|-)\s*(?:₦|n)?\s*([\d,.]+k?)/);
  if (range) { out.min = money(range[1]); out.max = money(range[2]); }
  else {
    const under = t.match(/(?:under|below|less than|max|maximum|budget|within|not more than|<)\s*(?:of\s*)?(?:₦|n)?\s*([\d,.]+k?)/);
    const bare = t.match(/(?:₦|\bn)\s*([\d,.]+k?)|\b(\d{1,3}(?:[.,]\d{3})+|\d{2,3}k)\b/);
    if (under) out.max = money(under[1]);
    else if (bare) out.max = money(bare[1] ?? bare[2]) * 1.1;
  }
  if (/\b(him|his|men|man|male|guy|guys|husband|boyfriend|bf|dad|father|brother|masculine)\b/.test(t)) out.gender = 'Men';
  if (/\b(her|she|women|woman|female|girl|girls|girly|wife|girlfriend|gf|mum|mom|mother|sister|feminine|ladies|lady)\b/.test(t)) out.gender = out.gender ? undefined : 'Women';
  for (const [g, ws] of Object.entries(GROUP_WORDS)) {
    for (const w of ws) if (t.includes(' ' + w) || t.includes(w + ' ')) { if (!out.groups.includes(g)) out.groups.push(g); out.words.push(w); }
  }
  for (const [o, ws] of Object.entries(OCCASIONS)) if (ws.some((w) => t.includes(w))) out.occasions.push(o);
  for (const [alias, name] of Object.entries(LIKE_ALIASES)) if (t.includes(alias)) { out.like = name; break; }
  out.gift = /\bgift|present|surprise|birthday|christmas\b/.test(t);
  out.mini = /\bmini|small|travel|bag|pocket|sample\b/.test(t);
  return out;
}

export interface Hit { item: Item; score: number; why: string[] }

export function rank(q: string, items: Item[], limit = 4): { parsed: Parsed; hits: Hit[] } {
  const parsed = parse(q);
  const tq = q.toLowerCase();
  const tokens = tq.split(/[^a-z0-9']+/).filter((w) => w.length > 2);
  const hits: Hit[] = [];
  for (const it of items) {
    if (it.t === 'Home') continue;
    if (parsed.max && it.p > parsed.max) continue;
    if (parsed.min && it.p < parsed.min) continue;
    if (parsed.gender && it.g !== parsed.gender && it.g !== 'Unisex') continue;
    let score = 0;
    const why: string[] = [];
    const name = it.n.toLowerCase();
    if (name.length > 3 && tq.includes(name.replace(/\s*\(.*\)/, ''))) { score += 20; why.push('the one you asked for'); }
    else if (tokens.some((w) => w.length > 3 && name.split(/\s+/).includes(w))) score += 4;
    if (parsed.like && it.l && it.l.toLowerCase().includes(parsed.like.toLowerCase().split(' ').slice(-1)[0])) {
      score += 14; why.push(`smells like ${parsed.like.replace(/^(MFK|JPG|Lattafa) /, '')}`);
    }
    const hay = `${it.fl} ${it.k}`.toLowerCase();
    let fam = 0;
    const generic = ['fresh', 'sweet', 'floral', 'fruity', 'woody', 'oud', 'musk', 'musky', 'clean', 'warm', 'soft', 'light', 'spicy'];
    const specific = parsed.words.filter((w) => !generic.includes(w));
    for (const g of parsed.groups) if (it.f === g) fam += specific.length ? 2 : 5;
    for (const w of parsed.words) if (hay.includes(w)) fam += generic.includes(w) ? 2 : 6;
    if (fam) { score += fam; why.push(it.fl.toLowerCase().replace(/ · /g, ', ')); }
    for (const o of parsed.occasions) if (it.o.includes(o)) { score += 3; why.push(`good for ${o.toLowerCase()}`); }
    if (parsed.mini && /Mini|mist/i.test(it.t)) { score += 6; why.push('small size'); }
    if (parsed.gift && /Mini|mist/i.test(it.t)) score += 2;
    const asked = parsed.groups.length || parsed.like || parsed.occasions.length || parsed.mini || score > 0;
    if (!asked && (parsed.max || parsed.gender)) score += 1;
    if (score <= 0) continue;
    const original = /Designer|Niche/.test(it.t);
    if (parsed.like && original && !/\boriginal\b/i.test(q)) score -= 25;
    if (/assorted|name to confirm/i.test(it.n) && !parsed.mini && !parsed.gift) score -= 4;
    if (score <= 0) continue;
    if (!why.length) why.push(it.fl.toLowerCase().replace(/ · /g, ', '));
    if (it.lo >= 3) { score += 1; if (why.length < 3) why.push('lasts long'); }
    if (it.a === 'in-store') score += 3; else if (it.a === 'sold-before') score += 1.5;
    if (original && !parsed.like && !(parsed.max && parsed.max > 150000) && !/\boriginal|designer\b/i.test(q)) score -= 6;
    if (parsed.max) why.unshift(`within your ₦${Math.round(parsed.max / 1000)}k budget`);
    hits.push({ item: it, score, why: [...new Set(why)].slice(0, 3) });
  }
  hits.sort((a, b) => b.score - a.score || a.item.p - b.item.p);
  // Keep one result per name so variants don't crowd the list.
  const out: Hit[] = [];
  const names = new Set<string>();
  for (const h of hits) {
    const key = h.item.n.toLowerCase().replace(/\s*\(.*\)/, '');
    if (names.has(key)) continue;
    names.add(key);
    out.push(h);
    if (out.length === limit) break;
  }
  return { parsed, hits: out };
}
