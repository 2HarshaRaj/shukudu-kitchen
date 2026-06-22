# Multi-Recipe Cooking Mode

## Purpose

Users may cook two or more recipes together, such as rice + dal, rasam + palya, or bath + curd rice. Multi-Recipe Cooking Mode should make those real kitchen workflows easier by keeping multiple active recipes available at the same time.

The goal is to preserve each active recipe's selected scale, ingredient checklist state, and cooking step progress while allowing the user to move between recipes without losing their place.

This document describes a future design direction only. It does not implement schema, UI, validation, timers, or persistence changes yet.

## Core Principle

Multi-Recipe Cooking Mode should not merge multiple recipes into one combined recipe.

Each recipe remains independent:

- recipe data stays separate
- scale state stays tied to that recipe
- ingredient checklist progress stays tied to that recipe
- cooking step progress stays tied to that recipe

The UI only helps users switch between active cooking sessions. Existing single-recipe Cooking Mode remains the foundation, and multi-recipe behavior should build on that model rather than replacing it.

## Active Recipe Sessions

A future active cooking session model could track one session per active recipe. Each active recipe session may include:

- recipe slug
- selected scale
- ingredient checklist progress
- cooking step progress
- optional household scale later
- optional spice mode later
- optional timer state later

This is proposed future behavior only. No active session schema, storage format, or validation rule is implemented by this document.

## Switching Behavior

Users should be able to switch between active recipes quickly while cooking.

Switching between recipes should preserve progress. It should not reset:

- the selected scale
- checked ingredients
- the current cooking step

Closing one recipe should close only that recipe's active cooking session. It should not close all active recipes.

If feasible, returning to the homepage should allow users to reopen active cooking sessions so they can continue cooking without manually finding each recipe again.

## Mobile UX

Mobile behavior should stay simple and kitchen-friendly. Possible approaches include:

- a compact active recipe switcher
- recipe tabs
- a bottom sheet for active recipes
- a clear active recipe name in the Cooking Mode screen
- avoiding overcrowding the Cooking Mode screen
- keeping buttons large enough for kitchen use

The mobile UI should prioritize quick recognition and low-friction switching over dense controls.

## Wake Lock Behavior

Wake lock should stay active while any Cooking Mode session is open.

Closing one recipe should not release wake lock if another active recipe remains open. Wake lock should only be released after all active cooking sessions are closed.

## State Persistence

Progress should persist per recipe, similar to current single-recipe saved progress.

Future persistence may need a shared active-session list that records which recipes are currently active. That shared list should be separate from each recipe's existing progress keys so session membership can be managed without accidentally deleting saved progress for an individual recipe.

## Pairings Relationship

Curated Pairings could later help users start a second recipe quickly from a related recipe. For example, a rice recipe could offer a paired dal, or a rasam recipe could offer a paired palya.

Multi-Recipe Cooking Mode should not depend on pairings. Users should be able to add any recipe manually, whether or not a curated pairing exists.

## Future Timer Compatibility

Cooking Timers are a separate future feature. Multi-Recipe Cooking Mode should still leave room for timer state in each active recipe session, including possible per-recipe or per-step timers.

## Future Validation

Future validation could check:

- active session state keys remain stable
- multi-recipe UI references valid recipe slugs
- session cleanup does not delete recipe progress unexpectedly

## Future Implementation Order

1. Document multi-recipe cooking model
2. Define active cooking session state shape
3. Add active recipe switcher UI
4. Preserve per-recipe scale, checklist, and step progress while switching
5. Add close/remove behavior for one active recipe
6. Keep wake lock active while any recipe session is open
7. Optionally allow adding paired recipes quickly
8. Add validation or state cleanup checks if needed
