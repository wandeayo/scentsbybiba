# scentsbybiba

The website for Scents by Biba, a perfume store in Jos, Nigeria. Built with [Astro](https://astro.build): every page is plain HTML, so it loads fast on mobile data.

## Run it

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs the static site to dist/
```

Deploy `dist/` to Vercel, Netlify or Cloudflare Pages (framework preset: Astro).

## Where things live

| Path | What it is |
| --- | --- |
| `src/data/perfumes.csv` | Every perfume on the site: names, notes, prices, availability |
| `src/lib/site.ts` | Store address, hours, WhatsApp number |
| `src/lib/search.ts` | The "I want to smell like" search on the home page |
| `src/lib/families.ts` | Scent moods and the colour each one uses |
| `src/lib/cities.ts` | City delivery pages (Abuja, Kaduna, Kano): copy and which perfumes each recommends |
| `src/pages/` | Home, shop, product pages (`p/`), smells-like pages, city pages (`delivery/`), story, visit, `sitemap.xml`, `robots.txt` |

## Updating products

The site reads `src/data/perfumes.csv` when it builds. To change a price or mark something in stock, edit that file (or the Google Sheet, then run `SHEET_CSV_URL=... npm run sync-sheet`) and rebuild.

Key columns: `price_ngn`, `kind` (`In store ...`, `Sold before ...` or `Order-in`), `scent_family`, `key_notes`, `smells_like`. Order-in prices show as "About ₦X".

## Ordering

Every "Order on WhatsApp" button opens a chat with 2347063221856 and a message that names the perfume and price. Searches add what the customer typed to that message.

## Settings in Vercel

Set these under Settings > Environment Variables, then redeploy. Each one is optional.

| Variable | What it does |
| --- | --- |
| `SITE_URL` | The live address. Defaults to `https://scentsbybiba.vercel.app`. Change it when the shop gets its own domain; canonicals, the sitemap and structured data all follow. |
| `PUBLIC_UMAMI_WEBSITE_ID` | Turns on [Umami](https://cloud.umami.is) analytics: page views, plus a `WhatsApp click` event for every WhatsApp button, with where it was tapped (`spot`) and the perfume when there is one. |
| `PUBLIC_GOOGLE_SITE_VERIFICATION` | The code from Google Search Console's "HTML tag" verification. |

## Link previews

Put a 1200×630 image at `public/og.jpg` and every page uses it when shared on WhatsApp, Instagram or X.

## Sitemap

`/sitemap.xml` is generated on every build and includes product photos. `npm run build` fails if a built page is missing from it, so new pages can't be forgotten. Submit `https://<site>/sitemap.xml` in Google Search Console once.
