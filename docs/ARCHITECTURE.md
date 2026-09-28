# The Computer Store — Architecture

This document establishes the design system, data model, compatibility engine, PC-builder
flow and admin architecture **before** implementation. Code follows these decisions.

---

## 1. Design system

**Personality:** a modern hardware brand, not a template shop. Calm neutral surfaces, one
electric-blue accent, large confident type, dense-but-readable spec data in mono.

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#F7F8FA` | `#080A0D` |
| `--surface` (cards) | `#FFFFFF` | `#11151A` |
| `--surface-2` (insets) | `#F0F2F5` | `#161B21` |
| `--ink` (text) | `#0B0D10` | `#F3F5F7` |
| `--muted` | `#5B6472` | `#8B95A3` |
| `--line` (hairlines) | `#E4E7EC` | `#222932` |
| `--accent` | `#1F5FFF` | `#3D8BFF` |
| `--accent-2` (glow / cyan) | `#00B8D9` | `#22D3EE` |
| `--ok` / `--warn` / `--bad` | `#0E9F6E` / `#C77700` / `#D92D20` | `#34D399` / `#FBBF24` / `#F87171` |

Dark "stage" sections (`#0B0D10` / `#111318`) are used on the light site for the hero
showcase, builder preview and final CTA, so the page never becomes permanently dark.

* **Type:** Plus Jakarta Sans (display + UI), JetBrains Mono (specs, prices in tables, codes).
  Scale: 12 / 14 / 16 / 18 / 22 / 28 / 40 / 56 / 76px. Headlines 700–800, tracking −0.03em.
* **Shape:** radius 10 (controls) / 16 (cards) / 24 (feature panels). Shadows are soft and
  layered (`0 1px 2px` + `0 8px 24px` at low alpha). Borders only as 1px hairlines.
* **Status language** always pairs icon + word + colour: `✓ Compatible`, `⚠ Warning`,
  `✕ Incompatible` (WCAG 1.4.1 — never colour alone).
* **Motion:** 150–300ms ease-out; hero reveal, card lift, price count-up, compatibility pulse.
  All disabled under `prefers-reduced-motion`.
* **Glass:** only on the sticky nav when scrolled and the hero spec chips.
* **Product imagery:** uploaded images (via the storage provider) when present; otherwise a
  category-specific vector render (`ProductArt`) so the catalogue never shows broken images.

## 2. Database schema (PostgreSQL via Prisma)

See `prisma/schema.prisma`. Core entities:

```
User ─┬─< Build ─< BuildItem >─ Product
      ├─< Order ─< OrderItem >─ Product
      ├─< Quote ─< QuoteItem >─ Product
      └─< WishlistItem >─ Product

Category ─< SpecDefinition          (the structured spec schema per category)
Category ─< Product >─ Brand
Product ─< ProductSpec >─ SpecDefinition   (typed values: num / text / bool / list)
Product ─< ProductImage
Product ─< Inventory                (per location → multi-store / multi-vendor later)
Product ─< PriceHistory             (price history / alerts later)
BuildTemplate ─< BuildTemplateItem >─ Product
CompatibilityRule                   (enable/disable, severity override, params JSON)
Setting                             (scoring engine, power model, auto-build allocations, site content)
Coupon
```

Money is stored as integer rupees (selling prices are GST-inclusive, as in Indian retail);
`gstRate` is per product so the GST component can be broken out on quotes.

## 3. Component data model

Every PC component is a normal `Product` whose category has a `builderSlot` and a set of
`SpecDefinition`s. The engine never parses marketing text — it reads typed specs:

| Slot | Key specs consumed by the engine |
|---|---|
| cpu | socket, generation, cores, threads, baseClock, boostClock, tdp, maxPower, integratedGpu, includesCooler, memoryTypes, performanceTier |
| motherboard | socket, chipset, formFactor, ramType, ramSlots, maxRam, maxRamSpeed, m2Slots, m2Gen5, sataPorts, pcieSlots, supportedGenerations, biosUpdateGenerations, wifi |
| cooler | coolerType (air/aio), sockets, tdpRating, height, radiatorSize |
| ram | ramType, capacity, modules, speed |
| gpu | vram, length, slots, tgp, recommendedPsu, powerConnectors (8pin count / 12vhpwr), performanceTier |
| ssd / hdd | interface (nvme/sata), pcieGen, capacity |
| psu | wattage, efficiency, psuFormFactor, pcie8pin, has12vhpwr |
| case | formFactors, maxGpuLength, maxGpuSlots, maxCoolerHeight, radiatorSupport, psuFormFactor, fanSlots |
| fans / ups / others | fanSize, va, … |

Adding a new spec = admin adds a `SpecDefinition`; adding a new component type = new
category with a `builderSlot`.

## 4. Compatibility-rule architecture

`src/lib/compat/` is a **pure, isomorphic TypeScript module** (no React, no Prisma). It runs
on the server (candidate filtering, auto-build, cart/quote validation) and on the client
(instant sidebar feedback).

```
CompatibilityService
  .checkCPUWithMotherboard(build)      .checkRAMWithMotherboard(build)
  .checkGPUWithCase(build)             .checkCoolerWithCPU / WithCase(build)
  .checkMotherboardWithCase(build)     .checkPSUWithBuild(build)
  .checkStorageWithMotherboard(build)  .validateBuild(build) → BuildReport
  .evaluateCandidate(build, slot, product) → CandidateVerdict
```

* A **rule** is `{ id, title, slots[], defaultSeverity, check(ctx) → CheckResult[] }`,
  registered in `rules.ts`. New rules are added to the registry — nothing else changes.
* Rules read **config** (`RuleConfig`: enabled, severity override, params) loaded from the
  `compatibility_rules` table, editable in Admin → Compatibility.
* Result shape:
  `{ ruleId, status: "compatible"|"warning"|"incompatible"|"info", severity: "success"|"warning"|"error"|"info", message, suggestion?, slots[], action? }`
  Messages are human, specific and name both parts, e.g.
  *"This motherboard uses an AM4 socket while your Ryzen 7 7800X3D requires AM5."*
* **Prevention over warning:** `evaluateCandidate` dry-runs the build with the candidate
  in the slot. Candidates producing `incompatible` results are hidden from the list by
  default (a "Show incompatible (n)" toggle explains why each was hidden).
* **Power model** (`power.ts`) estimates load from specs and computes the recommended PSU
  with configurable headroom and rounding.
* **Scoring** (`score.ts`) produces qualitative ratings (compatibility, power headroom,
  balance, upgrade potential, gaming tier) from configurable thresholds. It uses the
  admin-assigned `performanceTier` — never invented benchmark numbers.

## 5. PC-builder flow

`/pc-builder` — entry modes: **Start from scratch · Start with CPU · Start with GPU ·
Start with budget (Build it for me) · Customise a template · Load a shared build**.

```
Pick  →  Check  →  Continue
[step rail]   [option list with filters/sort, verdict on every card]   [sticky Your Build]
```

1. Step rail shows all 19 slots; core 8 first, optional ones marked "Optional · Skip".
2. Each step lists server-filtered options (`/api/builder/options`) annotated with the
   verdict for the *current* build. Selecting animates into the sidebar and auto-advances.
3. Sidebar: parts, subtotal/MRP/discount/GST/final, power estimate vs PSU, compatibility
   summary with human explanations + "Change X" actions, progress, build score, actions
   (Save, Share, Download quotation, Add to cart, Request quote, WhatsApp, Reset).
4. State is a guest-friendly local store (`localStorage`), so no login is needed. Saving
   creates a `Build` with a share code `TC-XXXXXX`; logged-in users also own it.
5. Mobile: one step per screen ("Step 1 / 19 · Processor"), sticky bottom bar with price,
   progress, compatibility and "View build" sheet.
6. Auto-build (`src/server/builder/auto-build.ts`) allocates the budget by use case and
   resolution, picks only **active, in-stock** products, validates every pick with the
   engine, then trims/upgrades to fit the budget. Locked slots support "start with GPU/CPU".

## 6. Admin architecture

`/admin` (role `ADMIN`, enforced in middleware + every server action):

* **Catalogue:** products (structured spec editor generated from the category's
  `SpecDefinition`s, images, price/MRP/GST, inventory, warranty, status), categories
  (+ spec schema), brands.
* **Builder:** compatibility rules (toggle, severity, params), scoring/power settings, build
  templates & showcase builds.
* **Sales:** quotation requests (status pipeline New → Contacted → Quoted → Confirmed →
  Completed / Cancelled), orders, customers, saved builds, coupons.
* **Content:** homepage content blocks (hero copy, announcement, featured sections).

Mutations are server actions validated with Zod. Payments go through a `PaymentProvider`
interface (`pay-at-store` today; Razorpay adapter later). File uploads go through a
`StorageProvider` (local disk today; S3/R2 later).

## 7. Extension points for future features

AI builder (auto-build strategy interface), FPS estimates (performanceTier → benchmark
table), price alerts (PriceHistory), stock alerts (Inventory), EMI (PaymentProvider),
multi-vendor (Inventory.location / vendor), community builds (Build.visibility),
reviews (Product relation), 3D configurator (builder state is serialisable).

## 8. Implementation notes

* **Rendering.** Public pages are static or ISR (home, shop, gaming: 5 min; product and template
  pages: rendered on first request, then cached for 5 min). The signed-in user is loaded client-side
  from `/api/me`, so no public page needs cookies. Catalogue listings with filters, the builder,
  account and admin are dynamic.
* **Config caching.** Engine config and settings are read through `unstable_cache` tagged
  `engine-config`; admin saves call `revalidateTag`, so rule changes reach the builder immediately.
* **Builder data flow.** The client keeps a compact build (`{ slot: [productId, qty] }`) in
  localStorage. `/api/builder/options` resolves it on the server, evaluates every candidate with
  `evaluateCandidate`, hides impossible ones and explains why. The sidebar re-runs `validateBuild`
  locally on each change. Hidden options can be revealed; choosing one offers "Switch & clear",
  which removes the conflicting parts, so customers can change platform without dead ends.
* **Prices are never trusted from the client.** Carts are re-priced (`/api/cart/price`), and orders
  and quotes are priced from the database. Orders reserve stock; stock is deducted on delivery
  and released on cancellation.
* **Auth.** HS256 JWT in an httpOnly cookie (`jose`), bcrypt password hashes, and middleware guarding
  `/account` and `/admin`. Every admin server action calls `requireAdmin()` again.
