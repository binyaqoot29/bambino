# Bambino

A bilingual (English / Arabic) storefront for **Bambino** — a Kuwait children's
and baby retailer. Clothing, prams, nursery, feeding, toys and bath, priced in
Kuwaiti dinar.

Built from the branding identity in [`docs/Bambino-brand-identity.pdf`](docs/Bambino-brand-identity.pdf),
with [mamasandpapas.com.kw](https://en.mamasandpapas.com.kw/) as the structural
reference.

```bash
npm run dev
```

Then open http://localhost:3000 — you'll be redirected to `/en` or `/ar`
depending on your `Accept-Language`.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript |
| i18n | Native `app/[lang]` + `src/proxy.ts`, no dependency |
| State | `useSyncExternalStore` over `localStorage` |

## Brand

Everything visual derives from the identity deck. Tokens live in
[`src/app/globals.css`](src/app/globals.css) under `@theme`.

| Role | Hex |
|---|---|
| Primary orchid (`brand-500`) | `#BD72A2` |
| Deep plum (`brand-900`) | `#661F47` |
| Mint accent (`mint-300`) | `#B7D2DD` |
| Cloud (`mint-200`) | `#D3E1EC` |

Body type is **Poppins** (Latin) and **Tajawal** (Arabic), both via `next/font`.

**The logo is the real artwork.** Both the elephant
([`BambinoMark.tsx`](src/components/brand/BambinoMark.tsx)) and the wordmark
([`Wordmark.tsx`](src/components/brand/Wordmark.tsx)) are the original filled
outlines, extracted from the vector logo PDF in
[`docs/Bambino-logo.pdf`](docs/Bambino-logo.pdf) — page 1, the light-background
lockup. Not a trace, so they're exact at any size.

The wordmark is drawn rather than set in Poppins: the brand's letterforms are
close to Poppins but not identical, and outlines mean the logo can't shift while
a webfont loads or drift if the font stack changes.

`brand-500` is sampled straight from that artwork. The rest of the palette still
comes from photographs of the printed collateral, so those hexes carry some
lighting bias — worth replacing if a proper colour spec ever surfaces.

### Icons

The elephant, white on a brand tile, across the whole set:

| File | Size | Where it shows |
|---|---|---|
| `src/app/icon.svg` | scalable | Browser tabs |
| `src/app/favicon.ico` | 16/32/48 | Legacy browsers |
| `src/app/apple-icon.png` | 180px, full-bleed | iOS home screen |

The mark is fine line-art, so at tab sizes the tab icon carries a **1.4pt white
stroke on top of the same white fill** — it fattens every line without altering
the drawing. Weights were compared at 16/32/48 before picking it: thinner loses
the shape, heavier closes up the ear. It reads well from 32px up and is a soft
silhouette at 16px, which is the honest limit of line-art this fine.

The Apple icon is deliberately square and opaque — iOS applies its own rounding
and dislikes transparency.

## Product imagery

There is no product photography yet. Every product renders a line-art
illustration from [`ProductArt.tsx`](src/components/product/ProductArt.tsx),
drawn in the same stroke language as the elephant, on a deterministic
per-product background tint. It's a deliberate stand-in — it keeps a grid
looking designed rather than broken. Swapping in `<Image>` touches three call
sites: the product card, the PDP gallery, and the cart line.

## Two designs

This build carries **two design directions** so the client can compare them on
the same running site. A floating switcher (bottom right) flips between:

- **Studio** — the original. Soft, brand-led, generous spacing, pill shapes.
- **Market** — dense and commercial. White-led with orchid as the action colour,
  8px corners, promo-driven layouts, price-first product cards.

They differ in structure, not just skin: separate headers, footers, homepages,
listing pages and product pages. What they share is everything below the
surface — catalogue, cart, filters, i18n, and the primitives in
`src/components/ui`.

```
src/design/
  config.ts          designs, cookie name, labels
  server.ts          getDesign() — reads the cookie
  index.tsx          dispatchers: <Home>, <Listing>, <ProductView>, <SiteHeader>, <SiteFooter>
  types.ts           the prop contract both directions implement
  studio/  market/   the two implementations
```

Route files under `src/app` render the dispatchers and never import a specific
direction, so adding or removing one touches nothing there. Colour, type, radii
and neutrals come from the `[data-design="market"]` block in `globals.css` —
`data-design` is set on `<html>` from the cookie.

**This is review scaffolding.** Reading a cookie in the layout opts every page
out of static prerendering, which is why the build reports routes as dynamic.
Once a direction is chosen: delete the other folder, drop `DesignSwitcher` and
`getDesign`, inline the winner into the routes, and the pages go back to being
fully static.

## Localisation

- Every page lives under `/{locale}`. [`src/proxy.ts`](src/proxy.ts) redirects
  bare paths using a saved cookie, then `Accept-Language`, then English.
- Arabic renders with `dir="rtl"`; layout uses logical properties throughout
  (`ms-`/`me-`, `ps-`/`pe-`, `start-`/`end-`) so mirroring is automatic.
- Copy lives in [`src/i18n/dictionaries/`](src/i18n/dictionaries). Dictionaries
  are plain JSON typed off the English file, so a missing Arabic key is a
  compile error.
- Prices are stored as integer **fils** (1 KWD = 1000 fils) and formatted as
  `12.500 KD` / `12.500 د.ك`. Latin digits are used in both languages, matching
  Kuwaiti retail convention. See [`src/lib/money.ts`](src/lib/money.ts).

## Database

The catalogue lives in Postgres — it has to, because the admin panel writes to
it. One Drizzle schema (`src/db/schema.ts`), two drivers:

| Environment | Driver | Notes |
|---|---|---|
| Local (no `DATABASE_URL`) | **PGlite** — Postgres compiled to WASM, in `.pglite/` | No Docker or Postgres install needed |
| Anywhere with `DATABASE_URL` | **Neon** over HTTP | Serverless-safe, no connection pool to exhaust |

```bash
npm run db:migrate   # apply drizzle/*.sql
npm run db:seed      # load the 44 seed products
npm run db:reset     # wipe the local DB and rebuild it
npm run db:generate  # regenerate SQL after editing schema.ts
```

Two things about the local PGlite database. It's **single-writer**, so a script
run while `next dev` is holding it will fail — stop the dev server first. And
killing the dev server mid-write can leave the data directory unopenable
(`RuntimeError: Aborted()`); it's disposable, so `npm run db:reset` fixes it in
seconds.

`src/lib/catalog/products.ts` stays in the repo as the seed fixture. It is no
longer what the storefront reads.

### Going live on Neon

1. In Vercel → Storage, create a **Neon** Postgres database and link it to the
   project. That sets `DATABASE_URL` automatically.
2. Run the migration and seed against it once:
   ```bash
   DATABASE_URL='<connection string>' npm run db:migrate
   DATABASE_URL='<connection string>' npm run db:seed
   ```

## Admin panel

At **`/admin`** — outside `/[lang]`, because it's a single-language internal
tool rather than part of the bilingual storefront.

List, search, create, edit and delete products, including bilingual copy,
price, category, illustration, age groups, and variants generated from every
colour × size combination. Editing a product's colours or sizes preserves the
stock of combinations that already existed, so it doesn't silently zero
inventory.

Access is a single shared password:

```bash
# .env.local
ADMIN_PASSWORD=choose-something-long
ADMIN_SESSION_SECRET=optional-but-better   # falls back to ADMIN_PASSWORD
```

The password is exchanged for an HMAC-signed, HTTP-only cookie that expires
after 12 hours; the cookie holds a signed expiry, never the password. Without
`ADMIN_PASSWORD` set, the panel stays locked — it never falls back to open.

Every Server Action re-checks the session itself rather than trusting the
route, since a Server Action is its own endpoint and can be called directly.

Deliberately not built: user accounts, roles and an audit trail. There's one
shop owner. `src/admin/auth.ts` is the seam if that changes.

## Catalogue

Hand-written seed data in [`src/lib/catalog/`](src/lib/catalog) — 44 products
across 14 categories and 6 departments, every customer-visible string in both
languages, with colours, sizes, per-variant stock, ratings and sale prices.

The shape matches what a commerce API would return. `queries.ts` is the only
read layer the pages talk to, so pointing it at a real backend (Medusa, Shopify
Storefront, a database) means changing those function bodies and nothing else.

## Routes

```
/[lang]                          home
/[lang]/d/[department]           department listing + category shelf
/[lang]/c/[slug]                 category listing
/[lang]/collections/[collection] new-in | bestsellers | sale
/[lang]/p/[handle]               product detail
/[lang]/search?q=                search results
/[lang]/cart                     bag
/[lang]/wishlist                 saved items
/[lang]/about                    brand story
```

Listing pages share one [`ProductListing`](src/components/plp/ProductListing.tsx)
component. Filter state lives entirely in the URL
(`?age=&colour=&size=&min=&max=&stock=1&sale=1&sort=&page=`) so results are
linkable and shareable.

## What is not built

This is a complete storefront, not a complete shop. Deliberately out of scope so
far:

- **Checkout.** The button is present and inert; there is no payment
  integration (KNET, cards, Apple Pay, COD are shown as badges only).
- **Customer accounts.** No shopper auth, orders, or addresses — the account
  icon is a stub. (The *admin* has its own password; see above.)
- **Orders.** The bag lives in `localStorage` and stock is never decremented,
  because nothing places an order yet.
- **Image upload.** Products pick from the built-in illustration set; there's no
  photo upload, which needs blob storage.
- **Reviews.** Ratings are seed data; there is no review submission.
- **Search** is a substring match over the seed catalogue, not a search engine.

## Commands

```bash
npm run dev     # dev server
npm run build   # production build
npm run lint    # eslint
npx tsc --noEmit
```
