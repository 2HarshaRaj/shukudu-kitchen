# Shukudu Kitchen Feature Roadmap

## Purpose

This roadmap records completed functionality and the planned development path for Shukudu Kitchen.

## Current Version - v1.14.0

Shukudu Kitchen currently includes:

- JSON-driven recipe storage
- one recipe file per recipe
- homepage recipe index, search, and category filters
- compact homepage relationship chips
- individual recipe pages with full relationship details and base quantity
- ingredient checklists
- sticky section navigation
- Cooking Mode with saved progress
- optional Cooking Mode screen wake-lock support
- structured preparation and cooking steps
- scalable ingredient schema
- rice-cup-first scaling for rice recipes
- compact rice preset labels in scale controls
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
- recipe relationship validation
- completed automated recipe validation for the current non-image recipe model
- documented and implemented recipe relationships model for meal types, dish types, and future pairings
- saved light and dark themes
- SVG-style theme, wake-lock, and close icons
- polished native select closed-state styling
- consistent button hover, active, and shadow behavior across light and dark modes
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

### Recipe Relationships - Completed

- Dedicated relationship model documented in `docs/RECIPE_RELATIONSHIPS.md`
- Clear separation between `details` and `relationships`
- `details` now stores human-facing metadata such as `Cuisine` and `Status`
- `relationships.mealTypes` stores meal classification
- `relationships.dishTypes` stores dish classification
- `relationships.goesWellWith` is present as the future curated pairing field
- `details["Meal Type"]` removed from current recipe JSON
- Homepage cards use compact relationship chips: Cuisine, Meal Type, primary Dish Type, and base quantity
- Recipe pages show full relationship details and generated base quantity
- Validator enforces relationship metadata
- `One Pot` classification rule documented

### Recipe Scaling - Completed for Supported Recipes

- Preset scaling controls
- Rice-cup-first canonical base for rice recipes
- Compact rice preset button labels using `cup/cups` while keeping current selected values fully descriptive
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

### Cooking Mode Wake Lock and UI Polish - Completed

- Optional screen wake-lock support in Cooking Mode
- Wake-lock control added beside the Cooking Mode close button
- Wake lock releases when Cooking Mode closes
- Wake lock shows graceful unavailable messaging when unsupported
- Wake-lock status text added below the Cooking Mode title
- SVG-style wake-lock icon added
- Cooking Mode close button moved to SVG-style icon rendering
- Wake-lock and close buttons aligned to the same 42 px control size
- Dark-mode hover behavior improved for the Mark Complete button
- Utility controls use quiet default states and subtle hover states
- Active/confirmed controls use clear accent styling
- Scale preset active state changed to inset styling to avoid clipped shadow artifacts

### Homepage and Recipe Page UI Polish - Completed

- Theme toggle uses SVG-style sun and moon icons
- Native category dropdown closed state uses a custom SVG chevron
- Select focus styling aligned with the rest of the UI
- Homepage cards show a selective, calm metadata chip set
- Recipe pages show full relationship details and base quantity
- Button shadow logic clarified: primary actions and confirmed states may use shadows; scale choices remain flat/inset
- Desktop and zoomed-desktop layouts improved for utility controls and scale controls

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
- Details metadata validation for `Cuisine` and `Status`
- Relationship metadata validation for `mealTypes`, `dishTypes`, and `goesWellWith`
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

### Light and Dark Themes - Completed

- Warm light and dark palettes
- Device-theme fallback on first visit
- Saved preference under `shukudu-theme`
- Theme controls on homepage and recipe page
- Cooking Mode inherits the active theme
- Footer text is centered
- SVG-style utility icons replace emoji/font-dependent icon rendering

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
- Compact rice preset labels
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

## Current Recipe Relationship Work

Completed:

- Added `relationships` to every recipe JSON
- Moved meal type data from `details["Meal Type"]` into `relationships.mealTypes`
- Added `relationships.dishTypes` for structured discovery
- Added empty `relationships.goesWellWith` arrays as the future curated pairing field
- Updated homepage cards to prefer relationship data and keep cards compact
- Updated recipe page details rendering to display full relationship details
- Added generated `Base` detail on recipe pages from scaling metadata
- Updated validation to enforce the relationship model
- Removed `details["Meal Type"]` from current recipe JSON
- Documented `One Pot` classification rule

## Future Features

- Meal type and dish type filters using relationship metadata
- “Goes well with” recipe links on recipe pages
  - Use `relationships.goesWellWith` as the future curated pairing field.
  - Show a small curated set of pairings rather than every technically matching recipe.
  - For broad recipes like rasam, avoid linking every palya; prefer curated pairings such as 3-5 best matches, rotating categories, or a future rule-based pairing model.
- Standard cup scaling input
- Serving adjustment
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
20. Cooking Mode wake lock - completed
21. SVG utility icon and button-state polish - completed
22. Recipe relationships design document - completed
23. Add relationship fields to recipes - completed
24. Update homepage cards to use relationship data - completed
25. Update recipe details rendering for relationship-based meal types - completed
26. Add recipe relationship validation - completed
27. Add generated Base to recipe details - completed
28. Clean up validator structure
29. Duplicate ingredient name warning or error
30. Preparation coverage validation
31. Cooking method ingredient coverage validation
32. Goes-well-with recipe pairings
33. Meal type and dish type filters
34. Serving adjustment
35. Print view
36. Recipe images and richer cards
37. Optional standard-cup scaling input
38. Offline recipe support
39. Image metadata validation after recipe images are introduced

## Development Principle

Prioritize features that reduce friction while actively cooking.

The site should remain simple to maintain, fast on mobile, easy to read in the kitchen, compatible with GitHub Pages, and free of unnecessary framework dependencies.