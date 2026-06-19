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

- `docs/RECIPE_RELATIONSHIPS.md` to define the structured recipe relationship model
- Target relationship structure for `mealTypes`, `dishTypes`, and `goesWellWith`
- Migration direction for moving meal type data out of display-only `details`

### Planned

- Add `relationships` to every recipe JSON
- Update homepage cards and recipe details rendering to use relationship data
- Add validator coverage for recipe relationships after the migration is implemented

## 1.13.0 - 2026-06-19

### Added

- Optional Cooking Mode screen wake-lock support through `wake-lock.js` and `wake-lock.css`
- Wake-lock control inside Cooking Mode
- Wake-lock status text below the Cooking Mode title
- SVG-style wake-lock icon
- SVG-style theme toggle icons
- SVG-style Cooking Mode close icon
- Custom SVG chevron for the native category dropdown closed state

### Changed

- Shortened rice scale preset labels from `rice cup/rice cups` to compact `cup/cups` button labels while keeping the current selected value fully descriptive
- Improved scale-control desktop flow and prevented left-side clipping in scrollable preset rows
- Removed clipped drop-shadow styling from active scale preset buttons and switched to inset active styling
- Aligned wake-lock and close buttons to the same 42 px control size
- Improved Cooking Mode utility button consistency across light and dark modes
- Improved dark-mode hover styling for the Mark Complete button
- Polished native category dropdown arrow placement and focus styling
- Updated README, Architecture, Feature Roadmap, and Base Ingredient Scaling docs to reflect the v1.13.0 Cooking Mode and UI polish release

### Improved

- Cooking Mode usability during active cooking
- Consistent icon rendering across Android, iPhone, Chrome, Safari, and desktop browsers
- Light/dark button-state consistency
- Mobile and zoomed-desktop control alignment
- Scale-control readability for rice recipes and quantity-input recipes

## 1.12.5 - 2026-06-19

### Added

- Produce weight guidance validation through `scripts/validate-produce-weights.js`
- GitHub Actions step for produce weight validation
- README version bump to `v1.12.5`
- Feature Roadmap version bump to `v1.12.5`

### Validation Rules

- Scalable ingredients with `countLabel` and `roundingType: "large-produce"` must define positive `weightGrams`

### Improved

- Keeps count-based produce scaling paired with practical gram guidance

## 1.12.4 - 2026-06-19

### Added

- Rice recipe unit validation in `scripts/validate-recipes.js`
- README version bump to `v1.12.4`
- Feature Roadmap version bump to `v1.12.4`

### Validation Rules

- Rice-category recipes with scaling enabled must use `scaling.baseUnit: "riceCup"`
- Rice ingredient `id: "rice"` must use `unit: "rice cup"`
- Water ingredient `id: "water"` must use `unit: "rice cup"`

### Improved

- Keeps rice-cup-first scaling consistent across rice recipes

## 1.12.3 - 2026-06-19

### Added

- Non-linear ingredient config uniqueness validation in `scripts/validate-recipes.js`
- README version bump to `v1.12.3`

### Validation Rules

- `non-linear-ingredients.rules[].key` must use slug format
- Duplicate non-linear config keys are rejected
- Duplicate non-linear config match values are rejected after normalization

### Improved

- Keeps `data/validation/non-linear-ingredients.json` clean as the config grows
- Prevents duplicate match terms from silently creating unclear non-linear scaling behaviour

## 1.12.2 - 2026-06-19

### Added

- Scaling base ingredient reference validation in `scripts/validate-recipes.js`
- README version bump to `v1.12.2`
- Feature Roadmap version bump to `v1.12.2`

### Validation Rules

- When `scaling.enabled` is `true` and `baseIngredient` is present, it must match exactly one ingredient ID in the recipe
- Quantity-input recipes still require `baseIngredient`

### Improved

- Options-based recipes are now protected from broken scaling base references
- Rice and non-rice scaling metadata is easier to validate consistently

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
