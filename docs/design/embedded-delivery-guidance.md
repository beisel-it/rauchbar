# Embedded Design Delivery Guidance

## Scope

This document translates upstream design-lab outputs and current delivery specs into build-ready guidance for the three active product surfaces in MVP:

- homepage and member-facing site moments
- admin operations console
- notification surfaces for digest and hot-deal delivery

Source inputs reviewed:

- `docs/product/prd.md`
- `docs/architecture/overview.md`
- `docs/roadmap/mvp-cycle-001.md`
- `clawteam/rauchbar-design-lab-1/brand-system:docs/design/brand-language.md`
- `clawteam/rauchbar-design-lab-1/lifecycle-flows:docs/design/lifecycle-flows.md`
- `clawteam/rauchbar-dev/admin-console:docs/product/admin-surface.md`
- `clawteam/rauchbar-design-lab-1/brand-system:packages/design-system/src/index.ts`

## Shared Design Read

The strongest upstream decision is that Rauchbar should behave like an editorial cigar desk with operational rigor, not a noisy discount portal. That decision should control all three surfaces.

What this means in practice:

- premium atmosphere is useful only when it does not weaken scan speed
- prices, savings, availability windows, and system states always outrank decoration
- site, admin, and notifications should share one token system, but not one layout density
- member advantage must be explicit everywhere because the 24-hour public delay is a core product promise

## Surface 1: Homepage And Member-Facing Site

### Primary job

Convert visitors by making the member advantage obvious:

- curated weekly digest
- optional instant hot-deal alerts
- earlier access than the public archive

### Recommended structure

1. Hero with a clear editorial promise, not generic lifestyle copy
2. Proof band showing how member access differs from the delayed public archive
3. Deal teaser module with member/public timing labels
4. Short signup module with minimal friction
5. Preference/onboarding continuation after confirmation

### Design guardrails

- Use `cream` or `paper` as the main field background and reserve darker hero treatments for high-value moments only.
- Keep the primary CTA visually plain and high-contrast. Brass or ember should accent, not flood, the page.
- Deal cards need three facts above the fold: merchant, current price, and access state.
- Member-first timing should appear as a structured label, not buried in body copy.
- Preference onboarding should feel guided and finite. The MVP should look like two steps, not a profile wizard.
- Archive cards for public visitors should clearly signal delayed visibility so the member benefit remains legible.

### Critique for delivery

- The current upstream material defines tone well, but not homepage information hierarchy. Delivery should avoid drifting into a generic luxury landing page.
- Signup risk is over-explaining the product before collecting email. The first form should ask only for email and promise the next step.
- Preference capture can easily become too dense if brands, formats, budgets, and channels are all presented equally. Lead with taste and alert intent; secondary controls can follow.

### Handoff notes

- Add reusable labels for `Members first`, `Public in 24h`, and `Hot deal`.
- Treat the deal card as a cross-surface primitive that can render in site and digest contexts with the same status language.
- For empty or weak-match states, keep the tone editorial: explain that matching improves after preferences are refined.

## Surface 2: Admin Console

### Primary job

The admin is an operations cockpit. It should optimize for intervention speed, auditability, and queue confidence before brand atmosphere.

### Recommended layout behavior

- dashboard as a triage surface, not a brand showcase
- queue pages optimized for comparison and bulk scanning
- detail views optimized for decision support and audit context

### Design guardrails

- Use the shared palette, but bias admin pages toward `fog`, `paper`, stronger borders, and compact spacing.
- Status color should do more work here than on the site. Health, approval, pause, failure, and suppression states need persistent visibility.
- Tables must surface the most actionable columns first: state, recency, merchant/source, and consequence.
- Approval detail should keep original source data and normalized data adjacent so editors can compare rather than remember.
- Every destructive or state-changing control should be paired with visible audit framing: what will change, where it propagates, and whether it is reversible.
- Dispatch pages should distinguish content issues from provider issues at a glance.

### Critique for delivery

- The admin-surface doc is strong on feature coverage but light on prioritization inside each screen. Without discipline, dashboard and queue pages will become metric walls.
- Incoming Deals and Approval Queue can blur together. Delivery should maintain a clear distinction:
  incoming is triage,
  approval is editorial decisioning.
- Dispatch Runs risk hiding the real question operators need answered: "Did this fail because of content, audience eligibility, or provider delivery?"

### Handoff notes

- Standardize status badge families across merchants, deals, and dispatch runs instead of inventing per-screen labels.
- Build queue rows so the same visual slots can host approval, send, and crawl statuses.
- Use right-side or inline detail panes for fast review flows where possible; avoid making operators bounce between unrelated routes for single decisions.

## Surface 3: Notifications

### Primary job

Notifications are where Rauchbar makes its product promise tangible. They should inherit the same language as the site while staying structurally resilient and immediately scannable.

### Weekly digest guidance

- The digest should feel editorial first: lead item, ranked deal modules, grouped sections, and restrained CTA rhythm.
- Each deal block should prioritize title, merchant, current price, savings signal, and why it matches.
- Public/member timing language should appear in the digest only when it reinforces exclusivity rather than cluttering the module.
- Keep section rhythm consistent so the digest remains useful even in a thin week.

### Hot-deal guidance

- Hot-deal alerts should optimize for speed: one strong headline, one compact deal summary, one CTA.
- Use urgency language only when there is a meaningful trigger such as price drop, rarity, or unusually strong value.
- WhatsApp content should be shorter and more transactional than email, but should reuse the same status vocabulary.
- Avoid stacking multiple competing badges in an urgent alert. One dominant reason-to-act is enough.

### Design guardrails

- Notification layouts should use vertical stacking and high contrast rather than site-style composition.
- The same semantic colors should map to the same meanings as the site and admin.
- Hot-deal alerts should not visually resemble weekly digests. Their hierarchy needs a different tempo.
- Channel-specific constraints should be handled as presentation changes, not as a separate brand.

### Critique for delivery

- The repo currently exposes only a minimal channel type contract. That is not enough to keep templates, preference logic, and admin preview states aligned.
- The lifecycle spec is clear about state transitions but not about message anatomy. Delivery should avoid hardcoding template structure independently in each channel implementation.

### Handoff notes

- Define one shared content model per notification type before template implementation:
  digest section,
  digest item,
  hot-deal alert payload,
  channel status copy.
- Add preview states for `sent`, `paused`, `failed`, and `suppressed` in admin so operators see the same language users receive.
- Build email and WhatsApp variants from shared semantic fields, not channel-specific ad hoc strings.

## Cross-Surface Guardrails

- A deal is always identified by merchant, price, and availability context before any secondary narrative.
- `ember` is reserved for urgency and action, not generic highlighting.
- `brass` should carry premium emphasis, not warning semantics.
- Dense data views must use spacing and border rhythm to create calm instead of removing information.
- The product promise "members see deals before the public archive" should be visible on site, in digest framing, and in admin preview logic.
- Suppression, pause, and approval states must use consistent wording across UI and notifications.

## Implementation Priorities For Delivery

1. Establish shared status vocabulary and labels across site, admin, and notifications.
2. Implement the deal card and status badge patterns as cross-surface primitives.
3. Lock notification content models before building final templates.
4. Keep homepage signup friction minimal and defer nonessential preference detail until after confirmation.
5. In admin, prioritize queue clarity and failure diagnosis over dashboard ornament.

## Dependency And Asset Gaps

These gaps do not block design guidance, but they do increase delivery drift risk:

- No concrete homepage IA or wireframe artifact is present in this worktree or the `site-foundation` branch.
- No notification contract beyond channel preference types is present in `packages/notifications`.
- No sequence diagrams or annotated state artifacts from the lifecycle handoff are checked into the repo yet.
- No shared copy deck exists for status labels, consent language, or member/public timing language.

Recommended next additions from delivery or coordination:

- homepage content skeleton with module order and CTA copy hooks
- notification payload contract and preview fixture data
- shared glossary for approval, suppression, delay, and channel states
- lightweight wireflows for signup, approval, and dispatch recovery
