# Clay → branded product image, at scale

One clarification first, because it changes how you build the table: **Clay cannot render this image.** Claygent researches and returns text. The image comes from a rendering step that takes an HTML template plus your variables and returns a PNG. So the pipeline is three columns, not one:

1. **Claygent** — scrape the site, return a JSON payload
2. **Parse** — split the JSON into typed columns
3. **HTTP API** — POST the template + variables to a render service, get a PNG URL

The prompt for step 1 is below, then the setup for steps 2 and 3.

---

## What the image is

A screenshot of the territory map, branded to the prospect. Four things change per company:

| Element | Driven by |
|---|---|
| Sidebar company name + logo tile | `company` |
| Every accent in the UI | `brand_hex` |
| The map — cities, highways, state | `metro`, `secondary_city`, `towns[]`, `highway_numbers[]`, `state_label` |
| The filter, the banner and the clicked account | `use_case` |

The composition never moves. Same layout, same panel, same control positions on all of them.

---

## The use case is the important part

The map has to show the prospect *their own job*. A landscaper does not care about new leads; they care about who canceled. A facilities contractor does not care about churn; they care about buildings a rep could walk into tomorrow.

So the filter in the sidebar, the finding in the banner, and both the business **and its status chip** in the right-hand panel all have to agree with each other and with how that vertical actually sells. Claygent picks the use case from the vertical, then writes all four to match.

**Reference use cases.** Match the prospect's vertical to the closest row, then follow the shape.

| Vertical | Use case | Filter | Banner finding | Panel shows | Status chip |
|---|---|---|---|---|---|
| Landscaping, lawn care | Win back churn | `Status` / `Canceled` | Canceled accounts near an existing route | A canceled commercial property | Canceled |
| Pest control | Reactivate lapsed plans | `Service plan` / `Quarterly — lapsed` | Lapsed accounts clustered in one suburb | A lapsed multifamily community | Canceled |
| Facilities, janitorial | Net-new leads to walk into | `Lead status` / `Unworked` | Unworked buildings near a current job site | An office park with no contract | Lead |
| Snow & ice | Renewal risk before season | `Contract` / `Expires < 60d` | Contracts expiring before first snow | A retail center up for renewal | Current |
| Medical device | Coverage gaps | `Procedure volume` / `Top quartile` | High-volume practices with no visit this quarter | An orthopedic group | Current |
| Industrial supply | Overdue reorders | `Reorder window` / `Overdue 60d+` | Accounts past their reorder window | A machine shop or distributor | Current |
| Equipment dealers | Aging fleet, upgrade window | `Fleet age` / `7+ years` | Fleets past useful life within a drive | A contractor yard | Current |
| Commercial insurance | Renewal timing | `Renewal date` / `Within 90 days` | Policies renewing inside the quarter | A commercial property owner | Current |

If their vertical is not on the list, infer the equivalent: what does a rep at this company drive to, and what state does a record have to be in for that drive to be worth it?

---

## Step 1 — Claygent prompt

Run as **Claygent** with web browsing enabled. Input column: the company's website domain.

Model: Claude (Sonnet or better). Temperature: lowest available — you want the same answer every run.

### Prompt

```
You are researching a company so a sales-mapping tool can be mocked up branded
to them. Visit {{domain}} and read the homepage, the about page, the services
page, and any locations or service-area page. Then return ONLY a JSON object
matching the schema below. No preamble, no markdown fences, no commentary.

── BRAND ────────────────────────────────────────────────────────────────

1. brand_hex — their primary brand colour as a 6-digit hex.
   - Look at the logo, the primary button fill, the header background, and any
     CSS custom properties in the page source (--brand, --primary, --accent).
   - Pick the colour a person would name as "their colour", not the most
     frequent pixel. Ignore white, black, near-greys (#EEE-#333), and stock
     link blue (#0066CC-ish) unless it is unmistakably the brand colour.
   - It must read legibly as text on a near-black (#0B0B0D) background. If it
     is darker than roughly 35% luminance, lighten it until it does, keeping
     the same hue. Never return a colour lighter than #F0F0F0.
   - If you genuinely cannot determine one, return "#4FB477".

── GEOGRAPHY ────────────────────────────────────────────────────────────

2. metro — the large city their headquarters sells out of. Common spoken name
   ("Dallas", not "Dallas-Fort Worth Metroplex"). Max 18 characters.

3. secondary_city — the second city in that territory, WITH its compass bearing
   from metro. Different city from metro. Name max 18 chars.
   bearing is one of: N, NE, E, SE, S, SW, W, NW.
   Give the real direction. Fort Worth is W of Dallas. Provo is S of Salt Lake
   City. St. Paul is E of Minneapolis. This is the one error a local rep spots
   instantly, so reason about actual geography before answering.

4. towns — exactly 6 more real towns or suburbs in that territory, each WITH a
   bearing from metro, same eight values. All within roughly 90 minutes' drive.
   Name max 14 chars each. No duplicates of metro or secondary_city.
   Spread the bearings — do not return six towns all marked N. If two genuinely
   sit in the same direction, keep the nearer one accurate and give the other
   its next-closest bearing, so the six land on six distinct compass points.

5. state_label — full state or province name, UPPERCASE ("UTAH", "MINNESOTA").

6. highway_numbers — exactly 4 real route numbers serving that metro, as
   strings, digits only, no "I-" or "US-" prefix ("35", "80", "494", "6").
   Most-major first.

7. region — a short territory line, UPPERCASE, in one of these shapes:
   "<COUNTY> COUNTY · <N> MI RADIUS" / "<METRO> METRO · <N> MI RADIUS" /
   "<REGION> · <N> COUNTIES". Max 34 characters. Base the radius or county
   count on the service area they claim on the site; if they claim none, use
   "<METRO> METRO · 25 MI RADIUS".

── USE CASE ─────────────────────────────────────────────────────────────

8. Identify what this company's field reps actually drive to, then pick the
   matching use case from this table. Match on the closest vertical.

   landscaping / lawn      → win back churn
   pest control            → reactivate lapsed plans
   facilities / janitorial → net-new leads to walk into
   snow & ice              → renewal risk before season
   medical device          → coverage gaps
   industrial supply       → overdue reorders
   equipment dealers       → aging fleet, upgrade window
   commercial insurance    → renewal timing

   If their vertical is not listed, infer the equivalent by asking: what does a
   rep at this company drive to, and what state must a record be in for that
   drive to be worth making?

   Return the use case as use_case, lowercase, max 40 characters.

9. filter_field and filter_value — the CRM filter that isolates exactly the
   records in that use case. Field max 20 chars, value max 22 chars.
   Follow the shapes below for the listed verticals:
     win back churn          → "Status" / "Canceled"
     reactivate lapsed plans → "Service plan" / "Quarterly — lapsed"
     net-new leads           → "Lead status" / "Unworked"
     renewal risk            → "Contract" / "Expires < 60d"
     coverage gaps           → "Procedure volume" / "Top quartile"
     overdue reorders        → "Reorder window" / "Overdue 60d+"
     aging fleet             → "Fleet age" / "7+ years"
     renewal timing          → "Renewal date" / "Within 90 days"

10. hook — one sentence, max 72 characters, stating a specific finding that
    THIS use case would surface in THEIR geography. It must name a real place
    from metro, secondary_city or towns, and it must be consistent with
    filter_value — do not describe churn if the filter says unworked leads.
    Write it as a finding, not a pitch.
      churn      → "31 canceled accounts within 15 min of the Provo route"
      new leads  → "58 unworked office parks inside the Eagan loop"
      renewals   → "22 contracts expiring before first snow in Ogden"
    Bad: "Grow your business with better territory data"

11. selected_account — the business shown in the right-hand detail panel, as if
    a rep just clicked its pin. It must be a REAL business, findable on Google
    Maps, located in metro or one of the towns, and it must be the KIND of
    business this use case is about — a canceled commercial grounds client for
    churn, an office park for facilities leads, an orthopedic group for medical
    device, and so on. Never return the prospect's own company.
      status   — EXACTLY one of: New, Current, Canceled, Lead.
                 This is the account's state in their CRM and it must agree with
                 filter_value. Use this mapping:
                   win back churn          → "Canceled"
                   reactivate lapsed plans → "Canceled"
                   net-new leads           → "Lead"
                   renewal risk            → "Current"
                   coverage gaps           → "Current"
                   overdue reorders        → "Current"
                   aging fleet             → "Current"
                   renewal timing          → "Current"
                 Use "New" only when the use case is about accounts just sourced
                 or imported and not yet worked. A status that contradicts the
                 filter is the single most visible error in the image.
      name     — max 28 chars
      desc     — one line on what they do, max 110 chars
      rating   — Google rating and review count, e.g. "4.2 ★ (317)"
      phone    — E.164-ish display format, e.g. "+1 801-264-0359"
      website  — bare domain, no scheme, max 24 chars
      address  — full street address as Google shows it

── FIGURES ──────────────────────────────────────────────────────────────

12. rep_name — a real person at the company with a sales, field, or territory
    title. Check the team or contact page. If none, use the founder or owner.
    If neither exists, return "Sales Team".

13. total_accounts and showing — plausible counts as strings with thousands
    separators. total_accounts reflects apparent size: single-crew local
    operator 200-600; regional multi-branch 1,200-3,000; large distributor
    3,000-9,000. showing must be 12-30% of total_accounts, and should read as
    the count the filter would actually return. Never end either in "00" —
    412 and 1,847 read as real, 400 and 2,000 read as fabricated.

14. If the site is unreachable, parked, or clearly not a company with a field
    sales or service territory, return {"skip": true, "reason": "<why>"} and
    nothing else.

── SCHEMA ───────────────────────────────────────────────────────────────

{
  "brand_hex": "#4FB477",
  "metro": "Salt Lake City",
  "secondary_city": { "name": "Provo", "bearing": "S" },
  "towns": [
    { "name": "Ogden",      "bearing": "N"  },
    { "name": "Tooele",     "bearing": "W"  },
    { "name": "Lehi",       "bearing": "SE" },
    { "name": "Park City",  "bearing": "NE" },
    { "name": "Heber City", "bearing": "E"  },
    { "name": "Nephi",      "bearing": "SW" }
  ],
  "state_label": "UTAH",
  "highway_numbers": ["15","80","84","6"],
  "region": "UTAH COUNTY · 18 MI RADIUS",
  "use_case": "win back churn",
  "filter_field": "Status",
  "filter_value": "Canceled",
  "hook": "31 canceled accounts within 15 min of the Provo route",
  "selected_account": {
    "status": "Canceled",
    "name": "Cottonwood Corporate Ctr",
    "desc": "Three-building office campus with 6 acres of maintained grounds and shared parking.",
    "rating": "4.0 ★ (212)",
    "phone": "+1 801-264-0359",
    "website": "cottonwoodcc.com",
    "address": "2825 E Cottonwood Pkwy, Cottonwood Heights, UT 84121, USA"
  },
  "rep_name": "Dave Marchetti",
  "total_accounts": "412",
  "showing": "96"
}
```

### Why the constraints matter

The character limits are not cosmetic. The sidebar header truncates past about
22 characters, city labels overlap their neighbours past 14, the hook wraps out
of its banner past 72, and the panel's business name past 28.

The bearings matter as much. Places sit on a fixed eight-point ring around the
metro, and the bearing selects the slot — a wrong bearing puts a town on the
wrong side of the city, and because a taken slot walks clockwise to the next
free one, it also displaces whatever came after it.

And the four use-case fields have to agree: the sidebar filter, the banner hook,
the business in the panel, and its status chip. A sidebar reading `Status /
Canceled` beside a banner about unworked leads is the tell that the image was
machine-made. So is a red CANCELED chip on a facilities prospect whose filter
reads `Lead status / Unworked`.

---

## Step 2 — Parse into columns

Add a **Formula** column per field:

```
{{claygent_output.brand_hex}}
{{claygent_output.metro}}
{{claygent_output.secondary_city.name}}
{{claygent_output.secondary_city.bearing}}
{{claygent_output.towns[0].name}}      … through towns[5].name
{{claygent_output.towns[0].bearing}}   … through towns[5].bearing
{{claygent_output.state_label}}
{{claygent_output.highway_numbers[0]}} … through [3]
{{claygent_output.region}}
{{claygent_output.filter_field}}
{{claygent_output.filter_value}}
{{claygent_output.hook}}
{{claygent_output.selected_account.status}}
{{claygent_output.selected_account.name}}
{{claygent_output.selected_account.desc}}
{{claygent_output.selected_account.rating}}
{{claygent_output.selected_account.phone}}
{{claygent_output.selected_account.website}}
{{claygent_output.selected_account.address}}
{{claygent_output.rep_name}}
{{claygent_output.total_accounts}}
{{claygent_output.showing}}
```

Add one guard column so bad rows never reach the renderer:

```
Skip if:  {{claygent_output.skip}} = true
      OR  {{brand_hex}} is empty
      OR  {{metro}} is empty
      OR  {{selected_account.name}} is empty
      OR  {{selected_account.status}} not in (New, Current, Canceled, Lead)
```

Add `credits` as a static formula — any number under 5,000 that is not round,
e.g. `4,180`. It never needs to vary per prospect.

---

## Step 3 — Render the PNG with Gemini

Use **image editing, not image generation.** You attach the master screenshot as
a reference image and tell Gemini what to change. Asking a text-to-image model to
draw this interface from a written description will not work — it invents its own
layout and garbles small UI text. Editing an existing image keeps the composition
locked and changes only what you name.

Model: **Gemini 2.5 Flash Image** (`gemini-2.5-flash-image`). In Clay this is
either the built-in Gemini AI column with an image input, or an **HTTP API**
column against the Gemini API with the master image sent as inline base64.

### Before you start: produce the master

Render the template once at 1200×750, with the placeholder values left as they
are, and save it somewhere you can reference by URL. That PNG is the reference
image attached to every call. Every prospect image is an edit of that one file,
which is what keeps the whole campaign visually consistent.

### The prompt

Attach the master image, then send this as the text part. Substitute the Clay
columns into the double-brace slots.

```
You are editing an existing screenshot of a sales territory mapping application.
The attached image is the master. Produce a modified version of it.

ABSOLUTE RULES — these override everything else:

- Do not redesign, re-lay-out, restyle, or reinterpret the interface. This is a
  targeted edit of the attached image, not a new image inspired by it.
- Every panel, button, border, corner radius, shadow, font, font size, icon and
  spacing stays exactly where it is and exactly as it looks.
- The dark left sidebar stays 268px wide. The dark right detail panel stays
  300px wide. The top bar stays 46px tall. Do not move or resize them.
- Do not add, remove, or relocate any UI element. No new badges, no new buttons,
  no watermark, no logo, no caption, no border around the image.
- Do not change the "Rudiment" wordmark near the bottom of the map.
- Output one image, 1200 x 750 pixels, no padding or frame.
- Where a replacement string is longer than the original, keep the same font
  size and let it fit the existing box; do not enlarge the box or shrink the
  whole layout to accommodate it.

CHANGE 1 — ACCENT COLOUR

Replace every instance of the green accent (#4FB477) with {{brand_hex}}.
It appears in exactly these places, and nowhere else:
  - the small rounded square logo tile, top left of the dark sidebar
  - the "Showing" number in the right-hand stat card
  - the highlighted filter value pill in the FILTERS group
  - the credits progress bar
  - the round user avatar in the sidebar footer and in the top bar
  - the "+" button in the white map control cluster
  - the dashed route line on the map
  - the large highlighted map pin and its soft halo
  - the website link text in the right detail panel
  - the "Find contacts" button in the right detail panel

Keep the dark UI surfaces, the grey text, the white map, the orange highways and
the grey / purple / yellow account pins exactly as they are. Only the accent
changes. If {{brand_hex}} is dark, still use it — do not substitute a lighter
colour, and do not change the text colour sitting on top of it.

CHANGE 2 — COMPANY NAME

Top of the dark sidebar, replace "Wasatch Grounds Co." with "{{company}}".
Keep the same font, weight, size and position. Leave the smaller grey line
beneath it reading "Sales Territory Mapper" unchanged.
In the logo tile to its left, replace the two letters with "{{initials}}".

CHANGE 3 — THE MAP

Keep the map's visual style identical: same pale terrain, same green mountain
band on the left edge, same white street grid, same orange highways with white
casing, same small blue lakes, same pin colours and pin density, same dashed
route line. Only the labels change.

  - The large bold city label reading "Salt Lake City" becomes "{{metro}}".
  - The other large bold city label becomes "{{secondary_city}}".
  - The six small city labels become, in this order going clockwise from the top:
    {{town_1}}, {{town_2}}, {{town_3}}, {{town_4}}, {{town_5}}, {{town_6}}.
  - The four small white highway shield badges become {{hw_1}}, {{hw_2}},
    {{hw_3}}, {{hw_4}}.
  - Each label keeps its existing position, size, weight and colour. Do not move
    a label to make room for a longer name.

CHANGE 4 — THE SIDEBAR FIGURES AND FILTER

  - "Total Accounts" number becomes {{total_accounts}}.
  - "Showing" number becomes {{showing}}.
  - In the FILTERS group, the field row becomes "{{filter_field}}", the middle
    row stays "is any of", and the highlighted pill becomes "{{filter_value}}".
  - The name in the sidebar footer becomes "{{rep_name}}".
  - The small monospace chip below the dark banner becomes "{{region}}".

CHANGE 5 — THE BANNER

The dark pill at the top left of the map currently reads "31 canceled accounts
within 15 min of Tuesday's route". Replace that text with "{{hook}}".
Keep the pill's dark background, its border, the small accent dot on its left,
and the small x on its right.

CHANGE 6 — THE RIGHT DETAIL PANEL

Replace the text content only. Keep every row, divider, label and button.
  - Title: {{sel_name}}
  - The small uppercase status chip directly beneath the title: replace its text
    with "{{sel_status}}". It keeps its pill shape, size, position, the dot on
    its left, its letter-spacing and its uppercase weight. Recolour the pill to
    the fixed status palette below — NOT the brand accent, which is deliberately
    separate so the status stays readable whatever colour the prospect uses:
      New      → text and dot #7FC8F5, fill #12212B, border #1D3D52
      Current  → text and dot #6FD79B, fill #122217, border #1D4030
      Canceled → text and dot #F0837A, fill #241413, border #4A2320
      Lead     → text and dot #E9B95E, fill #231B0F, border #48371B
  - Grey description line beneath it: {{sel_desc}}
  - Rating row value: {{sel_rating}}
  - Phone row value: {{sel_phone}}
  - Website row value: {{sel_website}}
  - Address row value: {{sel_address}}
  - Leave "MAIN CONTACT", "No contact on file yet.", "Find contacts",
    "Directions" and "Google Maps" exactly as they are.

TEXT QUALITY

All text must be sharp, correctly spelled, and rendered in the same clean sans
serif as the master. Do not blur, warp, duplicate or invent text anywhere in the
image. If you cannot render a string legibly at its existing size, render it at
that size anyway rather than enlarging it or dropping it.
```

### API call shape

```json
{
  "contents": [{
    "parts": [
      { "inline_data": { "mime_type": "image/png", "data": "<MASTER_PNG_BASE64>" } },
      { "text": "<THE PROMPT ABOVE, VARIABLES SUBSTITUTED>" }
    ]
  }],
  "generationConfig": { "responseModalities": ["IMAGE"], "temperature": 0.1 }
}
```

Keep `temperature` at or near 0.1. Higher values make the model reinterpret the
layout instead of editing it.

The response returns base64 image data. Write it to a hosting step — Clay's file
storage, an S3 bucket, or Cloudinary — and store the resulting URL as `image_url`.

### Output

```html
<img src="{{image_url}}" width="600" alt="Territory map built for {{company}}" />
```

---

## The honest limitation

Diffusion image models are unreliable with small text. Even in edit mode, at
1200×750 you should expect a meaningful share of images to come back with a
misspelled city, a mangled phone number, or a smeared label — the accent colour
and the overall look will be right, the fine text is the risk.

Two ways to handle it:

**Review everything.** At outbound volumes this is real work, but the images are
the whole point of the campaign, so a human eye over each one before it sends is
defensible. Reject and re-run any image with garbled text; a re-run at the same
temperature usually fixes it.

**Or split the work.** Render the image from the HTML template — which produces
perfect text every time and costs a fraction of a cent — and use Gemini only for
the research step it is genuinely good at. If you want that path, the template
export with `{{COMPANY}}`-style placeholders is ready; say the word and I will
hand it over with the HTTP API setup.

---

## Cost and volume

One Claygent run plus one Gemini image call per prospect. At 1,000 prospects
expect roughly $30-40 in Gemini image generation plus your Claygent credits, and
budget rework time for the images that come back with bad text.

Batch in blocks of 50 and review each block before releasing the next.

## What to check on every image

1. **Is all the text spelled correctly?** City names, the phone number, the
   address, the hook. This is the failure mode of this approach — check it first.
2. **Do the four use-case fields agree?** Sidebar filter, banner hook, the
   business in the panel, and its status chip all describing the same job. A red
   CANCELED chip on a prospect whose filter reads `Lead status / Unworked` is the
   giveaway. Because this step is an edit against the master, any element the
   prompt does not name is left untouched — so if the chip kept the master's
   colour and wording, check that CHANGE 6 was not truncated in the request.
3. Is the accent their colour, applied everywhere it should be, and legible
   against the dark sidebar?
4. Do the city names surround their metro, in the right compass direction? Check
   the secondary city first — a rep who sees Fort Worth east of Dallas stops
   reading.
5. Did Gemini move, resize, or restyle anything? Compare against the master. Any
   drift in the layout means the temperature is too high or the rules section was
   truncated.
6. Does the company name fit the sidebar without truncating mid-word?

If (3) fails repeatedly for a vertical, the fix is in the Claygent luminance
rule. If (2) fails, add that vertical to the use-case table rather than letting
the model infer it. If (5) fails, drop the temperature and re-send.
