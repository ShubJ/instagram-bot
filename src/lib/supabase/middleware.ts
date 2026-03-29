import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'

/**
 * Refreshes the Supabase auth session on every matched request.
 *
 * Creates a Supabase server client within the middleware request/response
 * context, calls `getUser()` to revalidate the auth token against the
 * Supabase Auth server, and ensures updated cookies are forwarded in
 * the response.
 *
 * **Phase 1 behavior:** All routes are accessible without authentication.
 * The `getUser()` result is captured but only used for token refresh —
 * no redirects are enforced. A commented-out auth guard is provided for
 * Phase 2 activation.
 *
 * **Why `getUser()` and not `getSession()`?**
 * `getSession()` reads from local cookies without server revalidation,
 * which can return stale or tampered data. `getUser()` always contacts
 * the Supabase Auth server, making it the secure choice for middleware.
 *
 * @param request - The incoming Next.js middleware request
 * @returns A NextResponse with refreshed auth cookies
 * @throws {Error} If required environment variables are missing
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
        'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
        'are set in .env.local. See .env.example for reference.',
    )
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        )
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  // Revalidate the auth token against the Supabase Auth server.
  // IMPORTANT: Do NOT replace this with `supabase.auth.getSession()` —
  // `getSession()` only reads from cookies and may return stale/tampered data.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // TODO: Phase 2 — Uncomment the block below to enforce authentication.
  // This will redirect unauthenticated users to the login page for all
  // routes except /login and /auth/* (e.g., OAuth callback).
  //
  // if (
  //   !user &&
  //   !request.nextUrl.pathname.startsWith('/login') &&
  //   !request.nextUrl.pathname.startsWith('/auth')
  // ) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/login'
  //   return NextResponse.redirect(url)
  // }

  // Suppress unused-variable warning. The `user` value is intentionally
  // captured (not discarded) so Phase 2 can activate the auth guard
  // above without restructuring this function.
  void user

  return supabaseResponse
}
