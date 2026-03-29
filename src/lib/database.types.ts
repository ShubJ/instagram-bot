/**
 * Database type definitions for the Instagram Bot application.
 *
 * These types mirror the PostgreSQL schema defined in `sql/schema.sql`
 * and provide type-safe access to Supabase queries. All tables have
 * Row Level Security (RLS) enabled — queries through the anon/authenticated
 * client will only return rows the current user is authorized to access.
 *
 * @see sql/schema.sql for the canonical schema definition
 */

// ============================================
// Enum Types
// ============================================

/**
 * Lifecycle states of an Instagram post.
 *
 * Matches the `public.post_status` PostgreSQL enum.
 * Transitions: draft → scheduled → publishing → published
 *                                             → failed
 */
export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed'

// ============================================
// Row Types (what you get back from SELECT)
// ============================================

/**
 * A user profile row from `public.users`.
 *
 * RLS policies:
 * - SELECT: only own row (`auth.uid() = id`)
 * - UPDATE: only own row (`auth.uid() = id`)
 * - INSERT/DELETE: no policy (handled via auth.users cascade)
 */
export interface User {
  /** UUID from auth.users — serves as both PK and FK */
  readonly id: string
  /** User's email address */
  readonly email: string
  /** Encrypted Instagram API token (nullable, Phase 2+) */
  readonly instagram_token_encrypted: string | null
  /** Timestamp when the user profile was created */
  readonly created_at: string
  /** Timestamp of the last profile update (auto-managed by trigger) */
  readonly updated_at: string
}

/**
 * A post row from `public.posts`.
 *
 * RLS policies:
 * - ALL (SELECT, INSERT, UPDATE, DELETE): only own posts (`auth.uid() = user_id`)
 */
export interface Post {
  /** Auto-generated UUID primary key */
  readonly id: string
  /** FK to public.users — the post owner */
  readonly user_id: string
  /** Post caption text (nullable for drafts) */
  readonly caption: string | null
  /** URL to the post's media asset (nullable for drafts) */
  readonly media_url: string | null
  /** Current lifecycle status of the post */
  readonly status: PostStatus
  /** When the post is scheduled to be published (nullable) */
  readonly scheduled_at: string | null
  /** When the post was actually published (nullable) */
  readonly published_at: string | null
  /** Timestamp when the post record was created */
  readonly created_at: string
}

/**
 * An analytics row from `public.analytics`.
 *
 * RLS policies:
 * - SELECT: only for posts owned by the current user
 *   (verified via subquery join to posts.user_id)
 * - INSERT/UPDATE/DELETE: no policy (server-side only via service role)
 */
export interface Analytics {
  /** Auto-generated UUID primary key */
  readonly id: string
  /** FK to public.posts — the post these metrics belong to */
  readonly post_id: string
  /** Number of likes on the post */
  readonly likes: number
  /** Number of comments on the post */
  readonly comments: number
  /** Number of unique accounts that saw the post */
  readonly reach: number
  /** Total number of times the post was displayed */
  readonly impressions: number
  /** Timestamp when this analytics snapshot was recorded */
  readonly created_at: string
}

// ============================================
// Insert Types (what you send for INSERT)
// ============================================

/**
 * Fields required to insert a new user profile.
 *
 * Note: INSERT on `public.users` has no RLS policy — user creation
 * should be handled via a database trigger on `auth.users` or
 * through the service role client.
 */
export interface UserInsert {
  /** Must match the auth.users UUID */
  readonly id: string
  /** User's email address */
  readonly email: string
  /** Optional encrypted Instagram token */
  readonly instagram_token_encrypted?: string | null
}

/**
 * Fields required to insert a new post.
 *
 * RLS: The `user_id` must match `auth.uid()` for the insert to succeed.
 */
export interface PostInsert {
  /** FK to public.users — must match the authenticated user's ID */
  readonly user_id: string
  /** Post caption text */
  readonly caption?: string | null
  /** URL to the post's media asset */
  readonly media_url?: string | null
  /** Initial status (defaults to 'draft' at DB level) */
  readonly status?: PostStatus
  /** When to publish the post */
  readonly scheduled_at?: string | null
}

/**
 * Fields required to insert an analytics record.
 *
 * Note: INSERT on `public.analytics` has no RLS policy — analytics
 * ingestion should be done via the service role client (server-side only).
 */
export interface AnalyticsInsert {
  /** FK to public.posts */
  readonly post_id: string
  /** Number of likes (defaults to 0 at DB level) */
  readonly likes?: number
  /** Number of comments (defaults to 0 at DB level) */
  readonly comments?: number
  /** Reach count (defaults to 0 at DB level) */
  readonly reach?: number
  /** Impressions count (defaults to 0 at DB level) */
  readonly impressions?: number
}

// ============================================
// Update Types (what you send for UPDATE)
// ============================================

/**
 * Fields that can be updated on a user profile.
 *
 * RLS: Only the user themselves can update their own row.
 * The `updated_at` field is auto-managed by a database trigger.
 */
export interface UserUpdate {
  /** Updated email address */
  readonly email?: string
  /** Updated encrypted Instagram token */
  readonly instagram_token_encrypted?: string | null
}

/**
 * Fields that can be updated on a post.
 *
 * RLS: Only the post owner can update their own posts.
 */
export interface PostUpdate {
  /** Updated caption text */
  readonly caption?: string | null
  /** Updated media URL */
  readonly media_url?: string | null
  /** Updated lifecycle status */
  readonly status?: PostStatus
  /** Updated scheduled publication time */
  readonly scheduled_at?: string | null
  /** Updated actual publication time */
  readonly published_at?: string | null
}

// ============================================
// Supabase Database Type Map
// ============================================

/**
 * Complete database type map for use with Supabase client generics.
 *
 * Usage:
 * ```typescript
 * import { createClient } from '@/lib/supabase/server'
 * import type { Database } from '@/lib/database.types'
 *
 * const supabase = await createClient()
 * const { data } = await supabase
 *   .from('posts')
 *   .select('*')
 *   // data is typed as Post[] thanks to Database generic
 * ```
 *
 * All tables have RLS enabled. Queries through the anon/authenticated
 * client automatically filter rows based on the current user's session.
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: UserInsert
        Update: UserUpdate
      }
      posts: {
        Row: Post
        Insert: PostInsert
        Update: PostUpdate
      }
      analytics: {
        Row: Analytics
        Insert: AnalyticsInsert
        Update: Record<string, never>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      post_status: PostStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
