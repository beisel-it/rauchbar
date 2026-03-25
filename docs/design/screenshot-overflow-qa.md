# Screenshot Overflow QA

## Scope

Targeted visual QA pass for the current screenshot set, focused only on visible overflow, clipping, and breakout defects.

Review basis:

- local captures from the current UX preview
- follow-up confirmation from `ux-developer`
- fix diff on `clawteam/rauchbar-dev/ux-developer` commit `f2aaee2` (`Fix screenshot layout overflow issues`)

Surfaces covered:

- homepage preview
- lifecycle/state lab
- member/admin README capture surfaces on the UX branch

## Joint Findings

### 1. Lifecycle flow broke horizontally in screenshot mode

Severity: high

Screenshot context:

- mobile lifecycle/state screenshot
- headline and downstream panels were visibly clipped on the right because the page width exceeded the viewport

File context:

- `tools/ux-preview/public/styles.css`

Concrete fix:

- replace the single long grid row with a wrapped flex layout so badges and arrows stay inside the panel on narrow widths
- keep the overflow contained to the component instead of letting it widen the whole page

UX branch change:

- `.lifecycle-flow` changed from fixed auto-grid columns to wrapped flex in `f2aaee2`

### 2. State/member/admin list rows sprawled across card width

Severity: medium

Screenshot context:

- state cards in the lifecycle lab
- badges and supporting copy were laid out as wrapping flex rows, which made rows sprawl and increased the chance of awkward clipping in narrow screenshots

File context:

- `tools/ux-preview/public/styles.css`

Concrete fix:

- switch stacked lists from wrapping flex rows to true vertical list rows
- allow the badge and body copy inside each row to wrap internally with `min-width: 0` and `overflow-wrap: anywhere`

UX branch change:

- `.stack-list` changed to a grid-stacked list
- `.stack-list li` gained `min-width: 0` and `overflow-wrap: anywhere` behavior via shared row rules in `f2aaee2`

### 3. Ops queue rows needed constrained grid columns

Severity: medium

Screenshot context:

- member/admin README capture surfaces refreshed by UX after the fix
- long deal names and status labels were at risk of clipping because queue columns were not constrained to shrink safely

File context:

- `tools/ux-preview/public/styles.css`

Concrete fix:

- define queue columns with `minmax(0, ...)` so each track can shrink inside the container
- allow queue cell text to wrap with `overflow-wrap: anywhere`
- collapse queue rows to a single-column stack on mobile

UX branch change:

- `.queue-row` now uses `grid-template-columns: minmax(0, ...) ...`
- `.queue-row > span` gained `min-width: 0` and `overflow-wrap: anywhere`
- mobile breakpoint collapses `.queue-row` to one column in `f2aaee2`

## No Additional Clear Defects In This Pass

I did not see a separate, unambiguous overflow defect in the homepage screenshots from the current branch. The homepage mobile header is compact, but nothing was clearly clipped or rendered outside its intended container in the reviewed capture.

## Recommendation

Treat `f2aaee2` on `clawteam/rauchbar-dev/ux-developer` as the active fix set for screenshot overflow issues. If those README capture surfaces are merged, rerun the screenshot pass once on staging or the next shared preview lane, but this does not need a broader redesign review.
