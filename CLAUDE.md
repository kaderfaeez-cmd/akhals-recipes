@AGENTS.md

# Akhals Recipes

## What this is
QR-code recipe platform for Akhals Spice & More (paying client): each spice packet's QR code opens recipes
for that spice; a small admin area lets the client manage recipes. Live work — treat production data as real.
Live URL / hosting: Vercel production (`akhalsrecipes.com` per the owner; README/code fallbacks still say
`akhalsrecipes.co.za` — `NEXT_PUBLIC_SITE_URL` decides canonical links). Push to `main` deploys.

## Stack
- Next.js 16.2.10 App Router, React 19.2, TypeScript strict, Tailwind 4, R3F/Three.js + GSAP hero
- npm (lockfile committed). Install: `npm install`
- Database / ORM: Neon Postgres via Prisma 6.19 (`prisma/schema.prisma`); no migrations — `prisma db push`
- File storage: admin uploads write to local disk (`src/app/api/admin/upload/route.ts`) — does NOT work on
  Vercel's ephemeral filesystem (known gap)
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
- `prisma/seed.ts` — runs on EVERY Vercel build against production (upserts seed recipes, resets the admin
  password hash from env)
- Full architecture guide (outside this repo): `C:\Users\user\projects\project-guides\akhals-recipes.md`

## Commands
| Purpose | Command |
|---|---|
| Dev server | `npm run dev` |
| Format check | gap: no formatter configured |
| Lint | `npx eslint src` (9 pre-existing errors in hero/header/admin components as of 2026-11-23) |
| Type check | `npx tsc --noEmit` |
| Unit tests | `npm test` (`node --test`, files `src/**/*.test.ts`) |
| E2E tests | gap: none |
| Production build | `npx next build` (Vercel runs `npm run vercel-build`) |
| DB schema / seed | `npx prisma db push` / `npx tsx prisma/seed.ts` — both hit whatever `DATABASE_URL` points at |

## Quality gate for this repo
`npm test` → `npx tsc --noEmit` → `npx eslint <changed files>` (whole-repo lint has known pre-existing
errors) → `npx next build` → `git diff` review. No CI.

## Testing
- `node --test` with Node's type stripping; tests import siblings with the `.ts` extension
  (`allowImportingTsExtensions` is on; `noEmit` is on).
- Must stay covered: `src/lib/validation.test.ts` — updates must never fill in defaults. zod 4's
  `.partial()` still applies `.default()`, which made the Publish/Draft toggle wipe tips, tags, gallery and
  products (fixed 2026-11-23).

## Security-sensitive areas
- `/admin` and `/api/admin/*` are guarded by `src/middleware.ts`, and every `/api/admin/*` handler also
  calls `requireAdminSession()` (`src/lib/admin-session.ts`) first and returns 401 without a session.
  A new admin handler must do the same; `src/app/api/admin/admin-auth.test.ts` lists them all. Every
  user is effectively admin (`Role` unused).
- Public write: `POST /api/track` (page views) — no rate limit.
- Untrusted input: admin recipe JSON (zod), uploads (sharp), login `callbackUrl` (unchecked — known gap).

## Deployment
- Vercel serverless; ephemeral filesystem.
- Env (names only): `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`, NextAuth's
  `NEXTAUTH_SECRET`/`NEXTAUTH_URL` (read by next-auth), `VERCEL_ENV`.
- `vercel-build` = `prisma generate && prisma db push && tsx prisma/seed.ts && next build` — every deploy
  writes to the production DB.

## Conventions
- Conventional commits; git identity is the GitHub noreply address.

## Definition of done (project additions)
- Any fix to a defect listed in `project-guides/OPEN-FINDINGS.md` gets a failing-first regression test and an
  entry in `project-guides/CHANGE-LOG.md`.
