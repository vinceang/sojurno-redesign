# Sojurno — Design & Engineering Guidelines

This file is the source of truth for design decisions, component patterns, and engineering conventions in the Sojurno codebase. It is read by Claude Code at the start of every session and should be kept up to date as the product evolves.

---

## 1. Product overview

Sojurno is an affinity-based peer-to-peer stays platform. The thesis: guests and hosts belong to the same shared-interest community. "Stay with people who get why you're traveling."

The platform is **multi-tenant**: one shared engine supports multiple communities through configuration. Active communities: **Runners**, **Hikers**. In development: Cyclists, Climbers.

**Tone:** Clear, warm, quietly premium. Less "adventure brand," more "trusted stays marketplace for people who share your context." Copy emphasises belonging, trust, shared rituals, and practical local knowledge. Never lorem ipsum.

---

## 2. Design tokens

All tokens are defined in `src/styles/theme.css` and mapped to Tailwind via `@theme inline`. Do not use raw hex values in components — use the Tailwind token classes or CSS variables.

### Base palette

| Token | CSS variable | Value | Tailwind class |
|---|---|---|---|
| Background | `--background` | `#FAFAF8` | `bg-background` |
| Foreground | `--foreground` | `#1A1916` | `text-foreground` |
| Card surface | `--card` | `#FFFFFF` | `bg-card` |
| Secondary surface | `--secondary` | `#F4F2EE` | `bg-secondary` |
| Muted surface | `--muted` | `#EDEBE6` | `bg-muted` |
| Muted text | `--muted-foreground` | `#78746D` | `text-muted-foreground` |
| Border | `--border` | `rgba(26,25,22,0.1)` | `border-border` |
| Primary | `--primary` | `#1A1916` | `bg-primary` / `text-primary` |
| Primary foreground | `--primary-foreground` | `#FAFAF8` | `text-primary-foreground` |

### Community accent colors

These are applied **inline** (not as CSS variables) to allow per-community theming without breaking the shared token contract.

| Community | Accent | Light bg | Status |
|---|---|---|---|
| Runners | `#E8651A` | `#FEF3EC` | Active |
| Hikers | `#2D6A4F` | `#EEFAF4` | Active |
| Cyclists | `#1A56DB` | `#EFF6FF` | Coming soon |
| Climbers | `#9333EA` | `#FAF5FF` | Coming soon |

Usage pattern:
```tsx
// Always pull from the COMMUNITIES array, never hardcode per-component
const c = COMMUNITIES.find(x => x.id === community)
<span style={{ color: c.color, backgroundColor: c.lightBg }}>Runners</span>
```

### Spacing

Use Tailwind's default spacing scale. Key values in use:

| Purpose | Value |
|---|---|
| Card padding | `p-4` (16px) |
| Section padding | `px-4 sm:px-6` |
| Section vertical rhythm | `py-16` |
| Component gap (grid) | `gap-4` or `gap-5` |
| Nav height | `h-16` (64px) |

### Border radius

| Context | Value |
|---|---|
| Cards, panels | `rounded-2xl` (16px) |
| Large cards, hero modules | `rounded-3xl` (24px) |
| Buttons | `rounded-xl` (12px) |
| Badges / pills | `rounded-full` |
| Small tags | `rounded-md` (6px) |

### Elevation / shadows

| State | Class |
|---|---|
| Card at rest | `shadow-sm` |
| Card on hover | `shadow-xl` |
| Booking panel / sticky elements | `shadow-lg` |

---

## 3. Typography

### Fonts

- **Display / headings:** `Instrument Serif` — Regular (400), Italic. Loaded via Google Fonts in `src/styles/fonts.css`.
- **Body / UI:** `Plus Jakarta Sans` — 400, 500, 600, 700. Set on `body` in `src/styles/theme.css`.

### Usage rules

- Use Instrument Serif for **page titles, section headings, hero text, and the wordmark**. Apply via inline style — not a Tailwind class — to avoid font-family bleed:
  ```tsx
  style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
  ```
- Use italic Instrument Serif for the **wordmark** (`fontStyle: "italic"`) and for **pull quotes / host highlights**.
- Plus Jakarta Sans handles everything else: nav links, body copy, labels, buttons, captions.

### Scale reference

| Role | Size | Weight | Class |
|---|---|---|---|
| Hero headline | 56px / `text-6xl` | 400 | Instrument Serif |
| Page title | 40px / `text-4xl` or `text-5xl` | 400 | Instrument Serif |
| Section heading | 28–32px / `text-3xl` | 400 | Instrument Serif |
| Card heading | 16px / `text-base` | 600 | Plus Jakarta Sans |
| Body copy | 16px / `text-base` | 400 | Plus Jakarta Sans |
| Small body | 14px / `text-sm` | 400 | Plus Jakarta Sans |
| Caption / meta | 12px / `text-xs` | 400–500 | Plus Jakarta Sans |
| Eyebrow label | 11–12px / `text-xs` | 600 + `uppercase tracking-widest` | Plus Jakarta Sans |

---

## 4. Component library

### Nav

Sticky, `top-0`, `z-50`, `bg-background/95 backdrop-blur-sm`.

- **Wordmark:** Instrument Serif italic, links to landing page.
- **Community dropdown:** Replaces any pill toggle. Shows all communities with color dots, listing counts, coming-soon state. Scales to N communities — do not hardcode a list of active communities in the nav.
- **Primary links:** Communities, Explore, Host.
- **Auth buttons:** Sign in (border), Start hosting (dark fill).
- **System / Design System link:** Not in the nav. Lives in the About page as a builder resource.

### CommunityDropdown

Standalone component with `useRef` + `useEffect` for outside-click dismissal.

- Trigger: color dot + community name + chevron.
- Open state: 64px wide panel, lists all 4 communities. Active entry has a checkmark in community color. Inactive entries are `opacity-40 cursor-default`.
- Footer link: "All communities →" navigates to CommunitiesPage.

### ListingCard

Grid card for marketplace listings. **Always equal height** — this is enforced structurally:

```
card wrapper: flex flex-col h-full
  image: aspect-[4/3] flex-shrink-0
  body:   flex flex-col flex-1
    title: line-clamp-2 min-h-[2.5rem]   ← holds 2 lines regardless of actual length
    tags
    host row
    price row: mt-auto                    ← always pinned to bottom
```

- Price is **always on its own row**, separated from the host/badge row by a hairline rule. Never let the host badge and price share a row — the badge can overflow and overlap the price.
- Community pill overlays the image (top-left, `absolute top-3 left-3`).
- Hover state: `shadow-xl -translate-y-0.5` + image `scale-105`.

### CommunityPill / Badge

```tsx
<span style={{ color: c.color, backgroundColor: c.lightBg }}>
  {c.name}
</span>
```

Always derive colors from the community config object. Never hardcode per-community hex values in JSX outside of the `COMMUNITIES` constant.

### StarRating

```tsx
<Star className="w-3 h-3 fill-amber-400 text-amber-400" />
<span className="font-semibold">{rating}</span>
<span className="text-muted-foreground">({reviews})</span>
```

### Buttons

| Variant | Pattern |
|---|---|
| Primary (dark) | `bg-foreground text-background rounded-xl px-6 py-3 font-semibold hover:opacity-90` |
| Primary (community) | `style={{ backgroundColor: c.color }}` + white text |
| Secondary (border) | `border border-border rounded-xl text-foreground hover:bg-muted/60` |
| Ghost / text link | `text-muted-foreground hover:text-foreground transition-colors` |

### Filter pills

```tsx
<button className="flex items-center gap-2 text-sm border border-border/70 rounded-xl px-3 py-2 hover:bg-muted/60">
```

Active/community-scoped pill uses `borderColor: c.color, color: c.color`.

### Gear checkbox card (Hikers only)

```tsx
// checked state
style={{ borderColor: c.color, backgroundColor: c.lightBg }}
// unchecked state
style={{ borderColor: "rgba(26,25,22,0.1)" }}
```

Inner checkbox dot: `w-5 h-5 rounded border-2` — checked fills with `c.color`, shows `<Check>` icon in white.

### Booking panel

Sticky sidebar on listing detail (`sticky top-24`). Always `border border-border rounded-2xl shadow-lg bg-card`.

Contents in order:
1. Price + `/night`
2. Check-in / check-out grid (bordered, divided)
3. Nights stepper (−/+)
4. CTA button (community accent color)
5. Price breakdown (subtotal, service fee, total)
6. Trust badge (community light bg)

### SiteFooter

4-column layout: Brand, Product, About, Legal. Rendered in the App shell — **not** inside any page component — so it appears on every page including future ones.

Bottom bar: active community pills + `"+ more coming"`.

---

## 5. Page structure

### Routing

Client-side only. `page` state in `App()`. No React Router (yet — planned migration).

| Key | Page | Notes |
|---|---|---|
| `"landing"` | LandingPage | Hero, rows, how it works, CTA |
| `"communities"` | CommunitiesPage | Directory |
| `"explore"` | ExplorePage | Community-scoped grid/list |
| `"listing"` | ListingDetailPage | Detail + booking panel |
| `"host"` | HostDashboardPage | Stats, tabs |
| `"about"` | AboutPage | Maker profile + design system links |
| `"system"` | DesignSystemPage | Token reference, builder tools |

`activeCommunity: CommunityId` (`"runners" | "hikers"`) scopes ExplorePage and ListingDetailPage.

### LandingPage layout order

1. Hero (full-bleed, ~88vh, image + overlay + search bar + ghost CTA)
2. Community rows (Runners ×4, Hikers ×4 listing cards)
3. "Create a Community" strip (dashed border, `+` icon)
4. "How it works" band (muted bg, 3 columns, faded numerals)
5. Dark CTA module (foreground bg, white text)
6. SiteFooter (via App shell)

---

## 6. Data contracts

```typescript
type CommunityId = "runners" | "hikers" | "cyclists" | "climbers";

interface Listing {
  id: string;
  title: string;
  location: string;       // "Boston, MA"
  neighborhood: string;   // "Back Bay"
  price: number;          // per night, USD
  rating: number;         // e.g. 4.97
  reviews: number;        // count
  host: {
    name: string;
    avatar: string;       // Unsplash photo ID (not full URL)
    badge: string;        // community credential, e.g. "26 marathons"
    [key: string]: string; // additional credential fields
  };
  image: string;          // Unsplash photo ID
  tags: string[];         // max 2 shown in card; full list on detail page
  highlight: string;      // 1-sentence italic host quote shown on detail page
  gear?: string[];        // Hikers only — list of loanable items
}

interface Community {
  id: CommunityId;
  name: string;
  tagline: string;
  description: string;
  listings: number;
  cities: number;
  color: string;          // accent hex
  lightBg: string;        // tinted surface hex
  image: string;          // Unsplash photo ID
  tags?: string[];        // activity sub-types shown as pills
  active: boolean;
}
```

### Image helper

```typescript
function unsplash(id: string, w: number, h: number): string {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}
```

All images reference Unsplash photo IDs only. Never embed full URLs in data — always pass through `unsplash()`.

### Canonical seed data

The mock data created during the initial prototype phase is intentional and should be **preserved as the canonical seed dataset**. It was written to feel real — real cities, real race names, real trail names, real host credentials — and serves as the quality bar for any future data, whether seeded or user-generated.

**Runners — 4 listings:**
- Priya S., Boston MA (Back Bay) — 26 marathons, 3:28 PR. Studio near race bag check. $112/night.
- Jordan K., Brooklyn NY (Park Slope) — NYC Marathon pacer, 3:55 PR. Brownstone near Prospect Park. $95/night.
- Mei L., Chicago IL (Grant Park) — Boston Qualifier, 3:41 PR. Flat near marathon finish. $138/night.
- Daniel R., San Francisco CA (Marina District) — Ultra runner, 50K finisher. Suite near Crissy Field. $149/night.

**Hikers — 4 listings:**
- Sam O., Lone Pine CA (Eastern Sierra) — JMT thru-hiker ×3. Timber cabin, 8 min to JMT trailhead. $87/night.
- Rene F., Harpers Ferry WV (Blue Ridge) — AT section hiker. Barn loft near Appalachian trailhead. $72/night.
- Kai B., Port Angeles WA (Olympic NP gateway) — Olympic NP ranger (ret.), 20 yrs backcountry. Guest house. $94/night.
- Lily C., West Glacier MT (North Fork) — Glacier guide, 14 yrs guiding. Modern cabin. $118/night.

**Why this data matters:** The host credentials (marathon counts, trail completions, ranger background) are the primary trust signals in Sojurno's affinity model. They should feel specific and earned — not generic. When replacing seed data with real user data, maintain this same level of specificity in the `host.badge` and `highlight` fields.

---

## 7. Community theming — adding a new community

To add a new community (e.g. Cyclists going from coming-soon to active):

1. **Add to `COMMUNITIES` array** in `App.tsx`:
   ```typescript
   {
     id: "cyclists",
     name: "Cyclists",
     tagline: "...",
     description: "...",
     listings: 0,
     cities: 0,
     color: "#1A56DB",
     lightBg: "#EFF6FF",
     image: "photo-XXXXXXXXXXXXXXXXXX",
     tags: ["Road", "Gravel", "Track", "Gran Fondo"],
     active: true,  // ← flip this
   }
   ```

2. **Add listings array** `CYCLIST_LISTINGS: Listing[]` following the same shape.

3. **Update ExplorePage** to handle `community === "cyclists"` — add relevant filter pill labels and pass the correct listings array.

4. **Update ListingDetailPage** — add community-specific amenity copy and any unique sections (e.g. gear for hikers, elevation data for cyclists).

5. **Update the `CommunityId` type** to include the new id.

Nothing else needs changing — the Nav dropdown, footer pills, community cards, and `CommunityPill` all derive from `COMMUNITIES` automatically.

---

## 8. Interaction conventions

- **Hover:** cards lift with `shadow-xl -translate-y-0.5`; images scale `scale-105`; all transitions use `duration-200` or `duration-300`.
- **Focus:** `focus:outline-none focus-visible:ring-2 focus-visible:ring-ring` on all interactive elements.
- **Disabled:** `opacity-40 cursor-default` for coming-soon community entries.
- **Active nav link:** `text-foreground font-semibold` vs `text-muted-foreground` for inactive.
- **Tab underline:** `border-b-2 border-foreground -mb-px` for active, `border-transparent` for inactive.
- **Dropdown outside-click:** always use `useRef` + `useEffect` with `document.addEventListener("mousedown", ...)`.

---

## 9. Accessibility floor

- All interactive elements must have `focus-visible:ring-2 focus-visible:ring-ring`.
- Images must have descriptive `alt` text. Decorative images use `alt=""`.
- `aria-label` on icon-only buttons (menu toggle, night stepper +/−, view mode toggle).
- `aria-pressed` on toggle buttons (gear checkboxes, view mode).
- `aria-haspopup` + `aria-expanded` on the community dropdown trigger.
- Body text contrast must meet AA (4.5:1). Muted foreground `#78746D` on `#FAFAF8` is the minimum in use — do not go lighter.

---

## 10. Engineering conventions

- **Single file during prototype phase.** All components, data, and logic live in `src/app/App.tsx`. Do not split into separate files until the prototype is approved for production.
- **No React Router yet.** Routing is `page` state. Plan to migrate to React Router when moving to production.
- **No backend.** All data is hardcoded. Supabase integration is planned.
- **pnpm only.** Do not use `npm install`. Use `pnpm install`.
- **Tailwind token classes over raw values.** Use `bg-background`, `text-muted-foreground`, etc. Only use inline styles for community accent colors and font-family overrides.
- **No comments in code** unless the WHY is non-obvious. Do not narrate what the code does.
- **Real content only.** Never use lorem ipsum, placeholder names, or generic filler. Use real city names, real race names, real trail names.

---

## 11. Screenshots to capture

Add screenshots to `src/imports/` and reference them here once captured. Suggested captures (take at 1440px viewport width):

| File | Page | What to show |
|---|---|---|
| `screen-landing.png` | Landing | Full above-the-fold hero |
| `screen-landing-cards.png` | Landing | Community listing rows |
| `screen-communities.png` | Communities | Full directory page |
| `screen-explore-runners.png` | Explore | Runners grid with filter bar |
| `screen-explore-hikers.png` | Explore | Hikers grid |
| `screen-listing-runners.png` | Listing detail | Runners listing full page |
| `screen-listing-hikers.png` | Listing detail | Hikers listing showing gear section |
| `screen-host-dashboard.png` | Host dashboard | Reservations tab |
| `screen-about.png` | About | Profile + builder resources |
| `screen-nav-dropdown.png` | Nav | Community dropdown open state |

To embed a screenshot in this file once captured:
```markdown
![Landing page hero](../src/imports/screen-landing.png)
```

---

## 12. Migration guide — porting an existing prototype to this UI

Use this checklist when migrating components or pages from a previous prototype into the Sojurno design system.

### Step 1 — Audit existing components

List every component in the old prototype and map it to the new system:

| Old component | New equivalent | Notes |
|---|---|---|
| Any card component | `ListingCard` | Enforce equal height pattern |
| Any toggle / tab | Community dropdown or tab with border-b-2 pattern | |
| Any modal | Radix `Dialog` | |
| Any button | New button variants (see §4) | Replace all custom button styles |
| Any badge / tag | `CommunityPill` or tag span pattern | |
| Any nav | `Nav` component | Remove System link |
| Any footer | `SiteFooter` | Must render at App shell level |

### Step 2 — Replace design tokens

Find and replace all hardcoded color values in the old codebase:

```
Old background color  →  var(--background) / bg-background
Old text color        →  var(--foreground) / text-foreground
Old border color      →  var(--border) / border-border
Old card color        →  var(--card) / bg-card
Old muted text        →  var(--muted-foreground) / text-muted-foreground
```

For community-specific colors, ensure they are derived from the `COMMUNITIES` array, never hardcoded per-component.

### Step 3 — Replace typography

```
Old heading font   →  Instrument Serif, inline style
Old body font      →  Plus Jakarta Sans (set on body in theme.css)
Old monospace      →  Only for code/token labels; use font-mono Tailwind class
```

### Step 4 — Migrate data

Reshape old listing/property objects to match the `Listing` interface in §6. Key fields to check:
- `host.badge` — should be the community credential (e.g. "26 marathons"), not a generic role
- `host.avatar` — should be an Unsplash photo ID, not a full URL
- `image` — Unsplash photo ID only
- `tags` — max ~4, shown truncated at 2 in card view
- `highlight` — 1-sentence quote shown italicised on the detail page
- `gear` — Hikers only; array of loanable item names

### Step 5 — Port page by page

Suggested order:
1. Landing page (highest impact, establishes visual baseline)
2. Explore page (tests card grid, filter bar)
3. Listing detail (most complex — gallery, host card, booking panel, optional gear section)
4. Communities directory
5. Host dashboard
6. About page

### Step 6 — Verify

- [ ] All cards in a grid row are equal height
- [ ] Price is on its own row in listing cards (not sharing a row with the host badge)
- [ ] Community dropdown scales to all 4 communities, coming-soon entries are greyed out
- [ ] SiteFooter appears on every page
- [ ] System/Design System link is not in the nav — only in the About page
- [ ] No raw hex values in JSX outside of `COMMUNITIES` constant
- [ ] All interactive elements have visible focus states
- [ ] Font is Plus Jakarta Sans on body, Instrument Serif on headings
- [ ] `pnpm install` works cleanly
