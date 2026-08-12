# Outbound campaign brief — Rudiment GTM Map

Context for a copywriter. This document explains the strategy and constrains the
writing; it is not the copy itself.

---

## What we sell

Rudiment builds go-to-market systems for small field-sales teams. The product in
this campaign is a territory map: every account a company serves, plotted and
filterable, wired two-way into whatever CRM they already run, with a chat layer
for asking questions in plain language, prospecting for net-new accounts, and
contact enrichment metered in credits.

Commercially it is not a SaaS subscription. Every engagement opens with a
one-time build-out fee, because the first thing delivered is a system shaped
around their business. After that it is a flat monthly retainer priced by team
size — $500 for 1–5 users, $1,000 for 5–10, custom above that — which includes a
dedicated Slack channel with the people who built it, same-day support, and a
monthly enrichment credit pool.

The positioning line: **you are paying us to build something, not to rent
something.**

## Who we sell to

Companies whose reps cover ground. Landscaping, pest and lawn, facilities and
janitorial, snow and ice, building products, medical device, industrial supply,
equipment dealers, commercial insurance — anywhere a rep drives a territory or
runs a route.

The size band matters more than the vertical. These are two-to-ten-rep
operations. They have the same routing and prioritization problem as a
thirty-rep company and none of the back office to solve it: no RevOps hire, no
ops analyst, a CRM someone configured three years ago, and a spreadsheet of
cancellations nobody has opened since spring.

The buyer is the owner or the person who runs sales, and they are usually also
carrying a bag themselves.

---

## The mechanic

Every prospect receives an image of the product **already branded to them**. Not
a mockup with their logo pasted on — a screenshot of the tool showing their
company name in the sidebar, their brand colour throughout the interface, their
metro and their surrounding towns on the map, and a real business in their
territory selected in the detail panel.

It is generated per prospect from three inputs scraped off their website: the
company name, their brand hex, and their geography. The layout never changes, so
the campaign stays visually consistent while every image is specific.

### Why it works

It collapses the distance between claim and proof. A cold email that says "we
could build you a territory map" asks the reader to imagine something. An image
of their own company name and their own city inside a working interface skips
that step — the thing already appears to exist. The reaction we want is *wait,
is this real?*, and that question is what gets the reply.

The second-order effect matters as much: it proves we did the work. Anyone can
merge a first name. Getting their brand colour right and putting the correct six
towns around their metro in the correct compass directions signals a level of
effort that reframes the whole message from spam to something considered.

### The one thing the copy must do

**Point at the image and let it carry the weight.** The image is the argument.
Copy that re-describes what the image already shows wastes the advantage. The
job of the words is to explain why the image exists and what happens next.

---

## Message architecture

There is a single idea to land: *we built this for you, and it took us an
afternoon, because building these is what we do.*

Everything else is supporting detail, deployed only if the thread continues:

- The build-out fee is real and comes first — this is a build, not a signup
- $500/mo flat after that, no per-seat pricing
- Four to six weeks from first call to their team using it
- A Slack channel with the people who built it, not a support portal
- It syncs both ways with the CRM they already have
- Enrichment credits included, no separate data vendor to shop for

The offer is a working session, not a demo: forty-five minutes with their real
account list, no slides, and we tell them honestly whether a map solves their
problem.

## Personalization available per prospect

Pulled from their site by the enrichment step, so the copy can reference any of
these:

- `company` — their name
- `metro`, `secondary_city`, `towns[]` — their actual geography
- `use_case` — the job their reps do, inferred from vertical
- `filter_value` — the record state that use case turns on
- `hook` — a specific finding in their territory, e.g. "31 canceled accounts
  within 15 min of the Provo route"
- `selected_account` — a real business in their area shown in the panel
- `rep_name` — a real person on their team

The `hook` and `use_case` are the strongest of these because they are about
their business rather than their metadata.

### Use case by vertical

The image shows each prospect their own job. Copy should match:

| Vertical | What their reps drive to |
|---|---|
| Landscaping, lawn | Winning back accounts that canceled |
| Pest control | Reactivating lapsed service plans |
| Facilities, janitorial | Net-new buildings a rep could walk into |
| Snow & ice | Contracts up for renewal before season |
| Medical device | High-volume practices with no recent visit |
| Industrial supply | Accounts past their reorder window |
| Equipment dealers | Fleets old enough to replace |
| Commercial insurance | Policies renewing this quarter |

---

## Voice

Plain, direct, and specific. Written the way one operator talks to another.

- Short sentences. No warm-up, no "hope this finds you well"
- Concrete over abstract: "31 canceled accounts near your Provo route", never
  "unlock hidden revenue"
- No SaaS vocabulary — nothing about platforms, solutions, leveraging, unlocking,
  empowering, or transforming
- No exclamation marks, no emoji, no bold for emphasis
- Never claim we know their numbers. The figures in the image are illustrative
  and the copy should not pretend otherwise if asked
- Confident, not eager. We build these for a living; this one took an afternoon

Lowercase-informal is fine. Fake-casual ("hey! quick q for ya") is not.

## What not to do

- Do not explain the image in prose. Let them look at it
- Do not open with a problem statement they have to agree with before the value
  lands
- Do not use their name three times
- Do not lead with pricing, but never hide the build-out fee if they ask
- Do not promise integrations or features not listed above
- Do not imply the map is already populated with their live data — it is built
  to look like their business, not sourced from it
- No fake urgency, no fake scarcity, no "circling back" as a subject line

---

## Deliverables

A sequence for cold email. For each step specify the step number, the send delay,
the subject line where applicable, and the body.

Constraints:

- Step 1 carries the image. Body under 90 words
- Later steps do not repeat the image; they add one new piece of information each
- Follow-ups under 60 words
- One clear ask per email, and it is always the working session
- Every step must stand alone — assume they never read the previous one
- Provide 3 subject line options per step, under 45 characters each
- Mark every personalization token in double braces, e.g. `{{company}}`, so it
  drops into the sequencer unedited

Also provide:

- A LinkedIn connection note version, under 300 characters, image attached
- A two-sentence version for a cold call opener
- One reply-handler each for: "how much?", "we already have a CRM", and "is this
  just software?"
