# Changelog

All notable changes to Shukudu Kitchen are recorded here.

The project follows a simple versioning model:

```text
Major.Minor.Patch
```

- Major: major redesign or breaking architecture change
- Minor: new user-facing functionality or architecture capability
- Patch: fixes, styling improvements, and small refinements

## 1.12.1 - 2026-06-19

### Added

- DisplayText safety validation in `scripts/validate-recipes.js`
- README version bump to `v1.12.1`
- Feature Roadmap version bump to `v1.12.1`

### Validation Rules

- Ingredients with `displayText` and no `quantity` must set `scalable: false`
- Ingredients with both `displayText` and `quantity` remain allowed so intentionally structured quantities can still scale or stay fixed

### Improved

- Prevents manual or fixed ingredient wording from accidentally entering the scaling engine
- Keeps display-text-only ingredients explicit and predictable

## 1.12.0 - 2026-06-19

### Added

- Required `roundingType` validation for scalable ingredients with quantities
- Allowed `roundingType` value validation for `exact`, `small-whole`, and `large-produce`
- Documentation for the required rounding behavior standard
- README version bump to `v1.12.0`
- Feature Roadmap version bump to `v1.12.0`

### Validation Rules

- Ingredients with `scalable: true` and `quantity` must define `roundingType`
- `roundingType`, when present, must be `exact`, `small-whole`, or `large-produce`

### Changed

- Added missing `roundingType` values to existing recipe JSON files
- Updated README, Architecture, Recipe Data Standard, and Feature Roadmap documentation

### Improved

- Future scalable ingredients must explicitly declare display and rounding intent
- Prevents unclear scaled output such as awkward decimals for count-based ingredients
- Keeps recipe rendering easier to reason about as the recipe library grows

## 1.11.1 - 2026-06-19

### Added

- `scalingMode` consistency validation in `scripts/validate-recipes.js`
- Documentation updates for `scalingMode` consistency rules
- README version bump to `v1.11.1`
- Feature Roadmap version bump to `v1.11.1`

### Validation Rules

- `scalingMode: "linear"` must not define `scaleQuantities`
- `scalingMode: "non-linear"` must define `scaleQuantities`

### Improved

- Prevents mixed scaling signals in recipe JSON
- Keeps the non-linear ingredient validation model easier to reason about

## 1.11.0 - 2026-06-19

### Added

- Config-driven non-linear ingredient validation using `data/validation/non-linear-ingredients.json`
- `scalingMode` authoring intent for `linear` and `non-linear` ingredients
- Complete `scaleQuantities` validation against recipe-level `scaling.options`
- Workflow trigger for `data/validation/**`
- Documentation for the non-linear scaling architecture and authoring rules

### Validation Rules

- Non-linear config rules must have valid keys and match terms
- `scalingMode`, when present, must be `linear` or `non-linear`
- `scaleQuantities` must be complete, numeric, non-negative, and use only recipe-supported scale keys
- Scalable ingredients matching the non-linear config must define `scaleQuantities` unless marked with `scalingMode: "linear"`

### Changed

- Added required non-linear overrides across existing affected recipes
- Updated README to `v1.11.0`
- Updated Architecture, Recipe Data Standard, and Feature Roadmap documentation

### Improved

- Future recipes now fail validation when configured non-linear ingredients are accidentally left on blind linear scaling
- Non-linear scaling rules are easier to maintain as the recipe library grows

## 1.10.1 - 2026-06-19

### Added

- Progressive Web App manifest through `manifest.webmanifest`
- Installable app support with standalone display mode
- App icon metadata for 192 px and 512 px install icons
- Apple touch icon and favicon metadata
- Brand icon in the homepage header
- Brand icon in recipe page back navigation
- Dedicated brand styling through `brand.css`
- Dynamic browser theme-color handling in `theme.js`

### Changed

- PWA short name standardized to `Shukudu Kitchen`
- Homepage browser/PWA theme color aligned with the warm header branding
- Recipe page status bar color now follows the selected light or dark theme
- Homepage mobile branding now stacks the app icon above the title
- Recipe page brand icon reduced for a cleaner cooking-focused layout
- Website version updated to `v1.10.1`

### Improved

- Installed app experience on supported browsers
- Android/PWA status bar integration
- Visual consistency between the app icon, homepage, recipe page, and installed PWA
- Foundation for future offline support through a Service Worker

## 1.9.1 - 2026-06-17

### Added

- Recipe validation workflow
- GitHub Actions validation pipeline
- Node.js 24 validation runtime
- Automatic validation on push for recipe data, validator logic, and workflow configuration changes
- Workflow trigger for `data/recipe-index.json`
- Validator documentation across recipe data, architecture, roadmap, and base-ingredient scaling docs
- Completed validation framework for the current non-image recipe model

### Validation Rules

- Required field validation
- Ingredient array validation
- Preparation and cooking method array validation
- Ingredient ID uniqueness validation
- Ingredient reference validation
- Recipe-index validation
- Recipe-index must be an array
- Recipe-index entries must include `name`, `slug`, `category`, and `summary`
- Duplicate recipe-index slug rejection
- Recipe-index to recipe-file cross-checks
- Every recipe JSON file must be listed in `data/recipe-index.json`
- Index `name`, `category`, and `summary` must match recipe JSON
- Slug format validation using `^[a-z0-9]+(-[a-z0-9]+)*$`
- Slug to filename validation using `<slug>.json`
- Cooking-step structure validation for plain text and structured ingredient steps
- Details metadata validation for `Cuisine`, `Meal Type`, and `Status`
- `servingSuggestions` array validation
- `notes` array validation
- Quantity-input metadata validation
- Exact `baseIngredient` to ingredient ID matching
- Standard quantity preset validation for quantity-input recipes
- Ingredient group `section` / `items` validation
- Legacy ingredient group `category` rejection
- Unit standardization validation for `teaspoon` and `tablespoon`
- Structured measured-water validation

### Changed

- Beans Palya migrated to validator-compliant schema
- `baseUnit: "gram"` changed to `baseUnit: "g"`
