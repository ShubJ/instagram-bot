'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Calendar,
  BarChart3,
  type IconComponent,
} from '@/components/icons'

/**
 * Configuration for a single navigation item in the sidebar.
 *
 * The `icon` field is typed as {@link IconComponent} (`ComponentType<IconProps>`)
 * — a narrow, library-agnostic type defined in `@/components/icons`.
 *
 * This is intentionally **not** typed as React's broad `ElementType`
 * (which would accept `"div"`, `"span"`, class components, etc.) to
 * ensure only valid SVG icon components can be assigned. The type
 * accepts both `lucide-react` icons and hand-crafted inline SVG
 * components, so the icon library can be swapped without modifying
 * this file.
 */
interface NavItem {
  /** The route path this link navigates to */
  readonly href: string
  /** Display label for the navigation link */
  readonly label: string
  /**
   * Icon component to render alongside the label.
   *
   * Constrained to `ComponentType<IconProps>` via the {@link IconComponent}
   * alias — only components accepting SVG attributes are assignable.
   * Using `ElementType` here would be too broad (accepts `"div"`, etc.).
   */
  readonly icon: IconComponent
}

/**
 * Sidebar navigation items with their associated routes and icons.
 *
 * Icons are imported from `@/components/icons` — a centralized module
 * that abstracts the underlying icon library. To swap from inline SVGs
 * to `lucide-react` (or vice versa), update only the icons module; no
 * changes are needed in this file or any other consumer.
 *
 * @see src/components/icons.tsx — icon abstraction layer
 */
const navItems: readonly NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/posts', label: 'Posts', icon: FileText },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
] as const

/**
 * Determines whether a navigation item should be highlighted as active.
 *
 * Uses exact match for the `/dashboard` route (to avoid false positives)
 * and `startsWith` for all other routes to support future nested pages
 * (e.g., `/posts/123` should still highlight the "Posts" nav item).
 *
 * @param pathname - The current URL pathname from `usePathname()`
 * @param href - The navigation item's target href
 * @returns `true` if the nav item should be styled as active
 */
function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard'
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Sidebar navigation component for the dashboard layout.
 *
 * Renders a vertical navigation menu with icons and active state
 * highlighting based on the current route. Uses client-side navigation
 * via `next/link` for instant page transitions without full page reloads.
 *
 * **Active link styling:** `bg-blue-600 text-white`
 * **Inactive link styling:** `text-gray-400 hover:bg-gray-800 hover:text-white`
 *
 * @example
 * ```tsx
 * // In a layout component:
 * import { Sidebar } from '@/components/sidebar'
 *
 * export default function DashboardLayout({ children }) {
 *   return (
 *     <div className="flex min-h-screen">
 *       <Sidebar />
 *       <main className="flex-1 p-8">{children}</main>
 *     </div>
 *   )
 * }
 * ```
 */
export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-xl font-bold mb-8">Instagram Bot</h1>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = isNavItemActive(pathname, item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
