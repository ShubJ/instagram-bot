import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

/**
 * Creates a Supabase client for use in browser (Client Components).
 *
 * This client automatically handles cookie-based auth sessions
 * in the browser context. All queries are subject to Row Level Security
 * policies — the client can only access data that the authenticated
 * user is authorized to see.
 *
 * The client is parameterized with the {@link Database} type, providing
 * full type safety for all table queries (e.g., `.from('posts').select('*')`
 * returns typed `Post[]`).
 *
 * @returns A typed Supabase browser client instance
 * @throws {Error} If required environment variables are missing
 *
 * @example
 * ```typescript
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 *
 * const supabase = createClient()
 * const { data: posts } = await supabase.from('posts').select('*')
 * // posts is typed as Post[] | null
 * ```
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
        'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
        'are set in .env.local. See .env.example for reference.'
    )
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
