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
- **Accounts.** No auth, orders, or addresses — the account icon is a stub.
- **Backend.** Catalogue and bag are in-process and in `localStorage`; nothing
  is persisted server-side, and stock is not decremented.
- **Reviews.** Ratings are seed data; there is no review submission.
- **Search** is a substring match over the seed catalogue, not a search engine.

## Commands

```bash
npm run dev     # dev server
npm run build   # production build
npm run lint    # eslint
npx tsc --noEmit
```
