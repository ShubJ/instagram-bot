import { Sidebar } from '@/components/sidebar'

/**
 * Dashboard route group layout.
 *
 * Renders the shared sidebar navigation alongside page content
 * in a horizontal flex layout. This layout applies to all pages
 * within the `(dashboard)` route group without adding a URL segment.
 *
 * Routes using this layout:
 * - `/dashboard`  → Dashboard overview
 * - `/posts`      → Posts management
 * - `/schedule`   → Scheduling interface
 * - `/analytics`  → Analytics display
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
