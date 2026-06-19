# Shukudu Kitchen Feature Roadmap

## Purpose

This roadmap records completed functionality and the planned development path for Shukudu Kitchen.

## Current Version - v1.10.1

Shukudu Kitchen currently includes:

- JSON-driven recipe storage
- one recipe file per recipe
- homepage recipe index, search, and category filters
- individual recipe pages
- ingredient checklists
- sticky section navigation
- Cooking Mode with saved progress
- structured preparation and cooking steps
- scalable ingredient schema
- rice-cup-first scaling for rice recipes
- exact base-ingredient quantity scaling for supported recipes
- practical ingredient rounding and gram guidance
- completed automated recipe validation for the current non-image recipe model
- saved light and dark themes
- theme controls on the homepage and recipe page
- theme inheritance inside Cooking Mode
- installable PWA foundation
- app icons, favicons, and Apple touch icon support
- homepage and recipe-page app branding
- dynamic browser theme-color handling

## Completed Features

### Recipe Data Architecture - Completed

- One JSON file per recipe under `data/recipes/`
- Lightweight homepage metadata in `data/recipe-index.json`
- Stable ingredient IDs and structured steps
- Shared quantities across Ingredients, Preparation, Cooking Method, and Cooking Mode

### Recipe Scaling - Completed for Supported Recipes

- Preset scaling controls
- Rice-cup-first canonical base for rice recipes
- Automatic standard cup equivalents
- Exact base-ingredient quantity input
- Arbitrary scale calculation and persistence
- Recipe-specific non-linear overrides
- Unit-aware formatting
- Practical produce and small-whole rounding

### Recipe Validation Framework - Completed for Current Non-Image Model

- Automated recipe validation workflow
- GitHub Actions integration
- Node.js 24 validation runtime
- `scripts/validate-recipes.js`
- `.github/workflows/validate-recipes.yml`
- Workflow trigger for `data/recipe-index.json`
- Workflow trigger for `data/recipes/**`
- Workflow trigger for `scripts/validate-recipes.js`
- Workflow trigger for `.github/workflows/validate-recipes.yml`
- Required top-level recipe field validation
- Recipe-index array validation
- Recipe-index required field validation for `name`, `slug`, `category`, and `summary`
- Duplicate recipe-index slug rejection
- Recipe-index to recipe-file cross-checks
- Every recipe JSON must be listed in `data/recipe-index.json`
- Index `name`, `category`, and `summary` must match recipe JSON
- Slug format validation
- Slug to file-name validation
- Ingredient reference validation
- Duplicate ingredient ID detection
- Quantity-input metadata validation
- Ingredient-group structure validation
- Unit standardization enforcement
- Structured-water enforcement
- Cooking-step structure validation
- Details metadata validation for `Cuisine`, `Meal Type`, and `Status`
- `servingSuggestions` validation
- `notes` validation

### Light and Dark Themes - Completed

- Warm light and dark palettes
- Device-theme fallback on first visit
- Saved preference under `shukudu-theme`
- Theme controls on homepage and recipe page
- Cooking Mode inherits the active theme
- Footer text is centered

### PWA Foundation and Branding - Completed

- `manifest.webmanifest` added
- Installable app metadata added
- Standalone display mode added
- App name and short name standardized to `Shukudu Kitchen`
- App icons, favicons, and Apple touch icon metadata added
- Homepage brand icon added
- Recipe page brand icon added
- Dedicated `brand.css` added
- Theme-color metadata updates with the selected theme and page context

## Current Recipe Scaling Work

Completed:

- Tomato Bath migrated to a canonical 1 rice cup base
- Vangi Bath migrated to the scalable schema
- Curd Rice migrated to the scalable schema
- Explicit rice scaling metadata
- Recipe-aware scale controls
- Exact quantity scaling architecture
- Arbitrary scale persistence
- Mixed-vegetable boundaries documented
- Beans Palya migrated to validator-compliant quantity-input schema
- Balekai Palya migrated to validator-compliant quantity-input schema
- Quantity-input mode adopted for suitable single-base-ingredient recipes

## Future Features

- Standard cup scaling input
- Serving adjustment
- Improved recipe cards
- Print view
- Recipe images
- Direct edit link
- Offline recipe support
- Schema versioning if the recipe model expands significantly

## Future Validation Enhancements

Image metadata validation is deferred because images are not part of the current recipe model yet.

Once recipe images are introduced, possible validation checks include:

- image file exists
- image path matches recipe slug
- thumbnail exists
- image format and dimensions are valid
- recipe-index image references remain valid

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
10. Recipe validation framework - completed for current non-image model
11. PWA foundation and app branding - completed
12. Serving adjustment
13. Print view
14. Recipe images and richer cards
15. Optional standard-cup scaling input
16. Offline recipe support
17. Image metadata validation after recipe images are introduced

## Development Principle

Prioritize features that reduce friction while actively cooking.

The site should remain simple to maintain, fast on mobile, easy to read in the kitchen, compatible with GitHub Pages, and free of unnecessary framework dependencies.
