# Changelog

All notable changes to Shukudu Kitchen are recorded here.

The project follows a simple versioning model:

```text
Major.Minor.Patch
```

- Major: major redesign or breaking architecture change
- Minor: new user-facing functionality or architecture capability
- Patch: fixes, styling improvements, and small refinements

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
- Quantity-input labels standardized to end with `quantity`
- Ingredient groups standardized to `section`
- Abbreviated units replaced with canonical units
- Measured water moved into structured ingredient references where needed
- Image metadata validation deferred until recipe images are introduced

## 1.9.0 - 2026-06-16

### Added

- Warm light and dark themes across the homepage, recipe pages, scaling controls, ingredient checklists, and Cooking Mode
- Device-theme fallback on the first visit
- Saved theme preference using `localStorage` key `shukudu-theme`
- Header-level theme controls on the homepage and recipe pages
- Dedicated theme files: `theme.js`, `theme.css`, and `theme-toggle-fix.css`

### Changed

- Theme controls now sit inside the page layout instead of floating over the page
- Desktop theme controls use a fixed 92 px width
- Mobile theme controls use a fixed 44 px circular icon-only button
- Light mode uses a light button surface and dark mode uses a dark button surface
- Cooking Mode inherits the selected theme without showing a separate toggle
- Website version updated to `v1.9.0`
- Footer text centered on homepage and recipe pages

### Improved

- Reduced screen brightness during kitchen use through a warm charcoal dark palette
- Consistent theme preference across the homepage, recipe pages, and Cooking Mode
- Stable desktop button dimensions between Dark and Light states
- Improved icon and label spacing
- Consistent mobile control shape in both themes

## 1.8.0 - 2026-06-16

### Added

- Exact base-ingredient quantity input for supported recipes
- Arbitrary recipe scaling calculated from the entered base-ingredient quantity
- New scaling metadata fields: `inputMode`, `inputLabel`, `inputMin`, and `inputStep`
- Dedicated quantity-input styling in `recipe-scaling.css`
- Per-recipe persistence for entered quantities and calculated arbitrary scales
- Detailed design guidance in `docs/BASE_INGREDIENT_SCALING.md`

### Changed

- Scaling can use preset options or direct quantity input
- Suitable non-rice recipes can scale from the exact amount available
- Website version updated to `v1.8.0`

### Improved

- Single-vegetable recipes can adapt directly to measured ingredient quantity
- Exact quantity state is restored after reload
- Mixed-vegetable boundaries are documented

## 1.7.0 - 2026-06-15

### Added

- Rice-cup-first scaling architecture for rice recipes
- Explicit rice scaling metadata
- Automatic standard cup equivalents
- Recipe-aware scale controls

### Changed

- Tomato Bath migrated to a canonical 1 rice cup base
- Rice recipes display rice cup first with standard cup equivalents in brackets

## 1.6.0 - 2026-06-15

### Added

- Live recipe scaling controls
- Per-recipe scale persistence
- Structured scalable ingredient schema
- Ingredient references inside Preparation, Cooking Method, and Cooking Mode
- Practical kitchen rounding
- Optional gram display for count-based and unit-based ingredients

### Changed

- Tomato Bath became the pilot scalable recipe
- Quantities update consistently across the full recipe and Cooking Mode

## 1.5.1 - 2026-06-15

### Added

- Structured preparation and cooking steps
- Bullet rendering in recipe pages and Cooking Mode
- Recipe authoring standard

## 1.5.0 - 2026-06-15

### Added

- One recipe JSON file per recipe
- Lightweight homepage metadata
- Architecture documentation

### Removed

- Legacy combined `recipes.json`

## 1.4.0 - 2026-06-15

### Added

- Cooking Mode with one step at a time
- Previous, Next, Finish, progress bar, and saved progress

### Improved

- Full-screen mobile Cooking Mode
- Mobile-safe bottom controls

## 1.3.1 - 2026-06-15

### Fixed

- Prevented Cooking Mode controls from being hidden behind mobile browser UI

## 1.3.0 - 2026-06-15

### Added

- Initial Cooking Mode interface
- Resume current step after reopening

## 1.2.0 - 2026-06-15

### Added

- Sticky section navigation
- Active section tracking
- Horizontal mobile scrolling

## 1.1.0 - 2026-06-15

### Added

- Functional ingredient checkboxes
- Per-recipe checklist persistence
- Reset ingredients action

## 1.0.0 - 2026-06-14

### Added

- Initial GitHub Pages website
- JSON-driven recipe storage
- Homepage search and category filtering
- Recipe cards and individual recipe pages
- Mobile-responsive styling
- Initial recipes: Tomato Bath, Vangi Bath, and Curd Rice

## Maintenance Rule

Update this file whenever a user-facing feature, bug fix, data-structure change, or significant recipe-content update is published.
