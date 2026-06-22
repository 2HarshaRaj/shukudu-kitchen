# Meal Mode

## Purpose

Users may cook two or more recipes together, such as rice + dal, rasam + palya, or bath + curd rice. Meal Mode should make those real kitchen workflows easier by keeping multiple active recipes available at the same time.

The goal is to preserve each active recipe's selected scale, ingredient checklist state, and cooking step progress while allowing the user to move between recipes without losing their place.

This document describes a design direction. Phase 1 implements a simple local Current Meal workflow and recipe-by-recipe Prepare Meal view; combined ingredients, saved named meals, timers, and smart timelines remain future work.

## Core Principle

Meal Mode should not merge multiple recipes into one combined recipe.

Each recipe remains independent:

- recipe data stays separate
- scale state stays tied to that recipe
- ingredient checklist progress stays tied to that recipe
- cooking step progress stays tied to that recipe

The UI only helps users switch between active cooking sessions. Existing single-recipe Cooking Mode remains the foundation, and Meal Mode behavior should build on that model rather than replacing it.

## Current Meal and Active Recipe Sessions

Phase 1 stores a local Current Meal list of recipe slugs until the user clears it. A future active cooking session model could track one session per active recipe. Each active recipe session may include:

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

Meal Mode should not depend on pairings. Users should be able to add any recipe manually, whether or not a curated pairing exists.

## Future Timer Compatibility

Cooking Timers are a separate future feature. Meal Mode should still leave room for timer state in each active recipe session, including possible per-recipe or per-step timers.

## Future Validation

Future validation could check:

- active session state keys remain stable
- Meal Mode UI references valid recipe slugs
- session cleanup does not delete recipe progress unexpectedly

## Future Implementation Order

1. Document Meal Mode model
2. Define active cooking session state shape
3. Add active recipe switcher UI
4. Preserve per-recipe scale, checklist, and step progress while switching
5. Add close/remove behavior for one active recipe
6. Keep wake lock active while any recipe session is open
7. Optionally allow adding paired recipes quickly
8. Add validation or state cleanup checks if needed


## Phase 1 Current Meal Scope

Implemented Phase 1 behavior:

- Current Meal navigation link
- Add to Meal action on recipe pages
- local Current Meal persistence until manual clear
- In Current Meal card badge/state
- Current Meal page for listing, removing, reordering, and clearing selected recipes
- Prepare Meal section that keeps ingredients and steps separated by recipe
- each recipe continues using its own saved recipe scale and People × Meals selection

Intentionally deferred:

- combined ingredient merging
- smart interleaved cooking timeline
- saved named meals
- shared scale controls across a meal
- timer coordination across recipes

## Future Improvements

The following review notes are intentionally recorded as future improvements, not Phase 1 bugs:

- Reuse shared recipe formatting/rendering helpers in Meal Mode instead of maintaining duplicate formatting logic inside `current-meal.js`.
- Consider a more compact Prepare Meal experience where each recipe is shown as a block with an “Open Cooking Mode” action instead of rendering every ingredient and every step on one long page.
- Add quick “+ Meal” actions directly on homepage recipe cards without requiring the recipe page.
- Standardize navigation labels across pages, likely using “Home” and “Current Meal” everywhere instead of mixing “Back to recipes” and “Current Meal”.
- Add ability to jump directly from Prepare Meal into a recipe's Cooking Mode while preserving Current Meal context.
