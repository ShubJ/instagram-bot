# Row Level Security (RLS) Policy Reference

## Security-First Principle

**Every public table has RLS enabled from day one.** This is non-negotiable. Without RLS, any client with the Supabase anon key can read and write all rows in public tables via the auto-generated REST API.

RLS is enabled on each table **immediately after creation** in `sql/schema.sql`, before any data can be inserted. This eliminates any window where data could be publicly accessible.

## Policy Overview

All policies use the `(select auth.uid())` subselect pattern for performance optimization — the function is evaluated once per query, not once per row.

| Table | Operation | Policy Name | Condition | Notes |
|---|---|---|---|---|
| `users` | SELECT | Users can view their own data | `(select auth.uid()) = id` | Users see only their own profile |
| `users` | UPDATE | Users can update their own data | `(select auth.uid()) = id` | Users edit only their own profile |
| `users` | INSERT | *(none)* | — | Created via service role or DB trigger |
| `users` | DELETE | *(none)* | — | Cascades from `auth.users` deletion |
| `posts` | ALL | Users can manage their own posts | `(select auth.uid()) = user_id` | Full CRUD on own posts |
| `analytics` | SELECT | Users can view analytics for their own posts | `(select auth.uid()) = (select user_id from public.posts where id = post_id)` | Read-only; ownership verified via subquery join |
| `analytics` | INSERT | *(none)* | — | Service role only (server-side ingestion) |
| `analytics` | UPDATE | *(none)* | — | Service role only |
| `analytics` | DELETE | *(none)* | — | Cascades from post deletion |

## Policy Details

### `public.users` — SELECT Policy

```sql
create policy "Users can view their own data"
  on public.users for select
  using ((select auth.uid()) = id);
```

Users can only read their own profile row. The `id` column is a UUID that matches `auth.users.id`, so `(select auth.uid())` directly compares against the primary key.

### `public.users` — UPDATE Policy

```sql
create policy "Users can update their own data"
  on public.users for update
  using ((select auth.uid()) = id);
```

Users can only modify their own profile. The `updated_at` column is auto-managed by the `on_users_updated` trigger, so it does not need to be set by the client.

### `public.posts` — ALL Policy

```sql
create policy "Users can manage their own posts"
  on public.posts for all
  using ((select auth.uid()) = user_id);
```

The `ALL` keyword covers SELECT, INSERT, UPDATE, and DELETE in a single policy. The `WITH CHECK` clause is implicitly the same as `USING` for `ALL` policies, ensuring that INSERT and UPDATE operations also require `user_id = auth.uid()`.

### `public.analytics` — SELECT Policy

```sql
create policy "Users can view analytics for their own posts"
  on public.analytics for select
  using (
    (select auth.uid()) = (
      select user_id from public.posts where id = post_id
    )
  );
```

Read-only access scoped via post ownership. The subquery joins to `public.posts` to verify the current user owns the post associated with each analytics row.

**Performance note:** This correlated subquery runs per-row. For Phase 1 data volumes this is negligible. If it becomes a bottleneck as data grows, consider denormalizing `user_id` onto the `analytics` table with a corresponding index.

## Performance Optimization

All policies use the `(select auth.uid())` subselect pattern instead of bare `auth.uid()`:

```sql
-- ✅ Correct: evaluated once per query
using ((select auth.uid()) = id);

-- ❌ Avoid: evaluated once per row (slower on large tables)
using (auth.uid() = id);
```

This is a [Supabase-documented optimization](https://supabase.com/docs/guides/database/postgres/row-level-security#use-security-definer-functions) that wraps the auth function call in a subselect so PostgreSQL evaluates it as a constant for the entire query execution.

## Client Usage Rules

### Anon / Authenticated Client (Browser & Server Components)
- **Always** goes through RLS
- Used for all user-facing queries
- Created via `src/lib/supabase/client.ts` (browser) or `src/lib/supabase/server.ts` (server)
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Service Role Client (Server-Side Only)
- **Bypasses** RLS entirely
- Used only for trusted server-side operations (analytics ingestion, admin tasks)
- Must NEVER be exposed to the browser
- Environment variable: `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix)
- Must NEVER appear in files with `'use client'` directive

## RLS Enforcement in the Application

The application enforces RLS at multiple layers:

1. **Database layer** — RLS policies on all `public.*` tables (this file)
2. **Middleware layer** — `src/lib/supabase/middleware.ts` refreshes auth tokens on every request, ensuring the Supabase client always has a valid session for RLS evaluation
3. **Client layer** — Both browser (`client.ts`) and server (`server.ts`) Supabase clients use the anon key, which always goes through RLS
4. **Environment layer** — The service role key (`SUPABASE_SERVICE_ROLE_KEY`) has no `NEXT_PUBLIC_` prefix, preventing accidental exposure to the browser

## Adding New Tables Checklist

When adding a new table in future phases:

1. ✅ `CREATE TABLE public.new_table (...);`
2. ✅ `ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;` — **immediately after creation**
3. ✅ Create appropriate policies using `(select auth.uid())` subselect pattern
4. ✅ Add corresponding TypeScript types in `src/lib/database.types.ts`
5. ✅ Document policies in this file
6. ✅ Test that unauthenticated access returns zero rows
7. ✅ Test that authenticated access returns only the user's own data

## Verification Queries

Run these in the Supabase SQL Editor to verify RLS is active:

```sql
-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

Expected output:
- All three tables (`users`, `posts`, `analytics`) should show `rowsecurity = true`
- Four policies should be listed matching the table above
