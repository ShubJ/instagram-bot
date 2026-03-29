import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js middleware entry point.
 *
 * Intercepts every matched request to refresh the Supabase auth session
 * via cookie exchange. This ensures auth tokens stay fresh and users
 * don't get unexpectedly logged out.
 *
 * The middleware delegates all logic to {@link updateSession} in
 * `src/lib/supabase/middleware.ts`, keeping this entry point minimal
 * and focused on configuration.
 *
 * @see src/lib/supabase/middleware.ts for session refresh implementation
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Common image file extensions (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
