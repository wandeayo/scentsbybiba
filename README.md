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

Buyers who want more than one perfume use the bag: "Add to bag" on tiles, search results and product pages, then "Send order to Biba on WhatsApp" sends one numbered message with each perfume, quantity, price, its ref (`SBB-…`) and the delivery city. Nothing is charged on the site. The bag lives in the buyer's browser (`localStorage`, key `biba-bag-v1`) and is never sent anywhere else. With Umami on, it also records `Bag add` and `Bag sent` events.

## Settings in Vercel

Set these under Settings > Environment Variables, then redeploy. Each one is optional.

| Variable | What it does |
| --- | --- |
| `SITE_URL` | The live address. Defaults to `https://scentsbybiba.vercel.app`. Change it when the shop gets its own domain; canonicals, the sitemap and structured data all follow. |
| `PUBLIC_UMAMI_WEBSITE_ID` | Turns on [Umami](https://cloud.umami.is) analytics: page views, plus a `WhatsApp click` event for every WhatsApp button, with where it was tapped (`spot`) and the perfume when there is one. |
| `PUBLIC_GOOGLE_SITE_VERIFICATION` | The code from Google Search Console's "HTML tag" verification. |

## Link previews

Every product gets its own 1200×630 card (name, brand, price, photo or bottle drawing) at `/og/p/<slug>.jpg`, and every other page uses the shop card at `/og/home.jpg`. Both are drawn at build time by `src/lib/og.ts`, so new perfumes and photos get cards automatically. Put an image at `public/og.jpg` to replace the shop card with a real photo of the boutique.

## Stock checklist

`docs/biba-stock-checklist.csv` lists the 24 perfumes shown as in the boutique and every perfume with an unconfirmed name or brand. Biba fills in the blank columns (on the shelf today, correct name, correct brand, price today); then update `src/data/perfumes.csv` from it.

## Sitemap

`/sitemap.xml` is generated on every build and includes product photos. `npm run build` fails if a built page is missing from it, so new pages can't be forgotten. Submit `https://<site>/sitemap.xml` in Google Search Console once.
