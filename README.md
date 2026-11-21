# instagram-bot

A dashboard for planning, scheduling and tracking Instagram posts, built on Next.js 14 and Supabase.

> Status: phase 1, scaffolding. Routing, auth plumbing, database schema and the dashboard shell are in place. Instagram API integration comes next.

## What's in it

- **Next.js 14 App Router** with a dashboard route group: `/dashboard`, `/posts`, `/schedule`, `/analytics`
- **Supabase SSR auth** via `@supabase/ssr`. `middleware.ts` refreshes the session cookie on every request, with separate browser and server clients in `src/lib/supabase`
- **Postgres schema** in `sql/schema.sql`: `users`, `posts` (with a `post_status` enum) and `analytics`
- **Row-level security** policies documented in `sql/RLS_POLICIES.md`
- **Typed database access** through generated types in `src/lib/database.types.ts`
- **Inline SVG icon system** with zero icon dependencies, described in `docs/ICONS.md`
- TypeScript in `strict` mode, ESLint and Tailwind CSS v3

## Run it locally

```bash
git clone https://github.com/ShubJ/instagram-bot.git
cd instagram-bot
npm install
cp .env.example .env.local
```

Fill in `.env.local` from your Supabase project settings:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Apply `sql/schema.sql` in the Supabase SQL editor, then:

```bash
npm run dev
```

The app runs on http://localhost:3000.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build with type checking |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

Build output and checks are recorded in `docs/BUILD_VERIFICATION.md`.

## Project layout

```
src/
  app/(dashboard)/   dashboard, posts, schedule, analytics pages
  components/        sidebar and icon system
  lib/supabase/      browser, server and middleware clients
sql/                 schema and RLS policies
__tests__/           scaffolding tests
```
