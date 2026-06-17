# Shukudu Kitchen

Recipes refined through real cooking.

## Current Version

`v1.9.1`

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
- Automated recipe validation through GitHub Actions
- Node.js 24 validation pipeline
- Light and dark themes with device-theme fallback
- Saved theme preference across the homepage, recipe pages, and Cooking Mode
- Header-level theme controls with compact circular controls on mobile

## Project Structure

```text
shukudu-kitchen/
├─ data/
│  ├─ recipe-index.json
│  └─ recipes/
├─ docs/
├─ scripts/
│  └─ validate-recipes.js
├─ .github/
│  └─ workflows/
│     └─ validate-recipes.yml
├─ index.html
├─ recipe.html
├─ script.js
├─ recipe.js
├─ recipe-scaling.js
├─ recipe-scaling.css
├─ theme.js
├─ theme.css
├─ theme-toggle-fix.css
├─ style.css
└─ CHANGELOG.md
```

## Recipe Storage

- Homepage metadata is stored in `data/recipe-index.json`.
- Full recipes are stored individually under `data/recipes/`.
- Scalable recipes use structured ingredient objects with stable IDs.
- Preparation and cooking steps reference those ingredient IDs so quantities remain consistent across the full recipe and Cooking Mode.
- Scaling metadata identifies the base ingredient, base quantity, base unit, and whether the recipe uses preset options or exact quantity input.

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

This is intended for recipes with one clear dominant ingredient, such as a single-vegetable palya. Mixed-vegetable recipes use this mode only when the entered quantity represents a defined total vegetable mix.

## Validation

Recipe data is automatically validated through GitHub Actions.

Validator checks:

- JSON validity
- Required fields
- Ingredient references
- Duplicate ingredient IDs
- Quantity-input metadata
- Exact `baseIngredient` matching
- Ingredient-group structure
- Unit standardization
- Structured measured-water references

Workflow:

- `.github/workflows/validate-recipes.yml`
- `scripts/validate-recipes.js`
- Node.js 24
- `actions/checkout@v6`
- `actions/setup-node@v6`

New recipes and recipe updates should pass validation before being committed.

## Theme Behaviour

- The first visit follows the device light or dark preference.
- Manual theme selection is stored in `localStorage` under `shukudu-theme`.
- The selected theme is reused across the homepage and recipe pages.
- Cooking Mode inherits the active theme and does not show a separate toggle.
- Desktop controls use a stable fixed width so the button does not resize between `Dark` and `Light`.
- Mobile controls use a fixed circular icon button.

## Documentation

- `docs/ARCHITECTURE.md` — application structure and responsibilities
- `docs/RECIPE_DATA_STANDARD.md` — recipe JSON authoring rules
- `docs/BASE_INGREDIENT_SCALING.md` — exact base-ingredient quantity scaling design and boundaries
- `docs/INGREDIENT_REFERENCE.md` — default ingredient weights and rounding guidance
- `docs/FEATURE_ROADMAP.md` — completed and planned functionality
- `CHANGELOG.md` — release history

## Hosting

The site is designed for GitHub Pages and does not require a backend, framework, or paid hosting service.
