import type { APIRoute } from 'astro';
import { siteCard } from '../../lib/og';
import { featuredForCard } from '../../lib/featured';

export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await siteCard(featuredForCard(), 'Fine fragrance, found for you.', 'Lattafa, Arabian and designer perfumes from a boutique in Jos.')), { headers: { 'Content-Type': 'image/jpeg' } });
