// Cities outside Jos that get their own delivery page (/delivery/<slug>/).
// Each page has its own angle and its own perfume picks, so they are not
// copies of one another with the city name swapped. Keep it that way: Google
// treats near-identical city pages as doorway pages and ranks none of them.
//
// Only state facts the shop stands behind. Fees and couriers are left to
// WhatsApp because they change; add them here once Biba confirms them.
import { perfumes, type Perfume } from './data';

export interface City {
  slug: string;
  name: string;
  state: string;
  description: string;
  intro: string;
  picksHeading: string;
  picksIntro: string;
  pick: (p: Perfume) => boolean;
  tips: string[];
}

export const CITIES: City[] = [
  {
    slug: 'abuja',
    name: 'Abuja',
    state: 'FCT',
    description:
      'Lattafa, Arabian and designer perfumes delivered to Abuja from Scents by Biba in Jos, in 1 to 2 days. Office scents that last all day. Order on WhatsApp.',
    intro:
      'You don’t need to be in Jos to shop with us. Pick a perfume here, send Biba a message on WhatsApp, and it reaches you in Abuja in 1 to 2 days.',
    picksHeading: 'For the office, and for after',
    picksIntro:
      'An Abuja day often starts in an office and ends at a dinner or an event. These last through a working day without filling the room.',
    pick: (p) => p.occasions.includes('Office') && p.longevity >= 2,
    tips: [
      'Many Arabian perfumes are strong. Two sprays is usually enough for an office.',
      'Spray your clothes as well as your skin. Fabric holds scent longer than skin does in dry air.',
      'Keep a mini or a body mist in your bag for a top-up before an evening event.',
    ],
  },
  {
    slug: 'kaduna',
    name: 'Kaduna',
    state: 'Kaduna State',
    description:
      'Fresh, long-lasting perfumes delivered to Kaduna from Scents by Biba in Jos, in 1 to 2 days. Lattafa, Khadlaj and more. Order on WhatsApp.',
    intro:
      'Order from our Jos boutique on WhatsApp and your perfume reaches you in Kaduna in 1 to 2 days. Biba confirms the price and the delivery fee before you pay.',
    picksHeading: 'Fresh scents that hold up in the heat',
    picksIntro:
      'Kaduna is warmer than Jos for most of the year, and heat makes perfume rise and fade faster. These fresh, clean and citrus scents feel light in the afternoon and still last.',
    pick: (p) => p.occasions.includes('Hot weather'),
    tips: [
      'Spray just after a bath, on moisturised skin. Perfume fades faster on dry skin.',
      'Keep your bottles out of the car and away from sunlight. Heat breaks perfume down.',
      'In the hottest months, a fresh scent in the day and a warmer one at night works better than one heavy scent all day.',
    ],
  },
  {
    slug: 'kano',
    name: 'Kano',
    state: 'Kano State',
    description:
      'Oud, perfume oils and long-lasting Arabian perfumes delivered to Kano from Scents by Biba in Jos, in 1 to 2 days. Order on WhatsApp.',
    intro:
      'Kano knows oud and perfume oils better than most places. Order from our Jos boutique on WhatsApp and your perfume reaches you in 1 to 2 days.',
    picksHeading: 'Oud, oils and scents that last all day',
    picksIntro:
      'If you like a scent that stays with you from morning to night, these are the deepest and longest-lasting perfumes Biba sells.',
    pick: (p) => p.group === 'oud' || p.type === 'Oil' || (p.group === 'woody' && p.longevity === 3),
    tips: [
      'Perfume oils sit close to the skin and last for hours. Layer one under a spray to make the spray last longer.',
      'Harmattan dries the skin, and dry skin doesn’t hold scent. Moisturise before you spray.',
      'Oud opens strong and softens after the first hour, so give it time before you judge it.',
    ],
  },
];

const AVAIL_RANK = { 'in-store': 0, 'sold-before': 1, 'order-in': 2 } as const;
const SKIP_TYPE = /Home|Mini|mist|spray|series/i;
const SKIP_NAME = /confirm|assorted/i;

// What Biba actually has (or has had) comes first, then photos, then the longest-lasting.
export function picksFor(city: City, n = 8): Perfume[] {
  return perfumes
    .filter((p) => city.pick(p) && !SKIP_TYPE.test(p.type) && !SKIP_NAME.test(p.name))
    .sort(
      (a, b) =>
        AVAIL_RANK[a.availability] - AVAIL_RANK[b.availability] ||
        (a.photo ? 0 : 1) - (b.photo ? 0 : 1) ||
        b.longevity - a.longevity ||
        a.price - b.price,
    )
    .slice(0, n);
}
