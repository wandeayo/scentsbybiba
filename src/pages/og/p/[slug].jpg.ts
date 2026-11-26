import type { APIRoute } from 'astro';
import { perfumes, type Perfume } from '../../../lib/data';
import { productCard } from '../../../lib/og';

export function getStaticPaths() {
  return perfumes.map((p) => ({ params: { slug: p.slug }, props: { p } }));
}

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await productCard((props as { p: Perfume }).p)), { headers: { 'Content-Type': 'image/jpeg' } });
