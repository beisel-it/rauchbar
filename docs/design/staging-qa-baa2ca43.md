# Staging Design QA

Task: `baa2ca43`

Date: `2026-03-26`

Inspection method:

- local browser path: `/usr/bin/chromium`
- live capture against:
  - `https://staging.rauchbar.genussgesellschaft-neckartal.de`
  - `https://admin.rauchbar.genussgesellschaft-neckartal.de`
- desktop and mobile viewport screenshots

Scope:

- visible layout defects
- clipping and overflow
- hierarchy issues
- broken or off-spec presentation

## Findings

### 1. Admin staging is not serving the admin UI

Severity: blocking

Surface:

- `https://admin.rauchbar.genussgesellschaft-neckartal.de`
- desktop and mobile

Observed result:

- the domain renders a placeholder page headed `Deployment placeholder for the admin surface`
- no actual admin navigation, dashboard, queue, or dispatch surface is available for visual QA

Why this is a design QA blocker:

- there is no admin product surface to review for layout, clipping, hierarchy, or presentation
- the deployment result is off-spec for the expected shared review environment

Concrete follow-up owner tasks:

- `deploy-platform`: fix staging routing/runtime so the admin domain serves the real admin build instead of the placeholder runtime
- `admin-console`: once deployment is fixed, request a fresh design QA pass against the actual admin surface

### 2. Site staging: no clear clipping/overflow defect found in the inspected views

Severity: none in this pass

Surface:

- `https://staging.rauchbar.genussgesellschaft-neckartal.de`
- desktop and mobile first-pass capture

Observed result:

- homepage content rendered within bounds in the reviewed screenshots
- no clear text clipping, card breakout, or broken layout containment was visible in the captured views

Note:

- this is not a full product review
- it is only a first-pass visual QA result for the currently visible staging surface

## Evidence Summary

Local screenshots were captured during review for:

- site desktop
- site mobile
- admin desktop
- admin mobile

The admin captures consistently showed the placeholder deployment surface rather than the actual application.

## Outcome

- site: no blocking visible layout defect identified in the inspected captures
- admin: blocked from meaningful design QA until staging serves the real admin UI
