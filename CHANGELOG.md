# Changelog

All notable changes to Shukudu Kitchen are recorded here.

The project follows a simple versioning model:

```text
Major.Minor.Patch
```

- Major: major redesign or breaking architecture change
- Minor: new user-facing functionality or architecture capability
- Patch: fixes, styling improvements, and small refinements

## 1.7.0 — 2026-06-15

### Added

- Rice-cup-first scaling architecture for rice-based recipes
- Explicit rice scaling metadata using `baseIngredient`, `baseQuantity`, and `baseUnit`
- Automatic standard cup equivalents for rice and rice-cooking water
- Recipe-aware scale controls that show rice quantities only for rice-cup-based recipes
- Generic multiplier controls retained for non-rice recipes
- Future-ready path for optional standard-cup scaling input without redesigning the scaling engine

### Changed

- Tomato Bath migrated from a 0.75 rice cup source base to a canonical 1 rice cup base
- Tomato Bath ingredients rescaled to match the new 1 rice cup base
- Rice recipes now display rice cup first with standard cup equivalents in brackets
- Recipe data standards, architecture documentation, and feature roadmap aligned to the finalized rice-cup decision
- Scale controls now derive the visible rice quantity from recipe metadata instead of assuming every recipe uses rice

### Improved

- Public recipe links remain understandable through automatic standard cup equivalents
- Rice recipe scaling now matches the primary day-to-day cooking workflow
- Non-rice recipes remain compatible with the same generic scaling engine
- Future standard-cup input can be added as an input-layer enhancement rather than a new architecture

### In Progress

- Validate Tomato Bath across all supported rice quantities
- Migrate Vangi Bath and Curd Rice to the scalable schema where appropriate
- Refine practical ingredient quantities after real cooking tests

## 1.6.0 — 2026-06-15

### Added

- Live recipe scaling controls with 0.5×, 0.75×, 1×, 1.25×, 1.5×, and 2× options
- Per-recipe scale persistence using `localStorage`
- Structured scalable ingredient schema with stable ingredient IDs
- Ingredient references inside Preparation, Cooking Method, and Cooking Mode
- Practical kitchen rounding for large produce and small whole ingredients
- Optional gram display for count-based ingredients
- Optional gram display for unit-based ingredients
- Common ingredient weight reference in `docs/INGREDIENT_REFERENCE.md`

### Changed

- Tomato Bath converted into the pilot scalable recipe
- Recipe Scale panel and buttons styled to match the Shukudu Kitchen design system
- Ingredient quantities now update consistently across Ingredients, Preparation, Cooking Method, and Cooking Mode
- Gram values scale automatically and round sensibly for display

### Improved

- Large produce counts remain practical while grams remain the precise scaled target
- Small whole ingredients use practical half or whole counts
- Exact ingredients continue to use readable fractions
- Scaling does not alter cooking times, temperatures, induction wattage, or pressure-release instructions

### In Progress

- Additional Tomato Bath validation and refinements
- Decision on whether rice recipes should be authored primarily from standard cups or rice cups
- Migration of Vangi Bath and Curd Rice to the scalable schema

## 1.5.1 — 2026-06-15

### Added

- Structured preparation and cooking steps using `text` or `lead` + `items` + `after`
- Bullet rendering inside normal recipe pages
- Bullet rendering inside Cooking Mode
- Recipe authoring standard in `docs/RECIPE_DATA_STANDARD.md`
- Cooking Mode step-length rules for mobile readability

### Changed

- Tomato Bath converted to structured steps
- Vangi Bath converted to structured steps
- Curd Rice converted to structured steps
- Multi-ingredient actions now display each ingredient as a separate bullet

### Improved

- Better readability while actively cooking
- Reduced long instruction paragraphs
- Stronger consistency between Ingredients, Preparation, Cooking Method, and Cooking Mode
- Better foundation for future recipe scaling

## 1.5.0 — 2026-06-15

### Added

- One recipe JSON file per recipe under `data/recipes/`
- Lightweight homepage metadata in `data/recipe-index.json`
- Architecture documentation in `docs/ARCHITECTURE.md`

### Changed

- Homepage now loads recipe cards from `data/recipe-index.json`
- Recipe pages now load only the selected recipe file
- Recipe maintenance no longer requires editing one large combined data file

### Removed

- Legacy combined `recipes.json` file

## 1.4.0 — 2026-06-15

### Added

- Cooking Mode with one preparation or cooking step shown at a time
- Previous, Next, and Finish controls
- Progress bar and step numbering
- Per-recipe Cooking Mode progress using `localStorage`
- Step completion with persistent completed state

### Improved

- Full-screen mobile Cooking Mode
- Mobile-safe bottom controls using dynamic viewport height and safe-area spacing
- Themed Start Cooking, Previous, Next, Close, and Mark Complete controls

### Removed

- Planned step-specific ingredient display because cooking instructions already include exact ingredient quantities

## 1.3.1 — 2026-06-15

### Fixed

- Prevented Cooking Mode action buttons from being hidden behind mobile browser navigation bars
- Added mobile safe-area handling for the bottom action bar

## 1.3.0 — 2026-06-15

### Added

- Initial Cooking Mode interface and navigation
- Resume current cooking step after closing and reopening the recipe

## 1.2.0 — 2026-06-15

### Added

- Sticky pill-style section navigation on recipe pages
- Active section tracking while scrolling
- Horizontal pill scrolling on mobile
- Smooth section navigation with sticky-header offset

### Fixed

- Prevented active section from flickering backward between sections on mobile
- Fixed section jumps that scrolled to a section and then returned toward the navigation bar

## 1.1.0 — 2026-06-15

### Added

- Functional ingredient checkboxes
- Per-recipe checklist state using `localStorage`
- `Reset ingredients` action
- Completed ingredient styling with dimming and strikethrough
- Larger mobile-friendly ingredient tap targets

### Fixed

- Removed duplicate decorative and functional checkboxes
- Improved ingredient checklist spacing and layout

## 1.0.0 — 2026-06-14

### Added

- Initial GitHub Pages website
- JSON-driven recipe storage
- Homepage with search and category filtering
- Recipe cards
- Individual recipe pages
- Anytype-inspired recipe layout
- Mobile-responsive styling
- Initial recipes:
  - Tomato Bath
  - Vangi Bath
  - Curd Rice

## Maintenance Rule

Update this file whenever a user-facing feature, bug fix, data-structure change, or significant recipe-content update is published.
