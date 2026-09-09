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
| Data | Postgres via Drizzle — Supabase deployed, PGlite locally |
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

Products can carry real photographs, uploaded from the admin. A product with no
photo falls back to a line-art illustration from
[`ProductArt.tsx`](src/components/product/ProductArt.tsx), drawn in the same
stroke language as the elephant on a deterministic per-product background tint.

Both live in **one component**, on purpose. A shop mid-photoshoot has some
products shot and some not, and otherwise every grid, cart line and order row
would have to make that choice for itself — with a broken image frame the price
of forgetting. Call sites pass `src` and stop thinking about it.

### Uploading

The browser **resizes before uploading** — longest edge 1600px, JPEG at 82%. A
4.4MB phone photo becomes about 24KB. That is not only a page-speed win: it
keeps uploads under the request body limit, which a photo straight off a phone
would otherwise exceed. If anything in the canvas path fails it sends the
original rather than losing the upload, and the server still enforces its own
type and size limits.

Storage follows the same split as the database:

| Environment | Backend |
|---|---|
| Deployed (`SUPABASE_URL` set) | Supabase Storage, `product-images` bucket |
| Local | `public/uploads/`, gitignored |

The local backend exists because the service role key can't sit on a laptop —
exactly like the connection string. Without it, uploading would be untestable
anywhere but production.

It talks to the Storage REST API with `fetch` rather than pulling in
`@supabase/supabase-js`, which would bring realtime, auth and PostgREST clients
along for the two calls this makes by hand.

Two things are deliberately strict. Saved image URLs are **checked against an
allowlist** (this project's Storage host and bucket prefix, or the local uploads
path): the list is posted by the browser, so without that check an edited
request could point a product's photo anywhere on the internet and the shop
would serve it. And `next.config.ts` scopes `remotePatterns` the same way rather
than using a wildcard, because the image endpoint fetches and optimises whatever
it is allowed to — a loose pattern is an open proxy running on the shop's bill.

The bucket enforces the same 6MB cap and MIME allowlist as the upload route, so
a bad file is refused even if the route were bypassed.

Photos are **released when they stop being referenced**: remove or replace one
and save, and the file is deleted from storage; delete a product and all of its
photos go with it. The deletion runs only after the database write has
succeeded, so a save that fails halfway never removes a file the product still
points at, and it's best-effort — a storage blip costs a stray file at worst,
never a failed edit. Without this, every dropped photo stayed in the bucket
forever.

## Design

Dense and commercial, built to match [mamasandpapas.com.kw](https://en.mamasandpapas.com.kw/):
white-led surfaces with orchid as the action colour, 8px corners, cool
high-contrast neutrals so price and offer badges carry weight.

- **Header** leads with search — the widest input on the page — over a
  department row with a thumbnail mega menu.
- **Homepage** opens on merchandise: promo grid, category circles, age chips,
  then rails that lead with price.
- **Listing** is five across with a permanent filter rail, 20 per page.
- **Product page** pins a buy box beside the gallery: price, saving, delivery
  status and add-to-bag all visible without scrolling.
- **Cards** are price-led — the price is the biggest element, the saving is in
  dinars as well as percent.

This was picked from two directions built side by side for the client. The
alternative ("Studio" — soft, brand-led, spacious) and the switcher that
compared them were removed once the choice was made; both are in git history up
to `dd73ef5` if the decision is ever revisited.

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
- Whether Arabic is served at all is a setting — see **Languages** under
  [Admin panel](#admin-panel).

## Database

The catalogue lives in Postgres — it has to, because the admin panel writes to
it. One Drizzle schema (`src/db/schema.ts`), two drivers:

| Environment | Driver | Notes |
|---|---|---|
| Local (no `DATABASE_URL`) | **PGlite** — Postgres compiled to WASM, in `.pglite/` | No Docker or Postgres install needed |
| Anywhere with `DATABASE_URL` | **Supabase** over postgres-js | Point it at the transaction pooler, not the direct connection |

```bash
npm run db:migrate   # apply drizzle/*.sql
npm run db:seed      # load the 44 seed products
npm run db:reset     # wipe the local DB and rebuild it
npm run db:generate  # regenerate SQL after editing schema.ts
```

The local PGlite database is **single-writer**. A script run while `next dev`
holds it will fail — stop the dev server first — and anything that opens it from
several processes at once (a killed dev server, a build that fans out across
workers) can leave the data directory unopenable with `RuntimeError: Aborted()`.
It's disposable: `npm run db:reset` rebuilds it from the seed in seconds. None
of this applies to Neon.

`src/lib/catalog/products.ts` stays in the repo as the seed fixture. It is no
longer what the storefront reads.

### Going live on Supabase

Three variables:

| Variable | Where it comes from |
|---|---|
| `DATABASE_URL` | Project settings → Database → **Transaction pooler** (port 6543) |
| `SUPABASE_URL` | Project settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Project settings → API → `service_role` (secret) |

The pooler matters. Each serverless invocation is its own short-lived process,
and enough of them against the direct connection will exhaust Postgres's
connection limit. `prepare: false` in `db/client.ts` is required by that pooler
for the same reason: in transaction mode a connection is handed to a different
client between statements, so a prepared statement made on one may not exist on
the next.

**Row Level Security is on, with no policies, deliberately.** Supabase publishes
every `public` table through PostgREST, and its anon key is public by design —
without this, anyone holding that key could read `orders`, which contains real
customer names, phone numbers and home addresses. This app never uses PostgREST;
it connects directly with a role that bypasses RLS. Policies would only be
needed if shopper accounts ever arrive.

Migrations run during the build (`scripts/setup-db.ts`), which applies anything
pending and then runs the seed.

Seeding is a **ledger of named steps**, not one all-or-nothing operation. Each
step records itself, and a step added later runs on the next deploy — only that
step. This is deliberate: the guard was twice a single flag standing in for "is
every piece of reference data present?", and twice it went stale the moment the
schema grew. Guarding on "are there any products?" shipped a storefront with
products but no categories; replacing it with a `_seeded` marker then shipped
one with no collections. A per-step ledger has no version of that failure.

Every step except `products` skips rows that already exist, so re-running one is
a no-op that backfills whatever is missing. Products are seeded once and never
re-inserted — they're the shop owner's data, and one they delete must not come
back.

This runs in the build because Vercel marks Neon's variables Sensitive —
`vercel env pull` returns the literal `[SENSITIVE]`, so the connection string
can't be used from a laptop.

## Admin panel

At **`/admin`** — outside `/[lang]`, because it's a single-language internal
tool rather than part of the bilingual storefront.

The panel is available in **English and Arabic**, toggled in its header and
remembered in its own cookie — separate from the storefront's, so previewing the
Arabic shop doesn't flip the admin too.

It works on a phone. The list screens are wide tables that can't shrink to
375px, so below 40rem each row becomes a card and each cell a labelled line
(`.stack-table` in `globals.css`). That reflow uses the same markup rather than
a separate mobile list, which matters on the inventory screen: its cells hold
the stock inputs, and rendering two layouts would put two fields with the same
name in one form.

### What it manages

| Section | What's editable |
|---|---|
| Products | Bilingual copy, price, category, illustration, ages, variants and stock |
| Inventory | Stock for every variant, filtered to low or out of stock |
| Collections | The shelves at `/collections/…` — bilingual name and blurb, membership, order, visibility |
| Categories | Bilingual name and blurb, department, illustration, URL, order |
| Customers | Newsletter subscribers, with CSV export |
| Shipping and delivery | Free-delivery threshold, delivery charge, cash on delivery, delivery and returns windows |
| Languages | Which languages the shop serves, the default, and a translation-coverage report |
| Social links | The icons in the shop footer |

**Products.** Bilingual copy, price, category, illustration, age groups, and
variants generated from every colour × size combination. Editing a product's
colours or sizes preserves the stock of combinations that already existed, so it
doesn't silently zero inventory.

**Inventory** is the same stock seen the other way round: one row per variant
across the whole catalogue rather than per product, because that's the unit
someone counting a shelf is holding. Rows are filtered to low (≤5) or out of
stock, and a page of edits saves in one submit — only the rows whose value
actually changed are written.

**Collections** come in two kinds, the distinction every commerce admin ends up
needing:

- **Automatic** membership comes from a rule evaluated on read, so it stays
  correct as the catalogue changes — *Sale* is every reduced product, and nobody
  has to re-curate it after editing a price. The rules live in
  `collection-rules.ts`; they're fixed because the code evaluates them.
- **Curated** membership is an explicit, ordered list, for an edit like "Eid
  picks" that no rule could infer. The arranged order is what shoppers see:
  those listings default to a `curated` sort rather than the usual
  featured-first, or arranging them would achieve nothing.

The three original collections (`new-in`, `bestsellers`, `sale`) were constants
in `routes.ts`; they seed as automatic collections, which is what they already
were. What's new is that they can be renamed, reordered, hidden, and joined by
curated ones — and the header's collection links come from that list.

**Categories** live in the database so they can be added and renamed. Their
**department** and **illustration** still come from fixed lists in
`taxonomy.ts` — departments define the top-level nav and the `/d/[department]`
URLs, and each illustration is a hand-drawn SVG, so an invented value for either
would render nothing.

Two integrity rules the actions enforce:

- **Renaming a category's URL moves its products with it**, in the same
  operation, so nothing is left pointing at a slug that no longer exists.
- **A category with products can't be deleted.** It refuses rather than
  cascading, because deleting a category should never quietly delete the shop
  owner's products.

**Customers** are newsletter subscribers. There is no purchase history because
there is no checkout — see [What is not built](#what-is-not-built). The footer
signup form used to discard the address it collected; it now stores it, and this
is where those go. Unsubscribing sets a timestamp rather than deleting the row,
so an address that opted out stays known and a later import can't quietly
re-add it. Signing up twice re-subscribes instead of erroring, and "already
subscribed" is reported to the visitor as success — distinguishing it would let
anyone test whether a given address is on the list.

**Shipping and delivery** drives behaviour, not just copy. The free-delivery
threshold is what the cart's progress bar counts towards and what the product
page promises; it used to be a constant in three files. Amounts are typed in
dinars and stored as fils, and an unreadable amount is a validation error rather
than silently becoming zero — which would make delivery free for everyone.

**Languages** switches Arabic on or off, sets which language a visitor lands in
when their browser doesn't ask, and reports **translation coverage**: anything
with English filled in and Arabic blank. Missing Arabic doesn't break the Arabic
site — it falls back to English — so nothing errors and nobody notices, which is
exactly why it's worth listing. Switching Arabic off hides the language toggle,
redirects `/ar` to English, and drops the `hreflang` alternate so search engines
aren't pointed at a redirect.

**Social links** accept whatever gets pasted — a full URL, an `@handle`, or a
phone number — and normalise to something openable. A blank field hides that
icon rather than linking to a profile that doesn't exist.

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

Category, department and collection pages all render
[`ProductListing`](src/components/plp/ProductListing.tsx). Filter state lives
entirely in the URL
(`?age=&colour=&size=&min=&max=&stock=1&sale=1&sort=&page=`) so results are
linkable and shareable.

## Rendering

The storefront renders **per request** (`export const dynamic = "force-dynamic"`
in the locale layout). The catalogue is data the shop owner edits, and an edit
should be visible immediately rather than after a revalidation round trip.
Prerendering would also make every deploy depend on the database being
reachable at build time.

The trade is a query per page view instead of static HTML. At this catalogue's
size that's the right way round; if traffic ever changes that, this line and the
`revalidatePath` calls in the admin actions are the two places to revisit.

`/` is handled by [`src/app/page.tsx`](src/app/page.tsx) rather than by the
proxy, because which language a visitor lands in depends on settings in the
database and Next's guidance is explicit that the proxy isn't for data fetching.
The proxy still handles locale-less deeper links, which fall back to English.

## Checkout and orders

A shopper can buy. Bag → checkout → order, with the stock actually moving.

**Cash on delivery only, for now.** That is not a placeholder: it's the payment
method the shop already advertised and the one most Kuwaiti customers use.
Building it first means the shop can take real orders while the merchant
account for card payment is still being set up, rather than waiting weeks with
nothing live. `paymentMethod` is a column and the card option is rendered and
disabled, so adding KNET is a new branch at one point in
[`checkout.ts`](src/lib/actions/checkout.ts) plus a gateway callback — not a
retrofit.

Two rules shape [`placeOrder`](src/lib/orders/place.ts):

**Prices come from the database, never the request.** A Server Action is a
public POST endpoint. The browser is trusted to say *which variant* and *how
many* and nothing else; every amount charged is looked up server-side. The
posted bag is re-validated too — quantities clamped, unknown products dropped.

**Stock moves in one statement.** The production driver is `neon-http`, which
has *no* transaction support: `db.transaction()` throws there while working
fine on local PGlite — precisely the shape of bug that passes review and breaks
in production. So the decrement is a single all-or-nothing `UPDATE` whose guard
lives inside the statement: it only matches when every requested variant still
has enough stock. Two people buying the last item at the same moment cannot
both succeed. Writes after it compensate if they fail.

Orders **snapshot** what was bought — name, price, size, colour — rather than
referencing the catalogue. A product can be renamed, repriced or deleted later,
and an order from six months ago still has to read the way it did on the day.
It's also why deleting a product can't cascade away the record that somebody
bought it.

### Addresses

Kuwait-shaped: governorate, area, block, street, building, plus a free line for
the floor or a landmark. A phone number is mandatory and validated as Kuwaiti
(eight digits, and `+965`/spacing accepted) because that is how delivery works
here — the driver calls.

### Order references

`BM-` plus six characters from an alphabet with no `0`/`O` or `1`/`I`/`L`. They
get read out over the phone, and a misheard character is a delivery to the wrong
door. They're random rather than sequential for a second reason: the
confirmation page is guarded by nothing but the reference, and `BM-000042` would
let anyone read every order in the shop by counting.

### In the admin

**Orders** lists everything with totals and open count, and each order has the
customer's details (phone as a `tel:` link — the first thing the shop does is
call), the items, a status trail, a paid/unpaid toggle and private staff notes.

Cancelling returns every item to stock, and is **terminal**: reopening a
cancelled order would put it live again without re-taking stock that may since
have sold, so the screen says it can't be undone and the action enforces that.

## What is not built

This is a complete storefront, not a complete shop. Deliberately out of scope so
far:

- **Card and KNET payment.** Checkout works and takes real orders, but only
  cash on delivery. The card path is built as a seam, not a stub — see
  **Checkout and orders** below.
- **Customer accounts.** No shopper auth or saved addresses — the account icon
  is a stub. Checkout is deliberately guest-only: requiring an account before a
  first purchase costs more orders than it saves. The admin's **Customers**
  section is newsletter subscribers, separate from the people who have ordered.
- **Customer-facing order history.** An order is reachable by its confirmation
  link, but there's no "my orders" page, because there are no accounts to hang
  one from.
- **Reviews.** Ratings are seed data; there is no review submission.
- **Search** is a substring match over the seed catalogue, not a search engine.

## Commands

```bash
npm run dev     # dev server
npm run build   # production build
npm run lint    # eslint
npx tsc --noEmit
```
