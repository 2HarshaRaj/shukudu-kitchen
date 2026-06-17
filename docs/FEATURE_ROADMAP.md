# Shukudu Kitchen Feature Roadmap

## Purpose

This roadmap records completed functionality and the planned development path for Shukudu Kitchen.

## Current Version - v1.9.0

Shukudu Kitchen currently includes:

- JSON-driven recipe storage
- One recipe file per recipe
- Homepage recipe index, search, and category filters
- Individual recipe pages
- Functional ingredient checklists
- Sticky section navigation
- Cooking Mode with saved progress
- Structured preparation and cooking steps
- Scalable ingredient schema
- Rice-cup-first scaling for rice recipes
- Exact base-ingredient quantity scaling for supported recipes
- Practical ingredient rounding and gram guidance
- Automated recipe validation on push
- Saved light and dark themes
- Device-theme fallback on first visit
- Theme controls on the homepage and recipe page
- Theme inheritance inside Cooking Mode

## Completed Features

### Recipe Data Architecture - Completed

- One JSON file per recipe under `data/recipes/`
- Lightweight homepage metadata in `data/recipe-index.json`
- Stable ingredient IDs and structured steps
- Shared quantities across Ingredients, Preparation, Cooking Method, and Cooking Mode

### Ingredient Checklists - Completed

- Tap ingredients to mark them complete
- Saved state per recipe
- Reset action
- Mobile-friendly touch targets

### Sticky Section Navigation - Completed

- Sticky pill navigation on recipe pages
- Active section tracking
- Horizontal scrolling on mobile

### Cooking Mode - Completed

- One step at a time
- Previous, Next, Finish, and completion controls
- Progress bar and saved current step
- Mobile-safe bottom controls
- Active theme inherited automatically

### Recipe Scaling - Completed for Supported Recipes

- Preset scaling controls
- Rice-cup-first canonical base for rice recipes
- Automatic standard cup equivalents
- Exact base-ingredient quantity input
- Arbitrary scale calculation and persistence
- Recipe-specific non-linear overrides
- Unit-aware formatting
- Practical produce and small-whole rounding

### Exact Base-Ingredient Quantity Scaling - Completed

Supported metadata includes:

- `baseIngredient`
- `baseQuantity`
- `baseUnit`
- `inputMode`
- `inputLabel`
- `inputMin`
- `inputStep`

Calculation:

```text
selected scale = entered quantity / base quantity
```

Use exact quantity input only when one clear ingredient reliably drives recipe size. Flexible mixed-vegetable composition remains outside automatic scaling.

### Recipe Validation - Completed

- Automated recipe validation workflow
- GitHub Actions integration
- Node.js 24 validation runtime
- `scripts/validate-recipes.js`
- `.github/workflows/validate-recipes.yml`
- Ingredient reference validation
- Duplicate ingredient ID detection
- Quantity-input metadata validation
- Ingredient-group structure validation
- Unit standardization enforcement
- Structured-water enforcement

### Light and Dark Themes - Completed

Implemented behaviour:

- Warm light and dark palettes
- First visit follows the device theme preference
- Manual preference saved under `shukudu-theme`
- Preference reused across homepage and recipe pages
- Cooking Mode inherits the active theme
- Homepage control placed inside the main header
- Recipe-page control placed beside Back to recipes
- No persistent floating control
- Desktop control uses a fixed 92 px width
- Mobile control uses a fixed 44 px circular icon-only button
- Light mode uses a light control surface
- Dark mode uses a dark control surface
- Footer text is centered

Implementation files:

- `theme.js`
- `theme.css`
- `theme-toggle-fix.css`

## Current Recipe Scaling Work

Completed:

- Tomato Bath migrated to a canonical 1 rice cup base
- Explicit rice scaling metadata
- Recipe-aware scale controls
- Exact quantity scaling architecture
- Arbitrary scale persistence
- Mixed-vegetable boundaries documented
- Beans Palya migrated to validator-compliant quantity-input schema

Still to do:

- Continue testing Tomato Bath scaling data
- Migrate Vangi Bath to the scalable schema
- Migrate Curd Rice to the scalable schema
- Validate all supported scales across migrated recipes
- Adopt quantity-input mode in suitable single-base-ingredient recipes

## Future Features

### Standard Cup Scaling Input

Possible future enhancement:

- accept standard cup input for rice recipes
- convert to rice cup internally
- reuse the current scaling engine

### Serving Adjustment

Planned considerations:

- distinguish serving-based recipes from rice-quantity-based recipes
- avoid implying that cooking time scales linearly
- preserve recipe-specific water ratios

### Improved Recipe Cards

Possible metadata:

- cuisine
- meal type
- base rice quantity
- approximate cooking time
- serving estimate
- recipe status
- recipe image

### Print View

Planned behaviour:

- hide interactive controls
- remove unnecessary backgrounds and shadows
- keep ingredients and steps readable

### Recipe Images

Planned structure:

- image path in recipe metadata
- lightweight loading
- fallback when no image exists

### Direct Edit Link

Optional owner-focused link to the recipe file in GitHub.

### Validation Improvements

Possible future enhancements:

- slug uniqueness validation
- recipe-index cross-check validation
- image metadata validation
- cooking-step structure validation
- schema versioning

## Recommended Development Order

1. Ingredient checklists - completed
2. Sticky section navigation - completed
3. Cooking Mode - completed
4. Recipe-per-file architecture - completed
5. Structured recipe steps - completed
6. Ingredient scaling engine - completed for supported recipes
7. Rice cup scaling base - completed
8. Exact base-ingredient quantity scaling - completed
9. Light and dark themes - completed
10. Recipe validation workflow - completed
11. Validate and refine Tomato Bath scales - in progress
12. Migrate remaining recipes to scaling
13. Apply quantity-input mode to suitable recipes
14. Serving adjustment
15. Print view
16. Recipe images and richer cards
17. Optional standard-cup scaling input
18. Validation improvements

## Development Principle

Prioritize features that reduce friction while actively cooking.

The site should remain:

- simple to maintain
- fast on mobile
- easy to read in the kitchen
- compatible with GitHub Pages
- free of unnecessary frameworks or backend dependencies
