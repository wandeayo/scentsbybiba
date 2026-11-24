export type FamilyGroup = 'fresh' | 'sweet' | 'floral' | 'fruity' | 'woody' | 'oud' | 'musky';

export const GROUPS: { id: FamilyGroup; label: string; blurb: string }[] = [
  { id: 'fresh', label: 'Fresh and clean', blurb: 'Citrus, sea air and soap. Made for Jos afternoons and the office.' },
  { id: 'sweet', label: 'Sweet and gourmand', blurb: 'Vanilla, caramel, pistachio and praline. The compliment getters.' },
  { id: 'floral', label: 'Floral', blurb: 'Rose, jasmine and white flowers, from soft to statement.' },
  { id: 'fruity', label: 'Fruity', blurb: 'Mango, berries, apple and cherry. Bright and easy to wear.' },
  { id: 'woody', label: 'Warm, spicy and woody', blurb: 'Amber, spice, leather and tobacco for evenings out.' },
  { id: 'oud', label: 'Oud', blurb: 'Deep, smoky Arabian oud for weddings and big nights.' },
  { id: 'musky', label: 'Soft musk', blurb: 'Clean skin scents for every day and for layering.' },
];

const RULES: [FamilyGroup, RegExp][] = [
  ['oud', /\boud\b/i],
  ['musky', /\bmusk(y)?\b|powdery|clean/i],
  ['fresh', /fresh|citrus|aquatic|green|lemon|marine|sea/i],
  ['sweet', /sweet|gourmand|vanilla|caramel|toffee|coffee|chocolate|nutty|creamy|honey|marshmallow/i],
  ['floral', /floral|rose|white florals|jasmine/i],
  ['fruity', /fruity|tropical|cherry|mango/i],
  ['woody', /woody|amber|spicy|leather|tobacco|smoky|dark|aromatic|oriental|resinous|suede|herbal|patchouli|boozy|masculine/i],
];

export function familyGroup(family: string, notes = ''): FamilyGroup {
  const first = family.split('·')[0] ?? '';
  for (const [g, re] of RULES) if (re.test(first)) return g;
  for (const [g, re] of RULES) if (re.test(family)) return g;
  for (const [g, re] of RULES) if (re.test(notes)) return g;
  return 'musky';
}
