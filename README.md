# Akhals Spice & More — Recipe Platform

Premium recipe platform for the Akhals Spice & More range. Every spice packet
carries a QR code that lands customers on `akhalsrecipes.co.za/recipes`,
filtered to the recipes written for that exact blend.

**Not an e-commerce site** — a luxury cookbook on the web: cinematic 3D spice
hero, editorial typography, instant recipe search, mobile cooking mode, and a
full admin panel.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS 4** — cream/charcoal editorial design system
- **React Three Fiber + Three.js** — instanced 3D spice field (cinnamon,
  star anise, cardamom, cloves, chilli, coriander, peppercorns, turmeric dust)
- **GSAP ScrollTrigger** — scroll-scrubbed hero choreography
- **Framer Motion** — steam reveals, card transitions, cooking mode
- **Prisma + PostgreSQL** — recipes, spices, users, scan analytics
- **NextAuth** — credentials auth for the admin panel
- **sharp** — automatic WebP compression + responsive sizes on upload

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in values
npx prisma generate
npm run dev
```

The site runs **without a database** — it serves the built-in seed recipes
from `src/data/recipes.ts`. Admin login falls back to `ADMIN_EMAIL` /
`ADMIN_PASSWORD` from env.

### With Postgres

```bash
# set DATABASE_URL in .env.local, then:
npx prisma db push     # create schema
npx prisma db seed     # spices + recipes + admin user
```

The Vercel build runs the same seed on every deploy, so it is written to be
safe to repeat (`prisma/seed-core.ts`): it refreshes the spice catalogue from
code, inserts the starter recipes only when the recipe table is empty, and
creates the admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` only when no admin user
exists. It never updates an existing user.

**Changing the admin password:** editing `ADMIN_PASSWORD` in Vercel does not
change an existing password. Delete the admin row from the `User` table (Neon
console), set the new `ADMIN_PASSWORD`, and redeploy: the seed creates the
admin again.

## Key routes

| Route | Purpose |
|---|---|
| `/` | Cinematic scroll homepage |
| `/recipes` | QR-code landing — search / filter / sort dashboard |
| `/recipes?spice=<slug>` | Pre-filtered per packet (QR target) |
| `/recipes/[slug]` | Recipe page + cooking mode + Recipe JSON-LD |
| `/admin` | Recipe management (auth required) |
| `/admin/media` | Upload → WebP + 480/960/1600 responsive sizes |
| `/admin/analytics` | Scans, top recipes, devices, locations |

## Rate limits

Admin login is limited to 10 attempts per 15 minutes per IP, and the public
view beacon `POST /api/track` to 60 per 10 minutes per IP. Counters live in the
`RateLimitBucket` table (created by `prisma db push` in the Vercel build), so
every serverless instance shares them.

## QR codes

Point each packet's QR at
`https://akhalsrecipes.co.za/recipes?spice=<spice-slug>` — slugs live in
`src/data/spices.ts` (e.g. `mother-in-law-masala`, `durban-special`).

## Performance notes

- Hero 3D: instanced meshes (7 draw calls for ~115 spices) + one Points cloud;
  DPR capped at 1.5; software renderers (SwiftShader etc.) automatically get
  the photographic fallback hero.
- `prefers-reduced-motion` disables the scroll scenes entirely.
- Recipe pages are statically generated with full Recipe schema for Google.
  Admin creates, edits, Publish/Draft changes and deletes call
  `revalidatePublicRecipePages()` (`src/lib/revalidate-public.ts`), so `/`,
  `/recipes`, every `/recipes/<slug>` page and the sitemap refresh on the next
  visit instead of waiting for a redeploy.

## Production upload note

`/api/admin/upload` writes to `public/uploads` — fine on a VPS; on Vercel the
filesystem is ephemeral, so swap in Vercel Blob or S3 before relying on the
media library in production.
