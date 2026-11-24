@AGENTS.md

# Akhals Recipes

## What this is
QR-code recipe platform for Akhals Spice & More (paying client): each spice packet's QR code opens recipes
for that spice; a small admin area lets the client manage recipes. Live work — treat production data as real.
Live URL / hosting: Vercel production (`akhalsrecipes.com` per the owner; README/code fallbacks still say
`akhalsrecipes.co.za` — `NEXT_PUBLIC_SITE_URL` decides canonical links). Push to `main` deploys.

## Stack
- Next.js 16.4.5 App Router, React 19.2, TypeScript strict, Tailwind 4, R3F/Three.js + GSAP hero
- npm (lockfile committed). Install: `npm install`
- Database / ORM: Neon Postgres via Prisma 6.19 (`prisma/schema.prisma`); no migrations — `prisma db push`
- File storage: admin uploads are stored as WebP bytes in Postgres (`MediaAsset`, written by
  `src/app/api/admin/upload/route.ts`) and served publicly at `/media/<name>` (`src/app/media/[name]/route.ts`).
  Vercel caps request bodies at 4.5 MB.
- Auth: NextAuth 4 credentials provider, JWT sessions, bcryptjs (`src/lib/auth.ts`)
- External services: Cloudflare Web Analytics beacon (production only)

## Architecture
- `src/app/(public pages)`, `src/app/recipes/*` — public site; `/recipes?spice=` is the QR landing
- `src/app/admin/*` — client-side admin UI; `src/app/api/admin/*` — admin JSON API
- `src/lib/recipes.ts` — all public reads; falls back to seed recipes in `src/data/` with no DB, on query
  failure, or when nothing is published
- `src/lib/revalidate-public.ts` — `revalidatePublicRecipePages()`; every admin recipe write calls it so the
  prerendered `/` and `/recipes/<slug>` pages refresh (guard: `src/app/api/admin/revalidation.test.ts`)
- `src/lib/validation.ts` — zod schemas for recipe create (`recipeInputSchema`, applies defaults) and update
  (`recipeUpdateSchema`, default-free partial — see Testing)
- `prisma/seed.ts` — runs on EVERY Vercel build against production. Its rules live in `prisma/seed-core.ts`
  (guard: `prisma/seed-core.test.ts`): refresh spices from code; insert the starter recipes only into an
  empty recipe table; create the admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD` only when no ADMIN user exists
  (never updates a user or password hash); retire placeholder slugs only for rows created before
  2026-07-09. Changing `ADMIN_PASSWORD` in Vercel no longer changes the live password — see README.
- Full architecture guide (outside this repo): `C:\Users\user\projects\project-guides\akhals-recipes.md`

## Commands
| Purpose | Command |
|---|---|
| Dev server | `npm run dev` |
| Format check | gap: no formatter configured |
| Lint | `npx eslint src` (9 pre-existing errors in hero/header/admin components as of 2026-11-23) |
| Type check | `npx tsc --noEmit` |
| Unit tests | `npm test` (Vitest, files `src/**/*.test.ts` and `prisma/**/*.test.ts`; no database needed) |
| E2E tests | gap: none |
| Production build | `npx next build` (Vercel runs `npm run vercel-build`) |
| DB schema / seed | `npx prisma db push` / `npx tsx prisma/seed.ts` — both hit whatever `DATABASE_URL` points at |

## Quality gate for this repo
`npm test` → `npx tsc --noEmit` → `npx eslint <changed files>` (whole-repo lint has known pre-existing
errors) → `npx next build` → `git diff` review. No CI.

## Testing
- Vitest (`vitest.config.ts`): resolves the `@/` alias so route handlers can be imported and called
  directly; Prisma, next-auth and next/cache are replaced with `vi.mock`. The config blanks `DATABASE_URL`
  so no test can reach a real database. Never add a test that does.
- Must stay covered: `src/lib/validation.test.ts` — updates must never fill in defaults. zod 4's
  `.partial()` still applies `.default()`, which made the Publish/Draft toggle wipe tips, tags, gallery and
  products (fixed 2026-11-23).
- Also must stay covered (2026-11-24 fixes): `src/app/api/admin/admin-auth.test.ts` (every admin handler
  401s without a session — add new handlers to its list), `src/app/api/admin/revalidation.test.ts`,
  `prisma/seed-core.test.ts` (seed never resurrects recipes or touches the admin), `src/lib/safe-callback.test.ts`,
  `src/lib/json-ld.test.ts`, `src/lib/auth.test.ts` + `src/app/api/track/route.test.ts` (rate limits),
  `src/app/api/admin/upload/route.test.ts` + `src/app/media/[name]/route.test.ts` (uploads in Postgres).

## Security-sensitive areas
- `/admin` and `/api/admin/*` are guarded by `src/middleware.ts`, and every `/api/admin/*` handler also
  calls `requireAdminSession()` (`src/lib/admin-session.ts`) first and returns 401 without a session.
  A new admin handler must do the same; `src/app/api/admin/admin-auth.test.ts` lists them all. Every
  user is effectively admin (`Role` unused).
- Rate limits (`src/lib/rate-limit.ts`, Postgres table `RateLimitBucket`, keys are HMACs of the client IP):
  login 10 attempts / 15 min per IP, checked in `authorize()` and failing closed; public `POST /api/track`
  60 / 10 min per IP (429 + Retry-After), failing open. Without `DATABASE_URL` it uses a per-process Map
  (dev only). Client IP comes from Vercel-set `x-forwarded-for`/`x-real-ip`.
- Untrusted input: admin recipe JSON (zod), uploads (sharp), login `callbackUrl` (only `/admin…` same-origin paths, `src/lib/safe-callback.ts`).

## Deployment
- Vercel serverless; ephemeral filesystem.
- Env (names only): `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`, NextAuth's
  `NEXTAUTH_SECRET`/`NEXTAUTH_URL` (read by next-auth), `VERCEL_ENV`.
- `vercel-build` = `prisma generate && prisma db push && tsx prisma/seed.ts && next build` — every deploy
  writes to the production DB (schema push + the idempotent seed above).

## Conventions
- Conventional commits; git identity is the GitHub noreply address.

## Definition of done (project additions)
- Any fix to a defect listed in `project-guides/OPEN-FINDINGS.md` gets a failing-first regression test and an
  entry in `project-guides/CHANGE-LOG.md`.
