import { defineConfig } from 'astro/config';

// The address the live site is served from. Canonical links, the sitemap and
// structured data are all built from it. When the shop moves to its own domain,
// set SITE_URL in Vercel (Settings > Environment Variables) and redeploy.
const site = process.env.SITE_URL || 'https://scentsbybiba.vercel.app';

export default defineConfig({
  site,
  trailingSlash: 'always',
});
