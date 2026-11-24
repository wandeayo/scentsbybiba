// Draws a bottle for a perfume that has no photo yet. The drawing follows the real
// bottle where we know it: a hand-set look for well-known bottles, otherwise the
// colour the name points to (Black, Rouge, Blue, Gold...), otherwise the scent family.
// Shared by the server-rendered tiles and the search results script.
import looks from '../data/bottle-looks.json';

export type Shape = 'flacon' | 'orb' | 'column' | 'oud' | 'mini' | 'block' | 'disc' | 'tall';
const METALS = new Set(['gold', 'noir', 'silver', 'rose', 'ivory']);
const LOOKS = looks as Record<string, string>;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Colour words in a name, checked in order. [pattern, liquid, cap]
const NAME_COLOURS: [RegExp, string, string][] = [
  [/\b(black|aswad|noir|nuit|night|midnight|layl)\b/, 'black', 'noir'],
  [/\b(red|rouge|cherry|scarlet|apple)\b/, 'red', 'gold'],
  [/\b(pink|blush|marshmallow|mallow|candy)\b/, 'pink', 'rose'],
  [/\b(rose|roses)\b/, 'blush', 'rose'],
  [/\b(blue|bleu|aqua|ocean|sky|sapphire)\b/, 'blue', 'silver'],
  [/\b(white|blanc|abiyad|abyad|abiyedh|snow|polar|crystal|cloud|cotton)\b/, 'white', 'silver'],
  [/\b(silver)\b/, 'smoke', 'silver'],
  [/\b(gold|golden|dhahab|dirham|amber)\b/, 'gold', 'gold'],
  [/\b(green|pistachio|pista|pistache|matcha)\b/, 'green', 'gold'],
  [/\b(tobacco|choco|chocolate|coffee|qahwa|leather|toffee|bourbon|brown|suede)\b/, 'brown', 'gold'],
  [/\b(purple|amethyst|violet|viola|lavender|plum)\b/, 'purple', 'gold'],
  [/\b(orange|mandarin|sun|manga|mango|coconut)\b/, 'orange', 'gold'],
  [/\b(vanilla|vanille|caramel|sugar|suger)\b/, 'cream', 'gold'],
];

export interface Look { shape: Shape; liq: string; cap: string }

export function bottleLook(slug: string, type: string, group: string, gender: string): Look {
  const words = slug.replace(/-/g, ' ');
  // Shape: small formats first, then family-led defaults
  let shape: Shape;
  if (/Mini|Oil|mist|spray/i.test(type)) shape = 'mini';
  else if (group === 'oud') shape = 'oud';
  else if (/Designer|Niche|High street/.test(type)) shape = (['column', 'orb', 'block', 'flacon'] as Shape[])[hash(slug) % 4];
  else {
    const pool: Shape[] = group === 'floral' || group === 'fruity' || group === 'sweet'
      ? ['orb', 'flacon', 'tall', 'oud', 'flacon']
      : ['flacon', 'block', 'column', 'tall', 'block'];
    shape = pool[hash(slug) % pool.length];
  }
  let liq = group;
  let cap = gender === 'Men' || group === 'woody' ? 'noir' : gender === 'Women' ? 'gold' : hash(slug + 'cap') % 3 === 0 ? 'noir' : 'gold';
  const named = NAME_COLOURS.find(([re]) => re.test(words));
  if (named) { liq = named[1]; cap = named[2]; }
  const set = LOOKS[slug];
  if (set) {
    const [s, l, c] = set.split(' ');
    if (s !== '-') shape = s as Shape;
    if (l !== '-') liq = l;
    if (c !== '-') cap = c;
  }
  return { shape, liq, cap };
}

export function bottleSvg(slug: string, type: string, group: string, gender: string, label = ''): string {
  const { shape, liq, cap } = bottleLook(slug, type, group, gender);
  const capFill = METALS.has(cap) ? `url(#g-${cap})` : `url(#liq-${cap})`;
  const alt = label ? ` role="img" aria-label="${label.replace(/"/g, '&quot;')}"` : ' aria-hidden="true"';
  return `<svg class="bottle bottle-${shape}" viewBox="0 0 120 220"${alt}><use href="#b-${shape}" style="--liq:url(#liq-${liq});--cap:${capFill}"/></svg>`;
}
