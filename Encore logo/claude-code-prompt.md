# ProYard Sales Map — add Chat / Map / Prospect / Enrich navigation

Paste this into Claude Code from the repo root. Work in phases; do not start a phase until the previous one builds and renders.

---

## Context

ProYard Sales Map is currently a single-view app: a dark left sidebar (account counts, filter groups, saved routes) beside a full-bleed Mapbox canvas. We are turning it into a four-product app. The map becomes one destination among four.

Before writing code, read and report back:
- the root layout / app shell component and where the sidebar markup lives
- the routing setup (or lack of it) and how state is held (context, Zustand, Redux, local state)
- the data layer for accounts (Clay sync, fetch hooks, types)
- the existing "find surrounding businesses" feature — file, API call, and where results land

Do not restyle anything that exists. Match the current dark palette exactly: sidebar `#0B0B0D`, panel/card `#141518`–`#17181B`, hairline borders `#232427`, primary text `#F6F5F2`, secondary `#9DA0A6`, muted `#6E7178`, green accent `#2BD576` with `#07170D` text on it. Reuse existing components (buttons, inputs, table primitives) rather than adding new ones.

---

## Phase 1 — Shell and navigation

Add a top-level product switcher: a segmented control at the top of the sidebar, directly under the ProYard title block, with four options: **Chat · Map · Prospect · Enrich**.

- Container: `background:#141518`, `1px solid #232427`, `border-radius:10px`, `padding:3px`, flex row, `gap:3px`.
- Each item: `flex:1`, centered, `padding:7px 0`, `border-radius:8px`, `font-size:12px`.
- Active item: `background:#FFFFFF`, `color:#0B0B0D`, `font-weight:600`. Inactive: `color:#9DA0A6`, no background.
- Full keyboard support: arrow keys move between items, `role="tablist"` / `role="tab"` with `aria-selected`.

Routing:
- Add routes `/chat`, `/map`, `/prospect`, `/enrich`. `/` redirects to `/map` so existing bookmarks keep working.
- The sidebar body below the switcher is per-destination. Map keeps exactly today's content (counts, FILTERS, filter groups, Load Shared Route) — move it, do not rewrite it.
- **The Mapbox instance must not unmount when leaving /map.** Keep it mounted and hide it (`visibility:hidden` / offscreen container), or hoist it to a persistent layer in the shell. Re-initializing Mapbox on every tab switch is unacceptable — verify by switching tabs and confirming zoom, center, and loaded pins survive.

Sidebar footer, visible on every destination, above the user row:
- A credits card: label `CREDITS` (mono, 10.5px, letterspaced), value `4,180 / 5,000` right-aligned tabular-nums, a 4px progress bar (`#232427` track, `#2BD576` fill), and `Standard plan · resets Aug 1`.
- Value comes from the credits API in Phase 4; stub it with a hook returning static data for now.

Ship this phase with Chat / Prospect / Enrich as empty routes that render only their sidebar sections.

---

## Phase 2 — Chat

A conversational assistant over the account data, backed by either Anthropic or OpenAI.

**Sidebar section:** `+ New chat`, `All chats`, then a `RECENT` label and a list of past conversation titles.

**Main area:**
- Header bar (52px, bottom border `#1c1d20`): conversation title on the left; on the right a **model picker** button (`#17181B` bg, `#2A2C30` border, small green dot, model name, chevron) opening a dropdown with `Claude Sonnet 4.5`, `Claude Opus 4.1`, a divider, `GPT-5`, `GPT-5 mini`. Persist the selection per user.
- Message thread, 660px centered column. User messages: right-aligned bubble, `#1E1F23` bg, `#2A2C30` border, radius `12px 12px 4px 12px`. Assistant messages: left-aligned, no bubble, 26px green avatar square, `#D8D7D3` text, `line-height:1.62`.
- Composer pinned to the bottom of the same 660px column: `#141518` bg, `#2A2C30` border, radius 12px. Below the textarea, a row with an attach `＋` chip, a **map-context chip** reading `◎ Map context: 710 shown`, and a green circular send button. Under the composer, suggestion pills: `Summarize churn risk`, `Plan Tuesday's route`, `Find lookalikes`.

**Model routing:** one server-side abstraction (`/api/chat`) that takes `{ messages, model, context }` and dispatches to Anthropic or OpenAI. Stream tokens back via SSE. **API keys stay server-side only** — never ship a key to the browser.

**Tool use — this is the point of the feature.** Expose the app's data to the model as tools:
- `query_accounts(filters)` — same filter grammar the map sidebar already uses
- `get_map_state()` — current viewport, active filters, visible account count
- `apply_map_filters(filters)` — sets filters on the map
- `show_accounts_on_map(ids)` — pins a specific set
- `build_route(ids)` — hands off to the existing routing feature

Assistant answers may render a **result table** (grid inside `#141518`/`#232427` card, mono uppercase 10.5px header row on `#17181B`) followed by an action row: green `Show these on map` (navigates to /map with the result set applied), outlined `Build a route`, outlined `Export CSV`.

Persist conversations server-side, one row per message, scoped to the user.

---

## Phase 3 — Prospect

Finding net-new accounts that are not yet in the CRM.

**Sidebar:** `New search`, `Saved searches`, `Imported lists`; then a `SOURCES` block listing connected providers (Clay, Google Places) with a green `connected` state.

**Main area:**
- Header: `Prospect` title; right side outlined `Save search` and green `Add N to map` (N = selected count, disabled at 0).
- A query card (`#141518`/`#2A2C30`, radius 12): natural-language query input plus criteria chips below it — `Radius: 20 mi`, `Type: HOA, Commercial`, `Exclude existing accounts`. Chips are editable filters, not decoration.
- Meta row: `86 RESULTS · 12 SELECTED` in mono, sort control on the right.
- Results table with a leading checkbox column, then Property / Type / City / Turf / Est. value. Selected rows show a `#2BD576` check.
- `Add N to map` writes the selected prospects into the accounts store with a `source: 'prospect'` flag so they render distinctly on the map and never overwrite CRM records.

Dedupe every result against existing accounts before display — name + address fuzzy match. A prospect that already exists in the CRM must never appear.

---

## Phase 4 — Enrich (credits)

Enrich a company and find or verify contacts at it. Metered.

**Entry points:** the Enrich tab, and — importantly — the existing "surrounding businesses" flow on the map. Add an `Enrich` action to a business result there that routes to `/enrich?companyId=…` with that company preloaded. The Enrich header must show its origin: company name plus a small outlined chip `from map · Lehi, UT`.

**Sidebar:** `Company lookup`, `Bulk enrich`, `Enrichment history`; then a `CREDIT COSTS` block listing `Company profile 1`, `Contact + email 2`, `Direct dial 4`.

**Main area** — two columns, flexible left, fixed 300px right.

Left column:
- Search card: `Search a company, or enrich the account selected on the map…` plus an outlined `Find contacts` button.
- Meta row: `CONTACTS FOUND · N` in mono, `2 credits per reveal` on the right.
- Contacts table: Name / Title / Email / Direct dial / action. Unrevealed rows show masked values (`••••••@domain.com`, `(•••) •••-••••`) in `#5D6067` and a **`Reveal · 2`** pill (`#1B2A21` bg, `#27563C` border, `#7EE8AC` text). Revealed rows show real values in `#D6D5D1` and a muted `Revealed` label.
- Action row: `Push to CRM`, `Export CSV`, `Draft outreach in Chat` (routes to /chat with the contact preloaded as context).

Right column:
- `COMPANY PROFILE` card: industry, employees, revenue, locations, turf area, website; footer line `Enriched Jul 31 · 1 credit`.
- `THIS MONTH` card: large tabular-nums balance, `of 5,000 credits`, 5px progress bar, `Companies enriched` and `Contacts revealed` counters, outlined `Buy more credits`.

**Credits system — build this server-side and treat it as billing code.**
- Schema: `credit_balances (org_id, period_start, allotment, consumed)` and `credit_transactions (id, org_id, user_id, action, cost, subject_type, subject_id, created_at, idempotency_key)`.
- Costs: company profile 1, contact + email 2, direct dial 4. Define them in one server constant; the client reads them from an endpoint, never hardcodes them.
- Standard plan allotment: 5,000/month, resetting on the billing anniversary. Unused credits do not roll over.
- **Deduct on the server, inside the same transaction that returns the enriched data.** The client's optimistic decrement is display only.
- **Never charge twice for the same reveal.** Cache enrichment results per (org, subject, field); a re-reveal of already-purchased data is free and returns from cache. Pass an idempotency key on every reveal request.
- **Never charge for a failed or empty enrichment.** No contact found = no deduction.
- Insufficient balance: block the action, disable the button, and surface an upgrade path. At <10% remaining, show a warning state on the credits meter.
- Bulk enrich must show a total cost estimate and require confirmation before spending.

---

## Acceptance checks

1. Switching tabs preserves map viewport, zoom, and loaded pins — no Mapbox re-init.
2. Deep links `/chat`, `/map`, `/prospect`, `/enrich` all load directly; `/` lands on `/map`.
3. Chat streams from both a Claude model and a GPT model, and `Show these on map` actually applies the result set.
4. Revealing a contact decrements the server balance by exactly 2; revealing the same contact again costs 0.
5. A failed enrichment leaves the balance unchanged.
6. No API key of any kind appears in the client bundle.
7. Sidebar credit meter reflects the server balance on every destination.
8. Keyboard navigation works across the tab switcher; all interactive elements are reachable and labeled.
