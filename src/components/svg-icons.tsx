/**
 * Inline SVG icon components — zero-dependency alternative to `lucide-react`.
 *
 * Each component renders an inline `<svg>` element matching the visual design
 * of its corresponding Lucide icon. All icons follow the same 24×24 viewBox,
 * `currentColor` stroke, 2px stroke-width convention used by Lucide.
 *
 * These components are tree-shaken individually — unused icons add zero bytes
 * to the bundle. When using these instead of `lucide-react`, the project has
 * **no external icon dependency**.
 *
 * ## Usage
 *
 * These icons are not imported directly by consumer components. Instead,
 * they are re-exported from the barrel file (`@/components/icons`) when
 * the project is configured to use inline SVGs.
 *
 * @module svg-icons
 */

import type { SVGAttributes } from 'react'

/**
 * SVG icon props — identical to {@link IconProps} in `./icons.tsx`.
 *
 * Defined locally to avoid circular imports between this module
 * and the barrel file that re-exports these components.
 */
type SvgIconProps = SVGAttributes<SVGSVGElement> & {
  readonly className?: string
}

/**
 * Builds the common SVG wrapper attributes shared by all inline icons.
 *
 * Centralizes the standard Lucide-compatible SVG attributes to ensure
 * visual consistency and reduce repetition across icon components.
 * Consumer-provided props (e.g., `className`, `aria-hidden`) override
 * the defaults via object spread.
 *
 * @param props - Consumer-provided SVG attributes
 * @returns Merged SVG attributes with Lucide-compatible defaults
 */
function buildSvgProps(props: SvgIconProps): SvgIconProps {
  const { children: _children, ...rest } = props
  return {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...rest,
  }
}

/**
 * Dashboard/grid layout icon — matches Lucide's `LayoutDashboard`.
 *
 * Renders a 2×2 grid of rectangles with varying heights,
 * representing a dashboard widget layout.
 *
 * @param props - Standard SVG attributes including `className` for sizing
 *
 * @example
 * ```tsx
 * <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
 * ```
 */
export function LayoutDashboard(props: SvgIconProps) {
  return (
    <svg {...buildSvgProps(props)}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  )
}

/**
 * Document/file icon — matches Lucide's `FileText`.
 *
 * Renders a document page with a folded corner and horizontal
 * lines representing text content.
 *
 * @param props - Standard SVG attributes including `className` for sizing
 *
 * @example
 * ```tsx
 * <FileText className="w-5 h-5" aria-hidden="true" />
 * ```
 */
export function FileText(props: SvgIconProps) {
  return (
    <svg {...buildSvgProps(props)}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <line x1="10" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="13" x2="8" y1="9" y2="9" />
    </svg>
  )
}

/**
 * Calendar icon — matches Lucide's `Calendar`.
 *
 * Renders a calendar page with two hanging tabs at the top
 * and a horizontal divider separating the header from the body.
 *
 * @param props - Standard SVG attributes including `className` for sizing
 *
 * @example
 * ```tsx
 * <Calendar className="w-5 h-5" aria-hidden="true" />
 * ```
 */
export function Calendar(props: SvgIconProps) {
  return (
    <svg {...buildSvgProps(props)}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

/**
 * Bar chart icon — matches Lucide's `BarChart3`.
 *
 * Renders three vertical bars of varying heights on a horizontal
 * baseline, representing a statistical bar chart.
 *
 * @param props - Standard SVG attributes including `className` for sizing
 *
 * @example
 * ```tsx
 * <BarChart3 className="w-5 h-5" aria-hidden="true" />
 * ```
 */
export function BarChart3(props: SvgIconProps) {
  return (
    <svg {...buildSvgProps(props)}>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  )
}
