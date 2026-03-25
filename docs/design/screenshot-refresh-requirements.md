# Screenshot Refresh Requirements

## Purpose

This document defines the design-side contract for automatic screenshot and documentation refresh in Rauchbar. It is meant to guide tooling and workflow, not replace the existing UX capture docs.

It answers four questions:

1. which surfaces are required
2. how generated assets should be named and captioned
3. what quality bar the assets must meet before publication
4. when generated outputs should update README and supporting docs

Source context:

- `README.md`
- `docs/design/readme-visual-plan.md`
- `docs/ux/readme-screenshot-plan.md`
- `docs/ux/testing-setup.md`
- `docs/architecture/deployment-baseline.md`

## Required Primary Asset Set

The automatic refresh flow must treat these four screenshots as the default GitHub-facing set:

1. `artifacts/readme-screenshots/homepage-default.png`
2. `artifacts/readme-screenshots/admin-ops-board.png`
3. `artifacts/readme-screenshots/member-home.png`
4. `artifacts/readme-screenshots/lifecycle-state-lab.png`

These are the required publication surfaces because together they cover:

- public value proposition
- internal operations visibility
- member personalization and delivery value
- lifecycle and state rigor

## Secondary Review Assets

These assets are useful for internal review and regression checks, but they are not part of the default README set:

- `artifacts/readme-screenshots/homepage-empty-archive.png`
- `artifacts/readme-screenshots/homepage-sparse-archive.png` when available

Secondary assets may be refreshed automatically, but they should only be linked from README if product or design explicitly decides they improve the repository story.

## Ordering Requirements

The published README order should remain:

1. homepage default
2. admin ops board
3. member home
4. lifecycle state lab

Design rationale:

- the first image sells the product
- the second proves operational seriousness
- the third shows member depth beyond marketing
- the fourth explains the system logic behind the visible surfaces

If tooling refreshes assets automatically, it must not silently reorder them.

## Naming And Path Conventions

Generated screenshot filenames must stay:

- lowercase
- descriptive by surface, not by date
- stable across refreshes

Required rule:

- replace the existing file at the same path instead of creating timestamped README assets

Reason:

- stable paths keep `README.md` and screenshot docs simple
- PR diffs remain readable
- broken links are less likely

If metadata is needed, store it in docs or machine-readable sidecar output, not in the published filename.

## Caption And Alt-Text Conventions

Automatic refresh may update image files, but it must not invent new README storytelling on its own.

The copy contract is:

- alt text states the surface and the visible value clearly
- caption/body copy explains why the image matters in the README story
- caption tone stays factual, product-facing, and compact

Required behavior:

- keep README alt text and descriptive paragraph aligned with the screenshot surface
- do not auto-rewrite caption meaning unless the underlying surface contract changed intentionally
- if a surface is swapped out, update both image reference and adjacent text in the same change

Caption direction by surface:

- homepage: member-first value, delayed publication, signup clarity
- admin ops board: monitoring, approvals, dispatch control
- member home: digest, alerts, preference tuning
- lifecycle state lab: public/member/admin state logic

## Asset Quality Guardrails

A generated screenshot is publishable only if all of the following are true:

- screenshot mode is enabled
- control bars and non-product chrome are hidden
- text is readable at GitHub README scale
- no visible overflow, clipping, or breakout defects are present
- demo data is coherent and safe to publish
- state labels match the current lifecycle vocabulary
- spacing and crop preserve the intended hierarchy
- the screenshot still reflects the current UX/design contract

Additional design guardrails:

- prefer desktop captures for the default README sequence
- do not mix wildly different aspect ratios within the primary set
- avoid empty states in the primary README set unless the product story explicitly calls for them
- do not publish screenshots with placeholder lorem text, debug controls, or broken loading states

## Publish And Update Expectations

### When automatic refresh should run

The refresh pipeline should run whenever screenshot-driving preview surfaces or their styling change materially, especially in:

- `tools/ux-preview/public/*`
- `tools/ux-preview/capture-screenshots.mjs`
- screenshot-related docs and README references

### When refreshed assets should update published docs

Automatic generation alone is not enough to justify publication.

A refresh should update the published README/docs assets when:

- one of the required primary surfaces changed visually in a meaningful way
- a regression was fixed and the new screenshot is clearly better
- captions, ordering, or linked documentation still match the new image set

### Review expectation

Because staging is the primary shared review surface, visual review should assume:

- screenshots are checked against staging or the agreed UX preview baseline
- preview deployments are selective/manual, not guaranteed for every PR
- targeted preview review may still be used when explicitly requested

### Sync expectation across docs

When the primary screenshot set changes, keep these artifacts in sync in the same change when applicable:

- `README.md`
- `docs/ux/readme-screenshot-plan.md`
- `docs/ux/testing-setup.md`
- `docs/design/readme-visual-plan.md`

## Failure And Drift Rules

The refresh flow should not auto-publish if:

- a required screenshot is missing
- image dimensions changed enough to break README rhythm
- a known layout bug is visible
- the generated asset no longer matches its README caption
- the surface no longer represents the strongest version of that product story

In those cases, generation may still produce review artifacts, but publication should wait for human confirmation.

## Coordination Notes

- UX owns the capture flow and preview implementation details.
- Design owns screenshot story, ordering, naming expectations, and publication quality bar.
- If tooling needs to add or replace a primary screenshot surface, coordinate between `designer` and `ux-developer` before updating the README set.
