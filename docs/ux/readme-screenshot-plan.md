# README Screenshot Plan

## Purpose

This plan identifies the strongest screenshot targets for a GitHub-facing README and maps them to local capture routes and file outputs.

The goal is to show product breadth quickly:

- public homepage value
- member personalization and delivery value
- admin and operations visibility
- lifecycle/system rigor

## Recommended Screenshot Set

## 1. Homepage Hero and Proof

Use for:

- top-of-README product impression
- explaining the member-first value proposition

Capture target:

- route: `/`
- state: `default`
- viewport: `1440x2200`
- output: `artifacts/readme-screenshots/homepage-default.png`

Why this earns a README slot:

- strongest brand and value communication
- shows the product promise and delayed-deal proof in one frame

## 2. Member Home

Use for:

- showing that the product is not just a landing page
- demonstrating digest, alerts, and preference tuning

Capture target:

- route: `/member-home.html?screenshot=1`
- state: default
- viewport: `1440x1800`
- output: `artifacts/readme-screenshots/member-home.png`

Why this earns a README slot:

- shows personalization, delivery status, and quick actions in one view

## 3. Admin Ops Board

Use for:

- proving the product has an internal operational cockpit
- demonstrating review and dispatch controls

Capture target:

- route: `/ops-board.html?screenshot=1`
- state: default
- viewport: `1440x1900`
- output: `artifacts/readme-screenshots/admin-ops-board.png`

Why this earns a README slot:

- this is the best single image for admin, queue health, and send operations

## 4. Lifecycle State Lab

Use for:

- showing the system depth and operational clarity
- illustrating stateful product behavior without a long explanation

Capture target:

- route: `/state-lab.html?screenshot=1`
- state: default
- viewport: `1440x1600`
- output: `artifacts/readme-screenshots/lifecycle-state-lab.png`

Why this earns a README slot:

- helps explain the rigor behind public/member/admin surfaces

## Optional Secondary Captures

- homepage empty archive state:
  - route: `/?state=empty&screenshot=1`
  - output: `artifacts/readme-screenshots/homepage-empty-archive.png`
- homepage sparse archive state:
  - route: `/?state=sparse&screenshot=1`
  - output: `artifacts/readme-screenshots/homepage-sparse-archive.png`

These are useful for internal review, but they are weaker as top README images than the default homepage and ops/member surfaces.

## Suggested README Ordering

1. homepage-default.png
2. admin-ops-board.png
3. member-home.png
4. lifecycle-state-lab.png

## Capture Notes

- Use screenshot mode for all final captures.
- Prefer desktop README images over mobile screenshots for initial repository presentation.
- If the README later needs a compact mobile section, capture only one mobile homepage image rather than duplicating all surfaces.

## Local Capture Command

Use:

```bash
node tools/ux-preview/capture-screenshots.mjs
```

This generates the default README image set into `artifacts/readme-screenshots/`.
