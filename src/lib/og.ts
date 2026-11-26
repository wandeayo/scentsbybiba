// Link preview cards (1200x630) drawn at build time, so every shared link shows
// the perfume, its price and the shop. Nothing to commit or regenerate by hand:
// add a perfume or a photo and its card is redrawn on the next build.
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import BottleDefs from '../components/BottleDefs.astro';
import { bottleLook } from './bottle';
import { priceLabel, type Perfume } from './data';

const require = createRequire(import.meta.url);
const font = (pkg: string, file: string) => readFileSync(require.resolve(`${pkg}/files/${file}`));
const fonts = [
  { name: 'Cormorant', data: font('@fontsource/cormorant-garamond', 'cormorant-garamond-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
  { name: 'Cormorant', data: font('@fontsource/cormorant-garamond', 'cormorant-garamond-latin-500-italic.woff'), weight: 500 as const, style: 'italic' as const },
  { name: 'Jost', data: font('@fontsource/jost', 'jost-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Jost', data: font('@fontsource/jost', 'jost-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
  // Jost has no naira sign; Cormorant's extended set does, and satori falls back to it
  { name: 'Naira', data: font('@fontsource/cormorant-garamond', 'cormorant-garamond-latin-ext-600-normal.woff'), weight: 500 as const, style: 'normal' as const },
];

const C = { noir: '#15110e', ivory: '#f7f2ea', porcelain: '#fffdf9', ink: '#1c1612', soft: '#6a5d52', gold: '#b8955a', goldDeep: '#8c6a2e', line: '#dccfbd' };
const GLOW: Record<string, string> = { fresh: '#eef0cf', sweet: '#f6dcb6', floral: '#f5dcd8', fruity: '#f8d4c4', woody: '#ecd2b4', oud: '#e5c6c0', musky: '#efe8e1' };
const METALS = new Set(['gold', 'noir', 'silver', 'rose', 'ivory']);

let defsCache: Promise<string> | undefined;
function spriteDefs(): Promise<string> {
  defsCache ??= AstroContainer.create()
    .then((c) => c.renderToString(BottleDefs))
    .then((html) => html.match(/<defs>[\s\S]*<\/defs>/)?.[0] ?? '');
  return defsCache;
}

// The site tints one shared sprite with CSS variables. The rasteriser does not
// read CSS variables, so the card bakes the chosen colours into a copy.
async function bottlePng(p: Perfume): Promise<Buffer> {
  const { shape, liq, cap } = bottleLook(p.slug, p.type, p.group, p.gender);
  const capFill = METALS.has(cap) ? `url(#g-${cap})` : `url(#liq-${cap})`;
  const defs = (await spriteDefs())
    .replace(/var\(--liq,\s*url\(#[^)]+\)\)/g, `url(#liq-${liq})`)
    .replace(/var\(--cap,\s*url\(#[^)]+\)\)/g, capFill);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 120 220" width="480" height="880">${defs}<use href="#b-${shape}" xlink:href="#b-${shape}" width="120" height="220"/></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function artFor(p: Perfume): Promise<{ src: string; photo: boolean }> {
  const local = p.photo.startsWith('/') ? `public${p.photo}` : '';
  if (local && existsSync(local)) {
    const png = await sharp(local).resize({ height: 900, withoutEnlargement: true }).png().toBuffer();
    return { src: `data:image/png;base64,${png.toString('base64')}`, photo: true };
  }
  return { src: `data:image/png;base64,${(await bottlePng(p)).toString('base64')}`, photo: false };
}

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node =>
  ({ type, props: { style, children, ...extra } });

function arch(glow: string, img: string, photo: boolean, w = 380, ht = 500): Node {
  return h('div', {
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: w, height: ht,
    borderRadius: `${w / 2}px ${w / 2}px 0 0`, border: `1px solid ${C.line}`, overflow: 'hidden',
    backgroundImage: `radial-gradient(120% 70% at 50% 85%, ${glow} 0%, ${C.porcelain} 70%)`,
  }, h('img', photo
    ? { height: ht * 0.74, marginBottom: ht * 0.08, objectFit: 'contain' }
    : { width: w * 0.5, height: w * 0.5 * (220 / 120), marginBottom: ht * 0.04 }, undefined, { src: img }));
}

const wordmark = (size = 30) => h('div', { fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: size, color: C.goldDeep }, 'Scents by Biba');

async function render(tree: Node): Promise<Buffer> {
  const svg = await satori(tree as any, { width: 1200, height: 630, fonts });
  return sharp(Buffer.from(svg)).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
}

export async function productCard(p: Perfume): Promise<Buffer> {
  const art = await artFor(p);
  const nameSize = p.name.length > 30 ? 60 : p.name.length > 18 ? 72 : 86;
  const parts = p.family.split(' · ').map((t) => t.toLowerCase());
  const family = parts.filter((t, i) => i < 2 && !(i > 0 && t.includes(parts[0].replace(/s$/, '')))).join(', ');
  const where = p.availability === 'in-store' ? 'In the boutique in Jos' : p.availability === 'order-in' ? 'Ordered in for you' : 'Sold in Jos';
  return render(h('div', { display: 'flex', width: 1200, height: 630, background: C.ivory, fontFamily: 'Jost, Naira', color: C.ink }, [
    h('div', { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 700, padding: '64px 40px 60px 76px' }, [
      wordmark(),
      h('div', { display: 'flex', flexDirection: 'column' }, [
        h('div', { fontFamily: 'Cormorant', fontWeight: 500, fontSize: nameSize, lineHeight: 1.02, letterSpacing: -0.5 }, p.name),
        p.brandKnown && p.brand ? h('div', { fontSize: 26, letterSpacing: 2, color: C.soft, marginTop: 18 }, p.brand) : h('div', { display: 'none' }),
        family ? h('div', { fontFamily: 'Cormorant', fontStyle: 'italic', fontSize: 34, color: C.soft, marginTop: 10 }, family) : h('div', { display: 'none' }),
      ]),
      h('div', { display: 'flex', flexDirection: 'column', gap: 8 }, [
        h('div', { fontSize: 40, fontWeight: 500, whiteSpace: 'nowrap' }, priceLabel(p)),
        h('div', { fontSize: 22, color: C.soft }, `${where}. Delivery across Nigeria in 1 to 2 days.`),
      ]),
    ]),
    h('div', { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: 500, paddingBottom: 0 }, arch(GLOW[p.group] ?? '#f3e6cf', art.src, art.photo, 380, 540)),
  ]));
}

export async function siteCard(picks: Perfume[], line: string, kicker: string): Promise<Buffer> {
  const arts = await Promise.all(picks.slice(0, 3).map(async (p) => ({ p, art: await artFor(p) })));
  const sizes = [[170, 300], [210, 400], [170, 300]];
  return render(h('div', { display: 'flex', width: 1200, height: 630, background: C.ivory, fontFamily: 'Jost, Naira', color: C.ink }, [
    h('div', { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 600, padding: '64px 20px 60px 76px' }, [
      wordmark(34),
      h('div', { display: 'flex', flexDirection: 'column' }, [
        h('div', { fontFamily: 'Cormorant', fontWeight: 500, fontSize: 68, lineHeight: 1.02, letterSpacing: -0.5 }, line),
        h('div', { fontSize: 24, color: C.soft, marginTop: 22, lineHeight: 1.4 }, kicker),
      ]),
      h('div', { fontSize: 22, color: C.goldDeep }, 'Order on WhatsApp. Delivery across Nigeria in 1 to 2 days.'),
    ]),
    h('div', { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, width: 600, paddingRight: 36 },
      arts.map(({ p, art }, i) => arch(GLOW[p.group] ?? '#f3e6cf', art.src, art.photo, sizes[i][0], sizes[i][1]))),
  ]));
}
