# Changelog

All notable changes to Shukudu Kitchen are recorded here.

The project follows a simple versioning model:

```text
Major.Minor.Patch
```

- Major: major redesign or breaking architecture change
- Minor: new user-facing functionality or architecture capability
- Patch: fixes, styling improvements, and small refinements

## Unreleased

### Added

- Punjabi Dal Tadka recipe with a 150 g total dal base: 100 g toor dal and 50 g moong dal
- `Dal` as a supported relationship dish type for recipe discovery and validation

### Changed

- Relationship documentation now includes Dal examples and allowed dish type guidance

### Planned

- Curated `relationships.goesWellWith` recipe pairings
- Dish type filters using relationship metadata
- Image metadata validation after recipe images are introduced

## 1.15.2 - 2026-06-20

### Added

- Homepage search now supports `searchAliases` for alternate recipe names and regional names
- Homepage search now includes relationship metadata such as Cuisine, meal types, dish types, and goes-well-with slugs
- Added `docs/SEARCH.md` to document search sources, alias rules, and future search improvements
- Added `scripts/validate-search.js` for search alias validation
- Added search aliases to existing recipe index entries
- Added first curated `relationships.goesWellWith` pairings for Tomato Rasam, Beans Palya, Balekai Palya, and Curd Rice

### Changed

- Homepage script asset version bumped to `script.js?v=1.15.2`
- Homepage footer and README version updated to `v1.15.2`
- Validation workflow now runs search alias validation
- Relationship docs and roadmap now clarify the `goesWellWith` pairing standard before pairings are added

## 1.15.1 - 2026-06-20

### Added

- `referenceQuantity` documentation for gram-based pantry staples that need cup or spoon guidance
- Static asset versioning documentation
- Technical debt note for consolidating ingredient formatters later

### Changed

- Homepage and recipe page static JS/CSS assets now use `?v=1.15.1` cache-busting query strings
- Footer version updated to `v1.15.1`
- README now links the new reference quantity, asset versioning, and technical debt docs

### Fixed

- Recipe scaling formatter now preserves `referenceQuantity` display after refreshes and scale changes

## 1.15.0 - 2026-06-20

### Added

- Homepage Meal Type filter chips: All, Breakfast, Lunch, Dinner, Snack, and Side
- Dedicated `homepage-filters.css` for homepage filter chip styling

### Changed

- Homepage filtering now combines search text, category, and meal type
- Footer version updated to `v1.15.0`

### Improved

- Makes the completed relationship model useful for browsing recipes immediately
- Keeps the existing category dropdown while adding a faster meal-based discovery option

## 1.14.0 - 2026-06-20

### Added

- Structured `relationships` metadata across recipe JSON files
- `relationships.mealTypes` for meal discovery
- `relationships.dishTypes` for dish classification
- `relationships.goesWellWith` as the future curated pairing field
- Recipe relationship validation in `scripts/validate-recipes.js`
- Base quantity display inside the recipe page Details section

### Changed

- Moved meal classification out of `details[Meal Type]` and into `relationships.mealTypes`
- Homepage recipe cards now show compact chips: Cuisine, Meal Type, primary Dish Type, and base quantity
- Recipe pages now show full relationship details, including all dish types
- Recipe details rendering now hides old Base Quantity display text and generates Base from scaling metadata
- Tomato Bath and Menthya Rice Bath are classified as `One Pot` because rice cooks directly with the masala in the pressure cooker
- Beans Palya cuisine label standardized to `South Indian · Karnataka`

### Validation Rules

- `relationships` must exist as an object
- `relationships.mealTypes` must be a non-empty array of allowed values
- `relationships.dishTypes` must be a non-empty array of allowed values
- `relationships.goesWellWith` must be an array
- `goesWellWith` values must be valid recipe slugs and must not self-reference the current recipe
- `details` now requires only Cuisine and Status; Meal Type belongs in `relationships.mealTypes`

### Improved

- Keeps recipe metadata closer to an Anytype-style relationship model
- Makes future filters and curated pairings easier to build
- Keeps homepage cards cleaner while preserving full details on recipe pages

## 1.13.0 - 2026-06-19

### Added

- Optional Cooking Mode screen wake-lock support through `wake-lock.js` and `wake-lock.css`
- Wake-lock control inside Cooking Mode
