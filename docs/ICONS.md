# Icon System — Inline SVG Strategy

## Overview

This project uses **inline SVG icon components** with zero external icon dependencies. All consumer components import icons from `@/components/icons` — **never** directly from any icon library or from `./svg-icons`.

## Architecture

```
Consumer Components                 Icon Barrel                    Icon Implementations
─────────────────                   ───────────                    ────────────────────

src/components/sidebar.tsx    →     src/components/icons.tsx   →   src/components/svg-icons.tsx
  imports from @/components/icons     re-exports icons               (inline SVGs, zero deps)
                                      + IconProps type
                                      + IconComponent type
```

### Key Files

| File | Purpose |
|---|---|
| `src/components/icons.tsx` | **Barrel file** — the only file consumers import from. Exports icon components and the `IconComponent` type. |
| `src/components/svg-icons.tsx` | Inline SVG icon implementations. Zero external dependencies. Matches Lucide's visual design (24×24, `currentColor` stroke, 2px stroke-width). |
| `src/components/sidebar.tsx` | Primary consumer. Imports `LayoutDashboard`, `FileText`, `Calendar`, `BarChart3`, and `IconComponent` type from `@/components/icons`. |

### Type System

All icon components conform to the `IconComponent` type:

```typescript
// Defined in src/components/icons.tsx
interface IconProps extends SVGAttributes<SVGSVGElement> {
  readonly className?: string
}

type IconComponent = ComponentType<IconProps>
```

This type is **library-agnostic** — it accepts any React component that takes standard SVG attributes. Consumer components type their icon props with `IconComponent`, not any library-specific type like `LucideIcon` or React's overly-broad `ElementType`.

### Why `IconComponent` instead of `ElementType`?

React's `ElementType` accepts:
- HTML tag strings (`"div"`, `"span"`, `"input"`)
- Class components with arbitrary props
- Any function component regardless of prop shape

This provides no meaningful type safety for icon slots. `IconComponent` (`ComponentType<IconProps>`) constrains the type to only accept components that render SVG icons with the correct prop interface.

---

## Available Icons

| Export Name | Visual | Used In |
|---|---|---|
| `LayoutDashboard` | 2×2 grid (dashboard layout) | Sidebar — Dashboard link |
| `FileText` | Document with text lines | Sidebar — Posts link |
| `Calendar` | Calendar with hanging tabs | Sidebar — Schedule link |
| `BarChart3` | Vertical bar chart | Sidebar — Analytics link |

---

## Adding New Icons

1. Add a new function component to `src/components/svg-icons.tsx`:

   ```typescript
   export function NewIcon(props: SvgIconProps) {
     return (
       <svg {...buildSvgProps(props)}>
         {/* SVG path data here */}
       </svg>
     )
   }
   ```

   Follow the conventions:
   - 24×24 viewBox
   - `currentColor` stroke (inherits text color)
   - 2px stroke-width
   - `strokeLinecap="round"` and `strokeLinejoin="round"`
   - Use `buildSvgProps(props)` to apply defaults and forward consumer props

2. Add the export to `src/components/icons.tsx`:

   ```typescript
   export {
     LayoutDashboard,
     FileText,
     Calendar,
     BarChart3,
     NewIcon,        // ← add here
   } from './svg-icons'
   ```

3. Import in your consumer component:

   ```typescript
   import { NewIcon } from '@/components/icons'
   ```

---

## Migrating to `lucide-react` (Future)

If the project grows to need 10+ icons, consider switching to `lucide-react` for developer productivity:

1. Install the package:
   ```bash
   npm install lucide-react
   ```

2. Update `src/components/icons.tsx` to re-export from `lucide-react` instead of `./svg-icons`:
   ```typescript
   export { LayoutDashboard, FileText, Calendar, BarChart3 } from 'lucide-react'
   ```

3. **No changes needed** in `sidebar.tsx` or any other consumer — the `IconComponent` type is compatible with Lucide's `LucideIcon` type.

### Trade-offs

| Aspect | Inline SVGs (current) | `lucide-react` |
|---|---|---|
| **Bundle size** | Zero dependency overhead. Each icon is ~200–400 bytes of JSX. | Tree-shaken: ~3KB per icon. 4 icons ≈ 12KB. |
| **Icon count** | Only the icons we've hand-crafted. Adding more requires manual SVG work. | 1000+ icons available immediately via import. |
| **Visual consistency** | Must manually match Lucide's design system. | Guaranteed consistency — all icons from the same design system. |
| **Maintenance** | We own the SVG code — no upstream breaking changes. | Upstream updates may change icon designs or APIs. |
| **Developer experience** | Must find/create SVG paths manually. | Browse [lucide.dev/icons](https://lucide.dev/icons), import by name. |

---

## Design Principles

1. **Single import point** — All icons come from `@/components/icons`. Never import from `./svg-icons` directly in consumer components.
2. **Library-agnostic types** — `IconProps` and `IconComponent` are defined independently of any icon library. Consumer components type their icon props with `IconComponent`, not `ElementType` or `LucideIcon`.
3. **Visual parity** — Inline SVG icons match Lucide's design conventions (24×24 viewBox, 2px stroke, `currentColor`, round line caps/joins).
4. **Prop forwarding** — All implementations accept and forward standard SVG attributes (`className`, `aria-hidden`, `role`, etc.) via the `IconProps` interface.

---

## Deprecated Files

The `src/components/icons/` **directory** (not the `.tsx` file) contains empty stub files from a previous iteration. These files are not imported by any code and should be deleted when the build tooling supports file removal. With `moduleResolution: "bundler"`, `@/components/icons` resolves to `icons.tsx` (the file), not `icons/index.ts`.
