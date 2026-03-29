-- ============================================
-- Instagram Bot — Database Schema
-- Phase 1: Scaffolding
--
-- This schema establishes the foundational data model with a
-- security-first approach. Key design decisions:
--
--   1. ENUMS — post_status enum enforces valid lifecycle states
--      at the database level, preventing invalid data before it
--      reaches the application. Adding new states later is a
--      single ALTER TYPE command.
--
--   2. INDEXES — Composite and partial indexes are created upfront
--      for anticipated query patterns (dashboard queries, scheduling
--      engine). Minimal storage overhead now; avoids table-locking
--      CREATE INDEX on large tables later.
--
--   3. TRIGGERS — The updated_at trigger automates timestamp
--      management, eliminating a class of application-level bugs
--      and ensuring audit accuracy from day one.
--
--   4. ROW LEVEL SECURITY — Enabled on ALL public tables immediately
--      after creation. Every table exposed via the Supabase API has
--      RLS enabled before any data can be inserted, ensuring there
--      is never a window where data is publicly accessible.
--
-- RLS Policy Summary:
--   users:     SELECT/UPDATE own row only (INSERT via service role or trigger)
--   posts:     ALL operations on own rows only
--   analytics: SELECT own post analytics only (INSERT/UPDATE via service role)
--
-- Run this file against your Supabase project via the SQL Editor
-- or the Supabase CLI: supabase db push
-- ============================================

-- Enable UUID generation extension (required for uuid_generate_v4())
create extension if not exists "uuid-ossp";

-- ============================================
-- POST STATUS ENUM
-- ============================================
-- Defines the lifecycle states of a post. Using a PostgreSQL enum
-- ensures type safety at the database level — invalid status values
-- are rejected before they reach the application.
--
-- Lifecycle transitions:
--   draft → scheduled → publishing → published
--                                  → failed
--
-- To add a new status in future phases:
--   ALTER TYPE public.post_status ADD VALUE 'new_status' AFTER 'existing_status';
-- ============================================
create type public.post_status as enum (
  'draft',
  'scheduled',
  'publishing',
  'published',
  'failed'
);

-- ============================================
-- USERS TABLE
-- ============================================
-- Links to Supabase auth.users via id (UUID).
-- The id column shares the same UUID as auth.users,
-- establishing a 1:1 relationship with cascade delete.
--
-- RLS: Users can only read and update their own profile.
-- INSERT is intentionally omitted — user rows should be created
-- via a database trigger on auth.users or the service role client,
-- never directly by the end user through the API.
-- ============================================
create table public.users (
  id uuid not null references auth.users on delete cascade,
  email text not null,
  instagram_token_encrypted text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (id)
);

-- SECURITY: Enable RLS immediately after table creation.
-- Without this, any client with the anon key can read/write all rows.
alter table public.users enable row level security;

-- Policy: Users can only view their own profile data.
-- Uses (select auth.uid()) subselect for performance optimization —
-- the function is evaluated once per query, not once per row.
create policy "Users can view their own data"
  on public.users for select
  using ((select auth.uid()) = id);

-- Policy: Users can only update their own profile data.
-- The updated_at column is auto-managed by the trigger below.
create policy "Users can update their own data"
  on public.users for update
  using ((select auth.uid()) = id);

-- ============================================
-- POSTS TABLE
-- ============================================
-- Stores user-created posts with scheduling and publication tracking.
--
-- RLS: Users have full CRUD access to their own posts only.
-- The ALL policy covers SELECT, INSERT, UPDATE, and DELETE.
-- On INSERT, the user_id must match auth.uid() or the row
-- will be rejected by RLS.
-- ============================================
create table public.posts (
  id uuid not null default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  caption text,
  media_url text,
  status public.post_status not null default 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),

  primary key (id)
);

-- SECURITY: Enable RLS immediately after table creation.
alter table public.posts enable row level security;

-- Policy: Users can perform all operations on their own posts.
-- The WITH CHECK clause is implicitly the same as USING for ALL policies,
-- ensuring INSERT and UPDATE also require user_id = auth.uid().
create policy "Users can manage their own posts"
  on public.posts for all
  using ((select auth.uid()) = user_id);

-- INDEX: Composite B-tree on (user_id, status).
-- Efficiently supports the most common dashboard query pattern:
-- "all posts by this user with status X" (e.g., all drafts, all published).
-- The leading column (user_id) also supports queries filtered by user alone.
create index idx_posts_user_status on public.posts(user_id, status);

-- INDEX: Partial B-tree on scheduled_at, filtered to scheduled posts only.
-- Phase 2 scheduling engine will query: "all posts due to be published".
-- The partial index keeps storage small — only rows with status='scheduled'
-- are indexed, not the entire table.
create index idx_posts_scheduled on public.posts(scheduled_at)
  where status = 'scheduled';

-- ============================================
-- ANALYTICS TABLE
-- ============================================
-- Stores engagement metrics for published posts.
-- Supports multiple snapshots per post (1:N relationship)
-- for tracking metric changes over time.
--
-- RLS: Read-only access scoped via post ownership.
-- Users can view analytics only for posts they own.
-- INSERT/UPDATE/DELETE have no policies — analytics data
-- should only be written by the service role client
-- (server-side ingestion from the Instagram API).
-- ============================================
create table public.analytics (
  id uuid not null default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  likes integer not null default 0,
  comments integer not null default 0,
  reach integer not null default 0,
  impressions integer not null default 0,
  created_at timestamptz not null default now(),

  primary key (id)
);

-- SECURITY: Enable RLS immediately after table creation.
alter table public.analytics enable row level security;

-- Policy: Users can only view analytics for posts they own.
-- Uses a subquery join to verify ownership through the posts table.
-- Performance note: monitor this subquery as data grows. If it becomes
-- a bottleneck, consider denormalizing user_id onto the analytics table.
create policy "Users can view analytics for their own posts"
  on public.analytics for select
  using (
    (select auth.uid()) = (
      select user_id from public.posts where id = post_id
    )
  );

-- INDEX: B-tree on post_id for joining analytics to posts.
-- Supports dashboard queries that fetch engagement metrics
-- alongside post details.
create index idx_analytics_post on public.analytics(post_id);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
-- Automatically sets updated_at to now() on every UPDATE to the
-- users table. This ensures the timestamp is always accurate
-- without requiring application-level code — eliminating a
-- common source of bugs where developers forget to set the
-- timestamp in update queries.
--
-- The function is defined as SECURITY DEFINER-safe (no elevated
-- privileges needed) and uses plpgsql for minimal overhead.
-- ============================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_users_updated
  before update on public.users
  for each row execute function public.handle_updated_at();
