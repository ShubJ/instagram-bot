import { redirect } from 'next/navigation'

/**
 * Root page handler.
 *
 * Performs a server-side redirect from `/` to `/dashboard`.
 * This avoids any client-side JavaScript and returns an
 * immediate HTTP 307 redirect response.
 */
export default function Home() {
  redirect('/dashboard')
}
