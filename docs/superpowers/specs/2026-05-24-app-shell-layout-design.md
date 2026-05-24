# App Shell & Responsive Layout Design

**Date:** 2026-05-24  
**Status:** Approved for implementation  
**Approach:** Unified app chrome + dynamic nav inset (Approach 2)  
**Desktop nav:** Option A — bottom bar on all screen sizes

## Problem

1. Page content and overlays appear under the fixed bottom nav because clearance uses a static `--bottom-nav-height: 6rem` that does not match the real rendered nav height (safe-area insets, label toggling, active-state transforms).
2. The home logo in `AppPageHeader` sits top-right and shifts vertically/horizontally as page titles vary in length.
3. Layout is mobile-first only; desktop gets narrow centered columns with no breakpoint strategy.

## Solution

### App chrome structure

- **AppTopBar:** Fixed top bar with `HomeLogoLink` always top-left; consistent height via `--app-topbar-height`.
- **AppPageHeader:** Content-only title/description block inside main — no logo.
- **NavOffsetProvider:** `ResizeObserver` on bottom nav sets `--app-nav-offset` on `document.documentElement`.
- **Overlays:** Toasts and reminder banner use `bottom: calc(var(--app-nav-offset) + offset)`.

### Responsive (Option A)

| Breakpoint | Content width |
|------------|---------------|
| default | `max-w-lg` |
| `md` | `max-w-2xl` |
| `lg` (standard pages) | `max-w-4xl` |
| `lg` (wide: shop, customize) | `max-w-6xl` |

Bottom nav remains on all sizes, centered in `max-w-6xl`.

### CSS variables

- `--app-topbar-height: 3.5rem` — fixed top chrome height
- `--app-nav-offset: 0px` — set dynamically by NavOffsetProvider; fallback 6rem in CSS
- `--bottom-nav-height` — retained as fallback default for `--app-nav-offset`

### Files

- `components/layout/app-top-bar.tsx` (new)
- `components/layout/nav-offset-provider.tsx` (new)
- `components/layout/app-page-header.tsx` — remove logo
- `components/layout/app-shell.tsx` — top bar + responsive widths
- `components/layout/app-nav.tsx` — forwardRef for measurement; contain active transform
- `components/layout/global-bottom-nav.tsx` — wrap with NavOffsetProvider
- `components/avatar/avatar-customize-layout.tsx` — same shell pattern
- `app/(app)/layout.tsx` — dynamic padding classes
- `app/globals.css` — CSS vars and utility classes
- `components/ui/toast-provider.tsx` — use `--app-nav-offset`
- `components/reminders/in-app-reminder-banner.tsx` — use `--app-nav-offset`

### Edge cases

- Nav hidden (logged out / onboarding): `--app-nav-offset` reset to `0px`.
- Safe-area: measured `offsetHeight` includes safe-area padding automatically.
- Home page `/avatar`: logo visible; optional `aria-current="page"` when active.

### Testing

- Scroll to bottom on Shop, Habits, Profile — content fully visible above nav.
- Trigger toast + reminder — no overlap with nav.
- Logo position stable across Avatar, Shop, Habits, Customize.
- Viewports: 375px, 768px, 1280px.
