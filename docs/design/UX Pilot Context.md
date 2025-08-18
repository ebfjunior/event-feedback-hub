# Event Feedback HUB - UI/UX Design Brief

You are designing UI/UX mocks for "Event Feedback HUB" — a small, anonymous Rails 8 + Hotwire app to submit and browse event feedback with realtime updates and infinite scroll. Use Tailwind CSS + shadcn/ui components. Output Figma-ready wireframes and high-fidelity mocks with a lightweight component library and interaction notes.

## Objectives

- Anonymous feedback submission and browsing
- Realtime updates via Action Cable (visual reconnect state + graceful fallback)
- Server-side filters (event, rating), sort (newest/highest), infinite scroll (keyset)
- Accessible, responsive UI (desktop + mobile)

## Constraints and Non-Goals

- No auth, profiles, moderation, or rate limiting
- English-only; no edit/delete
- Store raw text; escape on render (no Markdown/HTML rendering)
- Rails-rendered HTML with Hotwire; prefer progressive enhancement, not SPA patterns

## Branding & System

- Use Tailwind defaults and shadcn/ui components (neutral palette, good contrast)
- Light and dark mode variants
- Use clear semantic structure that works well with Turbo Frames/Streams

## Screens to Deliver

### 1) Home (primary)

**Header:** "Events Feedback HUB"

**Controls bar** (sticky at top of stream section on scroll):
- EventSelect (dropdown with seeded events: "Keynote", "Workshop A/B", "Product Panel")
- RatingSelect (1–5)
- SortToggle: Newest (default) / Highest

**Submission Form** (sticky at page top):
- Textarea (1–1000 chars), character counter, placeholder "Your feedback…"
- Star rating as an accessible radio group (labels "1 star"…"5 stars"; keyboard 1–5 + arrows)
- Submit button with loading/disabled states
- Optimistic UI: insert a "pending" FeedbackCard with subtle shimmer + "Sending…"; reconcile on success
- Validation states: missing event, rating out of range, text too short/long

**Live Stream:**
- List of FeedbackCard items (star icons, escaped text, event name, relative timestamp)
- Infinite scroll (IntersectionObserver): loading spinner row; page-size ~20
- Empty states: no results (filters), initial empty feed
- Realtime behavior:
  - If filters match: insert new item
  - Sort=Newest: prepend at top
  - Sort=Highest: ideally insert by (rating desc, created_at desc, id desc); acceptable cutline: append + subtle "Order refreshed" hint
- Reconnect banner if websocket drops; degrade to polling first page every 5s (show subtle "Reconnecting…")

### 2) Optional Event View (if time permits)

- Same stream but scoped to a single event
- Optional Summary Panel (feature-flagged): header "AI Summary", bullets, updated_at; hidden if disabled/unavailable

## Components (deliver a small library)

- EventSelect, RatingSelect, SortToggle
- SubmitForm (textarea + star radio group + submit)
- FeedbackCard (stars, text, event name, relative time, subtle dividers)
- InfiniteList (container + loading row + sentinel)
- ReconnectBanner (non-blocking, dismissible)
- EmptyState, ErrorState components

## States & Specs to Show

- Loading, error, empty, disabled, success
- Form validation: inline messages + aria-describedby; focus management
- Star radio group: visible focus ring, labels, tooltips for keyboard hints
- Optimistic/pending card vs. confirmed card visuals
- Realtime insert highlight (brief background pulse)
- Responsive breakpoints: mobile-first (sm), tablet (md), desktop (lg+). Show how controls stack on small screens
- Dark mode tokens and contrast compliance (WCAG AA)
- Content safety: show escaped text examples (e.g., "<3", "<script>" appears as text)

## Interaction Notes

- Filters/Sort update list and reset cursor; smooth scroll retention
- Infinite scroll triggers when sentinel enters viewport; never jank content on prepend (newest) — nudge layout to avoid content jumps
- Keyboard interactions for rating; Enter to submit; disable submit until valid
- Accessible announcements for "item received", "reconnecting", and validation errors (consider aria-live brief notes in annotations)

## Deliverables

**Figma file with:**
- Wireframes → High-fidelity mockups for Home (+ optional Event View)
- Component variants (default/hover/focus/disabled/loading/error)
- Light/Dark mode examples
- Interaction annotations (optimistic insert, realtime insert policy, reconnect banner, infinite scroll)
- Exportable icons for stars and a minimal icon set

**Provide a short style guide:** colors (Tailwind tokens), typography scale, spacing, elevation, radii

## Sample Content

**Events:** Keynote, Workshop A, Workshop B, Product Panel

**Example cards:**
- ★★★★★ "Loved it!" Workshop A · 2m ago
- ★★☆☆☆ "Too long" Keynote · 5m ago

## Acceptance

- Realtime updates visible within ~1–2s; reconnect banner appears on drop
- Infinite scroll smooth with hundreds of rows; clear end-of-list state
- Sort/filters clearly reflected; no DOM jank on new inserts
- Accessible star input and form; mobile and desktop layouts covered

## Please produce:

1. A page map and component inventory
2. Wireframes, then high-fidelity mocks (desktop + mobile)
3. Component library with states and light/dark variants
4. An annotated flow for: submit → optimistic insert → server reconcile → realtime insert in other tab