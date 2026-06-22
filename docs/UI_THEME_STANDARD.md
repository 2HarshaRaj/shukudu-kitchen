# UI Theme Standard

## Purpose

This document defines the visual rules for Shukudu Kitchen so future UI changes do not drift from the warm cookbook theme.

Use this before changing colors, pills, chips, buttons, shadows, hover states, active states, pressed states, or light and dark theme behavior.

## Design Intent

Shukudu Kitchen should feel warm, calm, practical, home-cooking focused, and easy to read in the kitchen.

UI elements should not look special unless they represent a different action type or state.

## Theme Tokens

Prefer existing CSS variables:

- `--bg`
- `--surface`
- `--text`
- `--muted`
- `--accent`
- `--accent-soft`
- `--border`
- `--shadow`

Hardcoded colors should be used only when matching an existing component style or filling a clear theme-token gap.

## Accent Usage

Use accent color for primary actions, active selected states, important links, hover text, progress, and confirmed states.

Do not use accent-tinted backgrounds for normal inactive navigation or pairing chips unless the chip is intentionally active or selected.

## Pills and Chips

Pills and chips should share the same visual language unless they behave differently.

### Navigation Pills

Examples: Details, Pairings, Ingredients, Preparation, Cooking Method.

Rules:

- inactive state uses a neutral pill background
- active state uses accent background
- hover may use accent text
- border should remain subtle
- shape should stay fully rounded

### Filter Pills

Examples: Meal Type filters on the homepage.

Rules:

- inactive state uses a neutral pill background
- active state uses accent background
- selected pill must be clearly different from inactive pills
- mobile rows need enough top and bottom padding so borders are not clipped on long press
- touch devices should avoid upward hover movement inside horizontal scroll rows

### Pairing Recipe Pills

Examples: recipe links under Pairings.

Rules:

- background should match neutral navigation pill backgrounds in both light and dark mode
- hover may change text to accent
- hover should not switch to a reddish filled background unless it becomes an active or selected state
- pairing pills may be larger or full-width on mobile because they are recipe links
- size may differ from navigation pills, but color language should not drift

## Buttons

Primary buttons use accent background, white text, and may use shadow.

Secondary buttons use neutral surfaces and subtle borders.

Utility icon buttons should stay quiet, consistent in size, and use SVG or CSS-mask icons rather than emoji or font-dependent symbols.

## Shadows

Use shadows sparingly.

Allowed: page cards, recipe cards, primary action hover, and confirmed active states.

Avoid heavy shadows on normal pills or shadows that clip inside scroll containers.

## Light and Dark Mode Review

Every UI style change must be checked in both light and dark mode.

Dark mode should use neutral dark surfaces for inactive pills and chips. Active states should remain visibly accent-colored. Borders should remain visible but not bright.

## Mobile Review

Mobile touch behavior must be checked for:

- tap target size
- horizontal scroll rows
- long press clipping
- hover transforms that do not make sense on touch devices

## Versioning

Any completed UI theme change should receive a patch version bump.

## Theme Validation

Phase 1 theme validation is active through `scripts/validate-theme.js`. It checks objective guardrails such as known CSS files, CSS asset versions, approved hardcoded-color locations, approved shadow locations, and required dark-mode pill overrides.

Future stricter validation can expand this coverage:

- flag duplicate pill styles that drift from the standard
- add broader selected-component light and dark override checks
- detect newly introduced theme-token gaps
- cover additional component families as the UI grows

Validation should support this document, not replace visual review.
