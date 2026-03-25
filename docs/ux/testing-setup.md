# UX Testing Setup

## Purpose

This setup provides a lightweight local preview for UX testing while the full site and admin apps are still under construction.

It is designed for:

- browser-based review on localhost
- quick screenshot capture
- validating homepage information architecture
- validating lifecycle and state representations

## Available Preview Routes

Start the preview server:

```bash
pnpm ux:preview
```

Default URL:

```text
http://127.0.0.1:4173
```

Routes:

- `/` homepage wireframe prototype
- `/member-home.html` member value and preferences prototype
- `/ops-board.html` admin and operations prototype
- `/state-lab.html` lifecycle and state review surface

For LAN or external browser access:

```bash
pnpm ux:preview:host
```

This binds to `0.0.0.0:4173`.

## Review Modes

## Homepage Review

Use `/` to validate:

- section order
- CTA hierarchy
- mobile and desktop block structure
- empty/partial/error state messaging

State options are available in the built-in control bar:

- default
- sparse archive
- empty archive
- metrics fallback

## Lifecycle Review

Use `/state-lab.html` to validate:

- deal lifecycle stages
- public/member/admin state language
- badge consistency
- operational severity treatment

## README Capture

For GitHub-ready product images:

```bash
pnpm ux:preview:capture
```

Outputs:

- `artifacts/readme-screenshots/homepage-default.png`
- `artifacts/readme-screenshots/member-home.png`
- `artifacts/readme-screenshots/admin-ops-board.png`
- `artifacts/readme-screenshots/lifecycle-state-lab.png`
- `artifacts/readme-screenshots/homepage-empty-archive.png`

The concrete screenshot rationale and ordering live in `docs/ux/readme-screenshot-plan.md`.

## Screenshot Guidance

The preview includes a `Screenshot mode` toggle that:

- hides the control bar
- removes interactive chrome
- keeps the layout stable for captures

Recommended capture flow:

1. open the target route
2. choose the desired state
3. enable `Screenshot mode`
4. capture full-page screenshots in browser devtools

Suggested captures:

- homepage default
- homepage empty archive
- homepage sparse archive
- member home
- admin ops board
- lifecycle overview

## Why This Exists

This preview lane is intentionally separate from the in-progress app surfaces. It allows UX validation without blocking on:

- framework selection details
- data wiring
- auth setup
- final component implementation

## Implementation Notes

- The preview is served by `tools/ux-preview/server.mjs`.
- Assets are plain HTML, CSS, and small client-side JavaScript.
- No extra dependencies are required beyond Node.
