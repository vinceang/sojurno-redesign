# ADR-0020 — Collections: a tenant discovery rail (events & places)

**Status:** Proposed · **Date:** 2026-06-18

> Promotes and **generalizes** ADR-0009 (event-driven hosting) from a date-boxed `Event` to a broader `Collection`; extends the capability-module pattern (ADR-0004); reaffirms the engine/tenant line (ADR-0002). Discovery/browse only — it does **not** reopen host-run event *mechanics* (availability windows, quantity locking), which stay deferred (ADR-0005).

## Context

ADR-0009 proposed events as a capability module and parked it with one condition: *"revisit after the two-tenant + gear proof lands."* That proof has landed (Phase 4 gear, hikers). Demand in affinity stays is event-shaped — runners converge on a race weekend — so a discovery layer that groups stays around those convergence points is the natural next capability.

One refinement on ADR-0009: it modeled an `Event` with a **date window**. But not every community is event-timed. Hikers orient around **places** (a trailhead, a park), which are evergreen, not dated. Forcing those into an "event" is the wrong shape. So this ADR generalizes the concept to a **Collection** with a `kind`:

- `kind: 'event'` — time-boxed, has a date + location (e.g. *Berlin Marathon · Sept 21*).
- `kind: 'place'` — evergreen destination (e.g. *John Muir Trail*, *Yosemite*).

A tenant's collections are whatever its community converges on: runners → races, hikers → trails/parks, music-festivals → festivals, climbers → crags.

## Decision (proposed)

### 1. `collections` capability module
A new optional capability flag (same shape as `gear`, → ADR-0004). Tenants with it gain a discovery rail + collection detail pages; tenants without it show nothing — no engine changes, no branching on tenant name. On for **runners** and **hikers** in this phase.

### 2. `Collection` domain object
```
Collection {
  id, tenant,
  kind: 'event' | 'place',
  title, summary, image,
  location?,            // both kinds may carry a place
  dateLabel?,           // event-kind only (display string in v1 — no real date logic)
  listingIds: string[]  // listings associated with this collection
}
```
Association is a simple id list (a listing can belong to several collections). No availability/booking logic — that remains the deferred ADR-0005 seam.

### 3. Tenant vocabulary supplies the rail label
`vocabulary.collectionsLabel` — runners: *"Upcoming races"*, hikers: *"Trails & parks"* (music-festivals would be *"Upcoming festivals"*, climbers *"Crags"*). The label is config; the rail and cards are generic.

### 4. UI — the Yahoo-style feature rail + detail page
- A horizontal **rail of `CollectionCard` tiles** (thumbnail + title + meta) at the **top of the tenant Explore page**, reusing the existing snap-scroll carousel mechanism (`CommunityListingRow`).
- A **`CollectionDetailPage`** at `/t/:tenant/collections/:collectionId`: hero (image + title + meta) over the listings filtered to that collection, reusing `ListingCard` / `ListingRow`. Discovery/browse only.

### 5. Mock data; no backend
Collections ship as static mock data alongside listings (→ ADR-0016 content model). Persistence (ADR-0017 / Supabase) stays **parked**; this feature does not promote it.

## Why
- **Reuses the capability pattern exactly** (ADR-0004) — a new module, not a new architectural concept.
- **Plays to the platform's moat** (ADR-0009): pre-existing community trust turns event coordination from cold recruitment into "runners hosting runners, this race weekend."
- **The `kind` generalization** keeps the engine/tenant line honest — events and places are one engine concept, differentiated by data, not by tenant-name conditionals.
- **Cheap and additive**: reuses the carousel and listing cards; no booking/availability work.

## Alternatives considered
- *Keep ADR-0009's `Event` (date-boxed) as-is* — rejected: trails/parks aren't time-boxed; forcing them into an event is the wrong model.
- *Universal (all tenants always have collections)* — rejected: violates the engine/tenant line; not every community converges on collections. Capability-gate it.
- *Build real event hosting (availability windows, quantity locking) now* — rejected: that's the deferred ADR-0005 seam; this ADR is discovery only.
- *Promote ADR-0017 (Supabase) and back this with a real table* — deferred by owner; mock data is sufficient at this stage.

## Consequences (if accepted)
- New `Collection` type + `COLLECTIONS` mock data + `getCollectionsByTenant` / `getCollection` helpers; `collectionIds`/`listingIds` association with listings.
- New `collections` capability on `Tenant.capabilities`; new `vocabulary.collectionsLabel` across all tenants.
- New route `/t/:tenant/collections/:collectionId`; new components `CollectionRail`, `CollectionCard`, `CollectionDetailPage` (generic, token-driven, frontend-design-guided).
- i18n keys (EN/ES/FR) for the rail heading affordances and detail-page chrome; collection content (title/summary) is single-language marketplace content (→ ADR-0016).
- **ADR-0009** is superseded by this ADR's *shape and naming* (Event → Collection); its capability-module decision and rationale are preserved and carried forward. Host-run event *mechanics* remain out of scope.
- Reaffirms ADR-0002 (engine/tenant separation) and ADR-0004 (capabilities); rides the ADR-0019 substrate (shadcn/Tailwind, tokens).

## Phasing (single phase, kit-first)
1. **Model** — `Collection` type, `collections` capability + `collectionsLabel` vocabulary, mock `COLLECTIONS` for runners (events) + hikers (places), listing association, helpers.
2. **Rail** — `CollectionCard` + `CollectionRail` at the top of Explore (capability-gated), reusing the carousel.
3. **Detail** — `CollectionDetailPage` + route; filtered listings via existing cards.
4. **i18n** — EN/ES/FR chrome.

Commit referencing ADR-0020; `progress.md` updated; hard stop at the boundary.
