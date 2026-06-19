# Shukudu Kitchen Feature Roadmap

## Purpose

This roadmap records completed functionality and the planned development path for Shukudu Kitchen.

## Current Version - v1.12.5

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
- required roundingType validation for scalable ingredients with quantities
- displayText safety validation for display-text-only fixed ingredients
- scaling base ingredient reference validation
- rice recipe unit validation
- large-produce weightGrams validation
- recipe-specific non-linear scaling overrides
- config-driven non-linear ingredient validation
- non-linear config uniqueness validation
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
- Scaling base ingredient reference validation
- Rice recipe unit validation
- Large-produce weightGrams validation
- Recipe-specific non-linear overrides through `scaleQuantities`
- Optional `scalingMode` authoring intent for `linear` and `non-linear` ingredients
- Required `roundingType` authoring intent for scalable ingredients with quantities
- Display-text-only fixed ingredients protected from accidental scaling
- Unit-aware formatting
- Practical produce and small-whole rounding

### Recipe Validation Framework - Completed for Current Non-Image Model

- Automated recipe validation workflow
- GitHub Actions integration
- Node.js 24 validation runtime
- `scripts/validate-recipes.js`
- `scripts/validate-produce-weights.js`
- `.github/workflows/validate-recipes.yml`
- `data/validation/non-linear-ingredients.json`
- Workflow trigger for `data/recipe-index.json`
- Workflow trigger for `data/recipes/**`
- Workflow trigger for `data/validation/**`
- Workflow trigger for `scripts/validate-recipes.js`
- Workflow trigger for `scripts/validate-produce-weights.js`
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
- Scaling base ingredient reference validation
- Rice recipe unit validation
- Large-produce weightGrams validation
- Quantity-input metadata validation
- Ingredient-group structure validation
- Unit standardization enforcement
- Structured-water enforcement
- Cooking-step structure validation
- Details metadata validation for `Cuisine`, `Meal Type`, and `Status`
- `servingSuggestions` validation
- `notes` validation
- `roundingType` allowed value validation
- required `roundingType` validation for scalable ingredients with quantities
- displayText safety validation for ingredients without quantity
- non-linear config key format validation
- non-linear config duplicate key rejection
- non-linear config duplicate match value rejection
- `scalingMode` value validation
- `scalingMode` consistency validation
- `scaleQuantities` completeness validation against recipe-level scale options
- Config-driven required non-linear override validation

### Scaling Base Ingredient Validation - Completed

- Validator checks `scaling.baseIngredient` when present on scaling-enabled recipes
- `baseIngredient` must match exactly one ingredient ID in the same recipe
- Quantity-input recipes still require `baseIngredient`
- Options-based recipes are protected from broken base ingredient references

### Rice Recipe Unit Validation - Completed

- Rice-category recipes must use `scaling.baseUnit: "riceCup"` when scaling is enabled
- Rice ingredient `id: "rice"` must use `unit: "rice cup"`
- Water ingredient `id: "water"` must use `unit: "rice cup"`
- The rule protects the rice-cup-first architecture from mixed unit drift

### Large-Produce WeightGrams Validation - Completed

- Scalable ingredients with `countLabel` and `roundingType: "large-produce"` must define positive `weightGrams`
- The rule keeps count-based produce scaling paired with practical gram guidance
- This validation is run through `scripts/validate-produce-weights.js` in GitHub Actions

### Non-Linear Config Validation - Completed

- Config rule keys must use slug format
- Duplicate config rule keys are rejected
- Duplicate config match values are rejected after normalization
- Empty config rule match values remain rejected

### Non-Linear Scaling Validation - Completed

- Maintained non-linear ingredient config at `data/validation/non-linear-ingredients.json`
- Validator fails scalable configured ingredients when `scaleQuantities` is missing
- Validator accepts `scalingMode: "linear"` to intentionally skip config matching
- Validator accepts `scalingMode: "non-linear"` to explicitly require `scaleQuantities`
- Validator enforces consistency: `linear` must not define `scaleQuantities`, and `non-linear` must define `scaleQuantities`
- Validator checks `scaleQuantities` keys against every recipe-level scale option
- Validator rejects missing override keys, extra override keys, non-numeric values, and negative values
- Existing recipes updated with required non-linear overrides

### RoundingType Validation - Completed

- Validator requires `roundingType` when `scalable: true` and `quantity` exists
- Validator accepts only `exact`, `small-whole`, and `large-produce`
- Existing scalable recipe ingredients updated with explicit rounding intent
- Display-text-only non-scalable ingredients remain exempt

### DisplayText Safety Validation - Completed

- Validator rejects ingredients that use `displayText` without `quantity` unless `scalable` is explicitly `false`
- Fixed/manual ingredient wording is protected from accidental scaling
- Ingredients may still combine `displayText` with `quantity` when a recipe intentionally needs structured scaling or fixed display wording

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
- RoundingType coverage added for scalable ingredients across existing recipes
- DisplayText safety validation added for display-text-only fixed ingredients
- Scaling base ingredient reference validation added for scaling-enabled recipes
- Non-linear config uniqueness validation added for config rules
- Rice recipe unit validation added for rice-cup-first recipes
- Large-produce weightGrams validation added for count-based produce guidance

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

- clean up validator structure
- duplicate ingredient name warning or error
- preparation coverage checks
- cooking method ingredient coverage checks

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
14. RoundingType validation - completed
15. DisplayText safety validation - completed
16. Scaling base ingredient reference validation - completed
17. Non-linear config uniqueness validation - completed
18. Rice recipe unit validation - completed
19. Large-produce weightGrams validation - completed
20. Clean up validator structure
21. Duplicate ingredient name warning or error
22. Preparation coverage validation
23. Cooking method ingredient coverage validation
24. Serving adjustment
25. Print view
26. Recipe images and richer cards
27. Optional standard-cup scaling input
28. Offline recipe support
29. Image metadata validation after recipe images are introduced

## Development Principle

Prioritize features that reduce friction while actively cooking.

The site should remain simple to maintain, fast on mobile, easy to read in the kitchen, compatible with GitHub Pages, and free of unnecessary framework dependencies.
