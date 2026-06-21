# Shukudu Kitchen

Recipes refined through real cooking.

## Current Version

`v1.16.5`

## Overview

Shukudu Kitchen is a lightweight public recipe website built with HTML, CSS, JavaScript, and JSON. It is designed as a practical cooking-ready cookbook rather than a static archive of copied recipes.

Recipes are adapted to match real kitchen use, including:

- rice-cup-first scaling for rice recipes
- exact base-ingredient quantity scaling for supported recipes
- generated base quantity details on recipe pages
- automatic standard cup equivalents for public readability
- scalable reference quantities for gram-based pantry staples
- practical ingredient rounding
- gram guidance for vegetables and other ingredients
- structured preparation and cooking steps
- structured recipe relationships for meal types, dish types, and curated pairings
- manual Pairings links for curated recipe pairings
- warning-only validation for non-reciprocal pairings
- search aliases for alternate names and regional dish names
- compact homepage relationship chips
- homepage meal type filters
- full recipe-page relationship details with base quantity
- mobile-friendly Cooking Mode
- optional Cooking Mode screen wake-lock support
- saved light and dark themes for comfortable kitchen use
- installable Progressive Web App support
- app-style branding and dynamic browser theme-color handling
- Open Graph and WhatsApp-ready social preview metadata

## Main Features

- Recipe cards with search, category filters, and meal type filters
- Homepage search across recipe name, summary, aliases, relationship metadata, and non-common ingredients
- One JSON file per recipe
- Ingredient checklists with saved progress
- Sticky section navigation
- Cooking Mode with step tracking
- Optional screen wake-lock control inside Cooking Mode
- Scalable ingredients with per-recipe persistence
- Recipe-aware scale controls
- Rice-cup-first display for rice recipes
- Compact rice preset labels in scale controls, while current quantities remain fully descriptive
- Generic multiplier display for suitable non-rice recipes
- Exact base-ingredient quantity input for supported recipes
- Automatic conversion of an entered base quantity into an arbitrary recipe scale
- Persistence of entered quantities and calculated scales per recipe
- Structured recipe relationship model documented in `docs/RECIPE_RELATIONSHIPS.md`
- Reference quantity metadata documented in `docs/REFERENCE_QUANTITY.md`
- Search alias rules documented in `docs/SEARCH.md`
- UI theme rules documented in `docs/UI_THEME_STANDARD.md`
- Static asset versioning documented in `docs/STATIC_ASSET_VERSIONING.md`
- Technical debt and formatter cleanup notes tracked in `docs/TECHNICAL_DEBT.md`
- Homepage cards show Cuisine, Meal Type, primary Dish Type, and base quantity
- Homepage Meal Type filters use `relationships.mealTypes`
- Recipe pages show full relationship details, base quantity, and curated Pairings recipe links
- Social preview image and metadata for large link previews
- Recipe-specific non-linear scaling overrides
- Explicit rounding behavior for scalable ingredients
- Config-driven non-linear ingredient validation
- Automated recipe validation through GitHub Actions
- Node.js 24 validation pipeline
- Recipe-index, slug, metadata, relationship, step-structure, notes, scaling base ingredient, rice recipe units, scalingMode, roundingType, displayText safety, referenceQuantity structure, searchAliases structure, large-produce weightGrams, non-linear config uniqueness, non-linear override, pairing, and theme validation
- Light and dark themes with device-theme fallback
- Saved theme preference across the homepage, recipe pages, and Cooking Mode
- Header-level theme controls with compact circular controls on mobile
- SVG-style utility icons for theme toggle, wake-lock, and close controls
- Polished native category dropdown closed-state styling
- Consistent button hover and active-state styling across light and dark modes
- PWA manifest with standalone display mode
- App icons, favicons, Apple touch icon, and social preview image support
- Brand icon on the homepage and recipe pages
- Dynamic theme-color updates for Android/PWA status bar integration

## Project Structure

```text
shukudu-kitchen/
- data/
  - recipe-index.json
  - recipes/
  - validation/non-linear-ingredients.json
- docs/
  - UI_THEME_STANDARD.md
- icons/
  - social-preview.png
- scripts/
  - validate-recipes.js
  - validate-produce-weights.js
  - validate-search.js
  - validate-recipe-pairings.js
  - validate-theme.js
- .github/workflows/
- index.html
- recipe.html
- manifest.webmanifest
- script.js
- recipe.js
- recipe-pairings.js
- recipe-pairings.css
- recipe-scaling.js
- recipe-scaling.css
- homepage-filters.css
- wake-lock.js
- wake-lock.css
- theme.js
- theme.css
- theme-toggle-fix.css
- brand.css
- style.css
- CHANGELOG.md
```

## Recipe Storage

- Homepage metadata is stored in `data/recipe-index.json`.
- Full recipes are stored individually under `data/recipes/`.
- Validation reference data is stored under `data/validation/`.
- `data/validation/non-linear-ingredients.json` lists ingredient patterns that require non-linear scale overrides when the ingredient is scalable.
- Non-linear validation rule keys must use slug format, rule keys must be unique, and match terms must be unique.
- Each recipe slug must match its file name exactly: `data/recipes/<slug>.json`.
- Each recipe file must be listed in `data/recipe-index.json`.
- Index `name`, `category`, and `summary` values must match the recipe JSON.
- Index `searchAliases` may be used for alternate names and regional names. See `docs/SEARCH.md`.
- Scalable recipes use structured ingredient objects with stable IDs.
- Recipe relationship data is documented in `docs/RECIPE_RELATIONSHIPS.md` and separates human-facing `details` from structured `relationships`.
- Pairings are manual curated recipe slug links in `relationships.goesWellWith`; reverse links are not automatically created.
- Reference quantity metadata is documented in `docs/REFERENCE_QUANTITY.md` and is used for gram-based pantry staples that need cup or spoon guidance.
- Preparation and cooking steps reference ingredient IDs so quantities remain consistent across the full recipe and Cooking Mode.
- Scaling metadata identifies the base ingredient, base quantity, base unit, and whether the recipe uses preset options or exact quantity input.
- Scaling `baseIngredient`, when present, must match exactly one ingredient ID in the recipe.
- `baseIngredient`, `baseQuantity`, and `baseUnit` are required only when `scaling.inputMode` is `quantity`.
- Display-text-only ingredients must be non-scalable so fixed/manual ingredient wording does not accidentally enter the scaling engine.
- Scalable count-based ingredients with `roundingType: "large-produce"` must include positive `weightGrams` for practical gram guidance.

## Recipe Relationships

Recipe relationships separate display metadata from discovery data.

```text
details = human-facing recipe metadata
relationships = structured discovery, filtering, and pairing metadata
```

Current structure:

```json
"details": {
  "Cuisine": "South Indian · Karnataka",
  "Status": "Finalized"
},
"relationships": {
  "mealTypes": ["Lunch", "Dinner"],
  "dishTypes": ["Rice", "Bath", "One Pot"],
  "goesWellWith": []
}
```

Homepage cards intentionally show a compact subset: Cuisine, Meal Type, primary Dish Type, and base quantity. Homepage Meal Type filters use `relationships.mealTypes`. Recipe pages show the full details, including all dish types, generated base quantity, and curated Pairings recipe links when pairings exist.

`One Pot` means the rice or main ingredient cooks directly with the masala in the same vessel. Recipes where rice is cooked separately, cooled/rested, and then mixed into masala are not tagged as `One Pot`.

`relationships.goesWellWith` is manual and curated. Non-reciprocal pairings produce warnings, not errors, so intentionally one-way pairings remain possible.

This model supports richer homepage cards, meal and dish filters, search, and curated recipe pairings. See `docs/RECIPE_RELATIONSHIPS.md` before adding or changing relationship fields.

## UI Theme Standard

UI styling rules for colors, pills, chips, buttons, shadows, touch behavior, and light/dark mode are documented in `docs/UI_THEME_STANDARD.md`.

Review this document before making UI polish changes so the design does not drift from the established warm cookbook theme.

## Social Preview

The homepage includes Open Graph and Twitter card metadata for large link previews.

- Preview image: `icons/social-preview.png`
- Canonical preview URL: `https://2harsharaj.github.io/shukudu-kitchen/icons/social-preview.png`
- Description: `Recipes refined through real cooking.`

The social preview image is site-level branding and is separate from future recipe images.

## Recipe Scaling

Rice-based recipes use rice cup quantities as the canonical scaling base.

```text
1 standard cup = 0.75 rice cup
```

Example display:

```text
1 rice cup rice (1⅓ standard cups)
2 rice cups water (2⅔ standard cups)
```

Rice recipes must keep `scaling.baseUnit` as `riceCup`. Rice and water ingredients use `unit: "rice cup"` when present.

Rice recipes may show rice quantities in the scale controls. Preset buttons may use compact `cup/cups` labels to reduce layout width, while the current selected value remains fully descriptive as `rice cup/rice cups`.

Suitable non-rice recipes may use generic multiplier controls or exact base-ingredient quantity input.

## Validation

The GitHub Actions workflow is named **Validate Recipes** and runs:

```text
node scripts/validate-recipes.js
node scripts/validate-produce-weights.js
node scripts/validate-search.js
node scripts/validate-recipe-pairings.js
node scripts/validate-theme.js
```

The pairing validator fails only for missing pairing slugs. Non-reciprocal pairings are warnings.

The theme validator enforces objective theme guardrails such as required theme documentation, known CSS files, CSS asset versions, approved hardcoded-color locations, approved shadow locations, and required dark-mode overrides for key pill families.
