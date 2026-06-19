# Shukudu Kitchen Feature Roadmap

## Purpose

This roadmap records completed functionality and the planned development path for Shukudu Kitchen.

## Current Version - v1.11.1

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
- recipe-specific non-linear scaling overrides
- config-driven non-linear ingredient validation
- scalingMode consistency validation
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
- Validation reference data under `data/validation/`
- Stable ingredient IDs and structured steps
- Shared quantities across Ingredients, Preparation, Cooking Method, and Cooking Mode

### Recipe Scaling - Completed for Supported Recipes

- Preset scaling controls
- Rice-cup-first canonical base for rice recipes
- Automatic standard cup equivalents
- Exact base-ingredient quantity input
- Arbitrary scale calculation and persistence
- Recipe-specific non-linear overrides through `scaleQuantities`
- Optional `scalingMode` authoring intent for `linear` and `non-linear` ingredients
- Unit-aware formatting
- Practical produce and small-whole rounding

### Recipe Validation Framework - Completed for Current Non-Image Model

- Automated recipe validation workflow
- GitHub Actions integration
- Node.js 24 validation runtime
- `scripts/validate-recipes.js`
- `.github/workflows/validate-recipes.yml`
- `data/validation/non-linear-ingredients.json`
- Workflow trigger for `data/recipe-index.json`
- Workflow trigger for `data/recipes/**`
- Workflow trigger for `data/validation/**`
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
- `scalingMode` value validation
- `scalingMode` consistency validation
- `scaleQuantities` completeness validation against recipe-level scale options
- Config-driven required non-linear override validation

### Non-Linear Scaling Validation - Completed

- Maintained non-linear ingredient config at `data/validation/non-linear-ingredients.json`
- Validator fails scalable configured ingredients when `scaleQuantities` is missing
- Validator accepts `scalingMode: "linear"` to intentionally skip config matching
- Validator accepts `scalingMode: "non-linear"` to explicitly require `scaleQuantities`
- Validator enforces consistency: `linear` must not define `scaleQuantities`, and `non-linear` must define `scaleQuantities`
- Validator checks `scaleQuantities` keys against every recipe-level scale option
- Validator rejects missing override keys, extra override keys, non-numeric values, and negative values
- Existing recipes updated with required non-linear overrides

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
- Non-linear override coverage added for configured ingredients across existing recipes

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

Possible non-image validation enhancements:

- required `roundingType` for scalable measured ingredients
- `displayText` safety checks
- count-based produce weight guidance checks
- ingredient coverage checks across Preparation and Cooking Method

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
12. Non-linear ingredient validation - completed
13. ScalingMode consistency validation - completed
14. Serving adjustment
15. Print view
16. Recipe images and richer cards
17. Optional standard-cup scaling input
18. Offline recipe support
19. Image metadata validation after recipe images are introduced

## Development Principle

Prioritize features that reduce friction while actively cooking.

The site should remain simple to maintain, fast on mobile, easy to read in the kitchen, compatible with GitHub Pages, and free of unnecessary framework dependencies.
