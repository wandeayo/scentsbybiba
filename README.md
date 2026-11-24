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
| `src/pages/` | Home, shop, product pages (`p/`), smells-like pages, story, visit |

## Updating products

The site reads `src/data/perfumes.csv` when it builds. To change a price or mark something in stock, edit that file (or the Google Sheet, then run `SHEET_CSV_URL=... npm run sync-sheet`) and rebuild.

Key columns: `price_ngn`, `kind` (`In store ...`, `Sold before ...` or `Order-in`), `scent_family`, `key_notes`, `smells_like`. Order-in prices show as "About ₦X".

## Ordering

Every "Order on WhatsApp" button opens a chat with 2347063221856 and a message that names the perfume and price. Searches add what the customer typed to that message.
