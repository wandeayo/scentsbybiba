import { perfumes, type Perfume } from './data';

// Three photographed perfumes for site-wide preview cards: shelf stock first,
// one per scent family so the trio reads as a range, not three of a kind.
export function featuredForCard(): Perfume[] {
  const pool = perfumes
    .filter((p) => p.photo && p.photoCutout && p.type !== 'Home')
    .sort((a, b) => (a.availability === 'in-store' ? 0 : 1) - (b.availability === 'in-store' ? 0 : 1));
  const picked: Perfume[] = [];
  for (const p of pool) {
    if (picked.length === 3) break;
    if (!picked.some((x) => x.group === p.group)) picked.push(p);
  }
  return picked;
}
