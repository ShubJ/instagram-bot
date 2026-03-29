/**
 * Centralized icon module — single import point for all icon components.
 *
 * All consumer components import icons from `@/components/icons` — **never**
 * directly from any icon library or `./svg-icons`. This indirection enables
 * swapping the icon implementation without modifying any consumer code.
 *
 * ## Current strategy: Inline SVGs (zero external dependencies)
 *
 * Icons are provided as hand-crafted inline SVG components in
 * `./svg-icons.tsx` that match the visual design of Lucide icons
 * (24×24 viewBox, `currentColor` stroke, 2px stroke-width).
 *
 * This approach was chosen for Phase 1 because:
 * - Only 4 icons are needed — no benefit from a large icon library
 * - Zero runtime dependency overhead
 * - Full control over SVG output (no upstream breaking changes)
 *
 * If future phases require 10+ icons, consider installing `lucide-react`
 * and updating this barrel to re-export from it instead. Consumer
 * components will not need any changes thanks to the `IconComponent`
 * abstraction type.
 *
 * ## Migrating to `lucide-react`
 *
 * 1. Install: `npm install lucide-react`
 * 2. Replace the icon re-exports below with:
 *    ```typescript
 *    export { LayoutDashboard, FileText, Calendar, BarChart3 } from 'lucide-react'
 *    ```
 * 3. No changes needed in sidebar.tsx or any other consumer.
 *
 * @module icons
 * @see docs/ICONS.md — full icon system documentation
 * @see ./svg-icons.tsx — inline SVG icon implementations
 */

import type { ComponentType, SVGAttributes } from 'react'

// ============================================
// Library-Agnostic Icon Types
// ============================================

/**
 * Props accepted by all icon components in this application.
 *
 * This interface is intentionally decoupled from any specific icon library
 * so that swapping implementations requires zero type changes in consumers.
 * It extends standard SVG element attributes, ensuring icons can receive
 * `className`, `aria-hidden`, `role`, and any other valid SVG prop.
 */
export interface IconProps extends SVGAttributes<SVGSVGElement> {
  /**
   * CSS class name(s) for sizing and styling the icon.
   * Typically `"w-5 h-5"` in the sidebar navigation.
   */
  readonly className?: string
}

/**
 * A React component that renders an SVG icon.
 *
 * Use this type to constrain icon props in component interfaces
 * (e.g., navigation items, button icons). It accepts any component
 * that takes {@link IconProps} — whether from an icon library like
 * `lucide-react` or hand-crafted inline SVGs.
 *
 * This type is intentionally narrower than React's `ElementType`,
 * which would accept HTML tag strings (`"div"`, `"span"`) and
 * class components with arbitrary props. `IconComponent` ensures
 * only valid SVG icon components can be assigned.
 *
 * @example
 * ```tsx
 * import type { IconComponent } from '@/components/icons'
 *
 * interface NavItem {
 *   label: string;
 *   icon: IconComponent; // ← narrow type, not ElementType
 * }
 * ```
 */
export type IconComponent = ComponentType<IconProps>

// ============================================
// Icon Exports — Inline SVGs
// ============================================

export {
  LayoutDashboard,
  FileText,
  Calendar,
  BarChart3,
} from './svg-icons'
