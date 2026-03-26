# Member Profile and Preference Contract

## Purpose

This document defines the MVP member contract shared by site signup, notification delivery, and admin runtime views.

The goal is to keep one vocabulary for:

- signup payload capture
- consent evidence
- notification preference gates
- member/admin delivery-state visibility

## Shared Source of Truth

`packages/deals-core/src/index.ts` is the canonical contract location for:

- `MemberSignupDraft`
- `MemberSignupInput`
- `NotificationPreference`
- `MemberConsentRecord`
- `MemberProfile`
- `MemberAdminStatus`

## Site Boundary

Site owns collection of the initial member payload:

- required email address
- required digest consent for MVP
- optional preference data
- optional hot-deal channel toggles

The site should submit `MemberSignupInput`.

Rules:

- `consentAccepted` at signup must map to a `MemberConsentRecord` for `digest-email`
- hot-deal toggles remain optional and should not block signup completion
- partial preferences are valid; completeness is evaluated downstream as `minimal`, `partial`, or `tuned`

## Notification Boundary

Notifications should consume shared member fields instead of defining a separate preference model.

Required shared gates:

- `NotificationPreference.digestEnabled`
- `NotificationPreference.hotDealEmailEnabled`
- `NotificationPreference.hotDealWhatsappEnabled`
- `SubscriberChannelPreference.verified`
- `MemberConsentRecord` for channel-specific evidence where needed

WhatsApp delivery additionally depends on:

- `whatsappE164`
- an opt-in consent record or equivalent evidence reference

## Admin Boundary

Admin needs a compact operational summary, not raw signup state only.

`MemberAdminStatus` is the shared contract for:

- member lifecycle status
- latest digest runtime state
- per-channel alert state
- preference completeness
- recent failure or operator note context

This keeps member settings, delivery operations, and support views aligned on one status vocabulary.

## MVP Assumptions

- locale is fixed to `de-DE`
- digest email is the core membership channel
- hot-deal email and WhatsApp are optional opt-in channels
- signup should stay lightweight; nonessential preference depth remains skippable
