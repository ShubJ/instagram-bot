import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

/**
 * Creates a Supabase client for use in Server Components,
 * Server Actions, and Route Handlers.
 *
 * This client reads and writes auth cookies via the Next.js `cookies()` API.
 * The `setAll` method is wrapped in a try/catch because Server Components
 * have read-only cookie access — the middleware handles the actual session
 * refresh in that case.
 *
 * The client is parameterized with the {@link Database} type, providing
 * full type safety for all table queries.
 *
 * **Next.js version note:**
 * In Next.js 14, `cookies()` is synchronous and returns `ReadonlyRequestCookies`
 * directly. This function is therefore synchronous and returns a `SupabaseClient`
 * (not a `Promise`). If you upgrade to Next.js 15 — where `cookies()` becomes
 * async — add `async` to this function and `await` before the `cookies()` call.
 *
 * @returns A typed Supabase server client instance
 * @throws {Error} If required environment variables are missing
 *
 * @example
 * ```typescript
 * // In a Server Component
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default function Page() {
 *   const supabase = createClient()
 *   // For async operations, await the query — not the client creation:
 *   // const { data } = await supabase.from('users').select('*').single()
 * }
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

  // In Next.js 14, cookies() is synchronous — it returns ReadonlyRequestCookies.
  // NOTE: When upgrading to Next.js 15, cookies() becomes async. At that point,
  // add `async` to this function and change this line to:
  //   const cookieStore = await cookies()
  const cookieStore = cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component where cookies are read-only.
          // This is safe to ignore if middleware is refreshing sessions.
          // See: https://supabase.com/docs/guides/auth/server-side/nextjs
        }
      },
    },
  })
}
