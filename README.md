# The Computer Store — storefront & Custom PC Builder

A Next.js 15 + PostgreSQL rebuild of [thecomputerstore.linker.store](https://thecomputerstore.linker.store/)
for The Computer Store, Police Bazar, Shillong. The signature feature is a **Custom PC Builder** with
a real compatibility engine, alongside a full catalogue, cart/checkout, quotations and an admin panel.

Design, data model and engine architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Stack

Next.js 15 (App Router, React 19, TypeScript) · Tailwind CSS 4 · PostgreSQL + Prisma 6 · signed-cookie
auth (jose + bcrypt) · pdf-lib for quotations · Lucide icons · Vitest.

UI primitives (`src/components/ui`) follow the shadcn/ui pattern but are written in-repo, which keeps the
bundle small and avoids a Radix dependency.

## Getting started

```bash
npm install
cp .env.example .env         # then set AUTH_SECRET and SEED_ADMIN_PASSWORD
npm run db:local             # terminal 1: local PostgreSQL on :5433 (no Docker needed)
npm run db:push              # create tables
npm run db:seed              # categories, spec schemas, ~170 products, templates, rules, admin user
npm run dev                  # http://localhost:3000
```

Using your own PostgreSQL instead? Point `DATABASE_URL` at it and skip `db:local`.
For production, use `prisma migrate` (`npm run db:migrate`) instead of `db push`.

Admin: sign in at `/login` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` → `/admin`.

## Scripts

| Script | What it does |
|---|---|
| `dev` / `build` / `start` | Next.js dev server, production build, production server |
| `check` | TypeScript + unit tests |
| `test` | Compatibility-engine and auto-build tests (Vitest) |
| `db:local` | Embedded PostgreSQL for development (data in `.pgdata/`) |
| `db:push` / `db:migrate` / `db:seed` / `db:studio` | Prisma schema, migrations, seed data, data browser |

`next build` pre-renders cached pages (home, shop, gaming…), so `DATABASE_URL` must be reachable at build time.

## Where things live

```
src/lib/compat/        Compatibility engine (pure TS): rules, power model, scoring, CompatibilityService
src/lib/autobuild.ts   "Build it for me" strategy (only in-stock products)
src/server/            Prisma queries, builds, quotes, orders, PDF, payments & storage providers, admin actions
src/app/(store)/       Storefront pages (catalogue, product, builder, cart, account…)
src/app/admin/         Admin panel
src/app/api/           Route handlers (builder options, auto-build, builds, quotes/PDF, orders, search…)
prisma/                Schema and seed data (categories + spec schemas, products, templates)
```

## Before launch

- **Replace the sample customer reviews** (Admin → Homepage content). They are placeholders.
- **Confirm business hours** in `src/lib/site.ts` (not published on the current site) and add social links.
- Review the draft policy pages (`src/content/pages.ts`) against the store's real policies.
- Product prices/stock in the seed are indicative — update them in Admin → Products.
- Add product photos (Admin → Products → Upload images). Until then, category renders are shown.
- Set a strong `AUTH_SECRET`, a real `NEXT_PUBLIC_SITE_URL`, and swap the local storage driver for S3/R2
  (`src/server/storage.ts`) if you run more than one server.
- Online payments: implement `PaymentProvider` in `src/server/payments.ts` (Razorpay adapter) — the
  checkout currently offers pay-at-store and UPI/bank transfer.
