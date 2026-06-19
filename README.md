# Shukudu Kitchen

Recipes refined through real cooking.

## Current Version

`v1.12.3`

## Overview

Shukudu Kitchen is a lightweight public recipe website built with HTML, CSS, JavaScript, and JSON. It is designed as a practical cooking-ready cookbook rather than a static archive of copied recipes.

Recipes are adapted to match real kitchen use, including:

- rice-cup-first scaling for rice recipes
- exact base-ingredient quantity scaling for supported recipes
- automatic standard cup equivalents for public readability
- practical ingredient rounding
- gram guidance for vegetables and other ingredients
- structured preparation and cooking steps
- mobile-friendly Cooking Mode
- saved light and dark themes for comfortable kitchen use
- installable Progressive Web App support
- app-style branding and dynamic browser theme-color handling

## Main Features

- Recipe cards with search and category filters
- One JSON file per recipe
- Ingredient checklists with saved progress
- Sticky section navigation
- Cooking Mode with step tracking
- Scalable ingredients with per-recipe persistence
- Recipe-aware scale controls
- Rice-cup-first display for rice recipes
- Generic multiplier display for suitable non-rice recipes
- Exact base-ingredient quantity input for supported recipes
- Automatic conversion of an entered base quantity into an arbitrary recipe scale
- Persistence of entered quantities and calculated scales per recipe
- Recipe-specific non-linear scaling overrides
- Explicit rounding behavior for scalable ingredients
- Config-driven non-linear ingredient validation
- Automated recipe validation through GitHub Actions
- Node.js 24 validation pipeline
- Recipe-index, slug, metadata, step-structure, notes, scaling base ingredient, scalingMode, roundingType, displayText safety, non-linear config uniqueness, and non-linear override validation
- Light and dark themes with device-theme fallback
- Saved theme preference across the homepage, recipe pages, and Cooking Mode
- Header-level theme controls with compact circular controls on mobile
- PWA manifest with standalone display mode
- App icons, favicons, and Apple touch icon support
- Brand icon on the homepage and recipe pages
- Dynamic theme-color updates for Android/PWA status bar integration

## Project Structure

```text
shukudu-kitchen/
├─ data/
│  ├─ recipe-index.json
│  ├─ recipes/
│  └─ validation/
│     └─ non-linear-ingredients.json
├─ docs/
├─ icons/
├─ scripts/
│  └─ validate-recipes.js
├─ .github/
│  └─ workflows/
│     └─ validate-recipes.yml
├─ index.html
├─ recipe.html
├─ manifest.webmanifest
├─ script.js
├─ recipe.js
├─ recipe-scaling.js
├─ recipe-scaling.css
├─ theme.js
├─ theme.css
├─ theme-toggle-fix.css
├─ brand.css
├─ style.css
└─ CHANGELOG.md
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
- Scalable recipes use structured ingredient objects with stable IDs.
- Preparation and cooking steps reference those ingredient IDs so quantities remain consistent across the full recipe and Cooking Mode.
- Scaling metadata identifies the base ingredient, base quantity, base unit, and whether the recipe uses preset options or exact quantity input.
- Scaling `baseIngredient`, when present, must match exactly one ingredient ID in the recipe.
- Display-text-only ingredients must be non-scalable so fixed/manual ingredient wording does not accidentally enter the scaling engine.

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

Rice recipes may show rice quantities in the scale controls. Suitable non-rice recipes may use generic multiplier controls or exact base-ingredient quantity input.

For exact quantity input, the engine calculates:

```text
selected scale = entered quantity ÷ base quantity
```
