# Sojurno — Claude Code Project Briefing

## What this is

Sojurno is an affinity-based peer-to-peer stays platform. The core thesis: guests and hosts belong to the same shared-interest community. Think Airbnb for runners, hikers, cyclists, climbers — "stay with people who get why you're traveling."

The platform is **multi-tenant**: one shared engine supports multiple communities through configuration. Each community varies by color palette, vocabulary, trust signals, and enabled features, while sharing the same layout, component system, and interaction patterns.

This repo is the working prototype — designed and built as a single React application with client-side page routing.

---

## Tech stack

- **React 18** + **TypeScript**
- **Vite 6** (build tool, dev server)
- **Tailwind CSS 4** (utility-first styling via `@tailwindcss/vite`)
- **Lucide React** (icons)
- **Radix UI** (accessible primitives — Dialog, Tabs, etc.)
- **Plus Jakarta Sans** + **Instrument Serif** (Google Fonts, loaded via `src/styles/fonts.css`)
- **pnpm** (package manager — use `pnpm install`, not `npm install`)

To run locally:
```bash
pnpm install
pnpm build   # or wire up a dev server via vite
```

There is no backend, auth, or database. All data is hardcoded in `src/app/App.tsx`.

---

## File structure

```
src/
  app/
    App.tsx          ← entire application (single file, ~1700 lines)
  styles/
    fonts.css        ← Google Fonts imports
    theme.css        ← design tokens + Tailwind @theme inline mapping
    index.css        ← Tailwind base + token contract (do not break)
  imports/           ← user-uploaded assets (read-only)
```

All product logic, routing, data, and components live in `src/app/App.tsx`. No separate component files yet.

---

## Design tokens

Defined in `src/styles/theme.css`. Key values:

| Token | Value |
|---|---|
| `--background` | `#FAFAF8` (warm off-white) |
| `--foreground` | `#1A1916` (warm near-black) |
| `--card` | `#FFFFFF` |
| `--secondary` | `#F4F2EE` |
| `--muted` | `#EDEBE6` |
| `--muted-foreground` | `#78746D` |
| `--border` | `rgba(26,25,22,0.1)` |
| `--primary` | `#1A1916` |
| `--radius` | `0.875rem` (14px) |

Community accent colors (used inline, not in theme.css):

| Community | Accent | Light bg |
|---|---|---|
| Runners | `#E8651A` | `#FEF3EC` |
| Hikers | `#2D6A4F` | `#EEFAF4` |
| Cyclists (coming soon) | `#1A56DB` | `#EFF6FF` |
| Climbers (coming soon) | `#9333EA` | `#FAF5FF` |

Typography:
- **Display / headings:** Instrument Serif (Regular, Italic) — `fontFamily: "'Instrument Serif', Georgia, serif"`
- **Body / UI:** Plus Jakarta Sans (400, 500, 600, 700) — set on `body` in theme.css

---

## Page routing

Client-side only. `page` state in `App()` controls which page renders. No React Router.

| Page key | Component | Notes |
|---|---|---|
| `"landing"` | `LandingPage` | Hero, community listing rows, how it works, CTA |
| `"communities"` | `CommunitiesPage` | Directory of active + coming-soon communities |
| `"explore"` | `ExplorePage` | Community-scoped listing grid/list, filter bar |
| `"listing"` | `ListingDetailPage` | Image gallery, host card, gear section (hikers), booking panel |
| `"host"` | `HostDashboardPage` | Stats, reservations, requests, listings tabs |
| `"about"` | `AboutPage` | Maker profile, discipline cards, design system links |
| `"system"` | `DesignSystemPage` | Token reference, typography specimen, component links |

Active community is tracked in `activeCommunity: CommunityId` (`"runners"` | `"hikers"`).
Selected listing is tracked in `selectedListingId: string`.

---

## Key components (all in App.tsx)

| Component | Purpose |
|---|---|
| `Nav` | Sticky top nav with wordmark, community dropdown, auth buttons |
| `CommunityDropdown` | Scalable dropdown listing all communities with color dots, counts, coming-soon state |
| `ListingCard` | Grid/list card — equal height via `flex flex-col h-full`, price on its own row |
| `StarRating` | Inline star + rating + review count |
| `CommunityPill` | Colored badge for community identity |
| `SiteFooter` | 4-column footer (Brand, Product, About, Legal) — renders on every page |

---

## Data

Two listing arrays at the top of `App.tsx`:
- `RUNNER_LISTINGS` — 4 listings (Boston, Brooklyn, Chicago, San Francisco)
- `HIKER_LISTINGS` — 4 listings (Lone Pine CA, Harpers Ferry WV, Port Angeles WA, West Glacier MT)

Community config array `COMMUNITIES` — 4 entries (Runners, Hikers active; Cyclists, Climbers inactive).

All images are Unsplash via `unsplash(photoId, width, height)` helper which builds `https://images.unsplash.com/{id}?w=...&h=...&fit=crop&auto=format&q=80`.

---

## Design decisions worth knowing

- **No "System" link in the main nav** — moved to About page as a builder resource. Regular users don't need it.
- **CommunityDropdown** replaces the old 2-pill toggle — scales to N communities, shows listing counts, greys out coming-soon entries.
- **ListingCard** uses `min-h-[2.5rem]` on the title to keep cards the same height in a grid row regardless of title length. Price row uses `mt-auto` to pin to the bottom.
- **SiteFooter** is rendered in the App shell (not inside LandingPage) so it appears on every page.
- **Gear lending section** is Hikers-only on the listing detail — checkbox cards with community accent color when checked.
- Community accent colors are passed inline (not as CSS variables) to allow per-community theming without breaking the shared Tailwind token contract.

---

## Immediate next steps

1. **Generate Figma file** — use the Figma MCP (`generate_figma_design`) to push all 6 screens + a design system page into a new Figma file. The token spec above is the source of truth.
2. **Extract components** — App.tsx is a single large file by design (prototype phase). Before shipping, split into `components/`, `pages/`, and `data/` directories.
3. **Add React Router** — replace the `page` state switch with proper URL routing.
4. **Connect Supabase** — listings, users, bookings, and community config should come from a database.

---

## Brand voice

- Clear, warm, quietly premium.
- Less "adventure brand," more "trusted stay marketplace for people who share your context."
- Copy emphasises belonging, trust, shared rituals, practical local knowledge.
- Never "lorem ipsum." Use real cities, real race names, real trail names.
