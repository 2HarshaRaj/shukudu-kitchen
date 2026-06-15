# Shukudu Kitchen Architecture

## Repository Structure

```text
shukudu-kitchen/
├─ data/
│  ├─ recipe-index.json
│  └─ recipes/
├─ docs/
├─ index.html
├─ recipe.html
├─ script.js
├─ recipe.js
├─ recipe-scaling.js
├─ recipe-scaling.css
├─ style.css
└─ CHANGELOG.md
```

## File Responsibilities

- `index.html`: homepage structure
- `script.js`: recipe index loading, search, filters, and cards
- `recipe.html`: recipe-page shell and script/style loading order
- `recipe.js`: core recipe rendering and interaction engine
- `recipe-scaling.js`: scaling, exact quantity input, non-linear overrides, and unit-aware formatting
- `recipe-scaling.css`: styling for recipe-specific scaling controls
- `style.css`: shared responsive styling and Cooking Mode
- `data/recipe-index.json`: lightweight homepage metadata
- `data/recipes/<slug>.json`: full recipe data
- `docs/RECIPE_DATA_STANDARD.md`: recipe authoring and scaling rules
- `docs/INGREDIENT_REFERENCE.md`: default ingredient weights and rounding guidance
- `docs/BASE_INGREDIENT_SCALING.md`: exact base-ingredient scaling guidance
- `docs/FEATURE_ROADMAP.md`: completed and planned functionality

## Homepage Flow

```text
index.html
→ script.js
→ data/recipe-index.json
→ recipe cards
```

## Recipe Page Flow

```text
recipe.html?slug=<slug>
→ style.css
→ recipe-scaling.css
→ recipe.js
→ recipe-scaling.js
→ data/recipes/<slug>.json
→ ingredient map and formatter
→ rendered recipe page and Cooking Mode
```

`recipe.js` must load before `recipe-scaling.js`.

## Recipe Data Architecture

Each recipe is stored independently under:

```text
data/recipes/<slug>.json
```

Scalable recipes use:

- structured ingredient objects
- stable ingredient IDs
- `ingredientIds` inside Preparation and Cooking Method
- recipe-level scaling metadata
- optional recipe-specific quantity overrides

This ensures Ingredients, Preparation, Cooking Method, and Cooking Mode use the same formatted values.

## Core Scaling Flow

```text
recipe JSON base quantities
→ selected preset or exact base-ingredient quantity
→ calculated scale factor
→ recipe-specific override when present
→ unit-aware display formatting
→ practical count and gram formatting
→ Ingredients
→ Preparation
→ Cooking Method
→ Cooking Mode
```

## Default Linear Scaling

For ingredients without a recipe-specific override:

```text
effective quantity = base quantity × selected scale
```

Typical linear ingredients include:

- rice
- rice-cooking water
- curd
- milk
- vegetables by weight
- measured powders and liquids when appropriate

## Base-Ingredient Quantity Scaling

A recipe with one clear scaling ingredient may allow the user to enter the exact quantity available.

Example:

```json
"scaling": {
  "enabled": true,
  "baseIngredient": "raw-banana",
  "baseQuantity": 500,
  "baseUnit": "g",
  "baseScale": 1,
  "inputMode": "quantity",
  "inputLabel": "Raw banana quantity",
  "inputMin": 1,
  "inputStep": 1,
  "options": [0.5, 0.75, 1, 1.25, 1.5, 2]
}
```

The engine calculates:

```text
selected scale = entered quantity ÷ baseQuantity
```

Example:

```text
300 g ÷ 500 g = 0.6×
```

The resulting scale reuses the existing scaling, overrides, formatting, persistence, and Cooking Mode behaviour.

### Presets and Exact Input

Quantity-input recipes may show both:

- preset buttons for common quantities
- an exact input for the quantity actually available

For a 500 g base, the standard preset multipliers display as:

```text
250 g, 375 g, 500 g, 625 g, 750 g, 1,000 g
```

An entered value such as 300 g creates an arbitrary scale such as `0.6×`.

### Appropriate Use

Use exact base-ingredient input when:

- one ingredient clearly drives recipe size
- the recipe composition stays the same
- supporting ingredients can reasonably scale from that quantity

Examples:

- raw banana palya by raw banana weight
- beans palya by beans weight
- tomato-based recipes by tomato weight when explicitly designed that way
- mixed-vegetable recipes by total weight only when proportions stay broadly similar

Do not use automatic scaling to decide:

- substitutions
- missing vegetables
- major proportion changes
- which vegetable should dominate
- method changes caused by a different vegetable mix

Those are recipe-composition decisions and should be handled separately.

## Rice Recipe Scaling Architecture

### Canonical Base

Rice-based recipes use rice cup quantities as the canonical scaling base.

```json
"scaling": {
  "enabled": true,
  "baseIngredient": "rice",
  "baseQuantity": 1,
  "baseUnit": "riceCup",
  "baseScale": 1,
  "options": [0.5, 0.75, 1, 1.25, 1.5, 2]
}
```

New recipes generally use a 1 rice cup base, but another practical rice-cup base is allowed.

### Standard Cup Display

```text
1 standard cup = 0.75 rice cup
```

Rice and rice-cooking water display rice cup first, with standard cup equivalents derived automatically.

### Recipe-Aware Scale Controls

The engine stores multiplier values internally.

For rice recipes, the visible label is:

```text
baseQuantity × selected scale
```

For quantity-input recipes, the visible label is:

```text
baseQuantity × selected scale, shown in baseUnit
```

For other recipes, the UI shows generic multipliers.

## Non-Linear Ingredient Scaling

Some flavour and tempering ingredients should not scale directly with the recipe multiplier.

Examples:

- green chilli
- mustard seeds
- urad dal
- curry leaves
- ginger
- coriander
- lemon
- strong spice blends

These ingredients may define recipe-specific `scaleQuantities`.

```json
"scaleQuantities": {
  "1": 1,
  "2": 1,
  "3": 1.5,
  "4": 2,
  "5": 2
}
```

Resolution:

```text
if scaleQuantities[selected scale] exists
→ use the override quantity
otherwise
→ use base quantity × selected scale
```

Override keys should normally cover every recipe-level scale option. Overrides remain recipe-specific rather than global.

For arbitrary quantity-derived scales, an exact override usually will not exist, so the engine falls back to linear scaling unless the recipe is redesigned with a supported discrete option.

## Unit-Aware Quantity Formatting

- Cup units preserve the calculated quantity; familiar quarter fractions are used when exact, otherwise short decimals are shown.
- Teaspoons and tablespoons display to the nearest ¼ spoon.
- Inch values display to the nearest ¼ inch.
- Produce counts use practical rounding.
- Grams remain the precise produce guide.

Formatting changes presentation only, not stored values or scale calculations.

## Scaling Responsibilities

### Recipe JSON

The recipe file defines:

- base quantities
- whether scaling is enabled
- supported preset options
- base ingredient, quantity, and unit
- optional `inputMode`, `inputLabel`, `inputMin`, and `inputStep`
- whether each ingredient is scalable
- optional `scaleQuantities`
- count labels, units, gram weights, and rounding rules
- stable ingredient IDs

### `recipe.js`

The core engine handles:

- recipe loading
- ingredient maps
- generic rendering
- practical produce rounding
- gram formatting
- ingredient checklists
- Cooking Mode
- progress persistence
- scale persistence

### `recipe-scaling.js`

The extension layer handles:

- rice-cup-first display
- standard cup equivalents
- recipe-aware scale labels
- exact base-ingredient quantity input
- quantity-to-scale conversion
- arbitrary positive scale persistence for quantity-input recipes
- non-linear `scaleQuantities` lookup
- fallback to linear scaling
- cup-specific decimal and fraction display
- quarter-spoon display snapping
- quarter-inch display snapping

### `recipe-scaling.css`

The scaling stylesheet handles:

- exact quantity form layout
- input, unit, and Apply button styling
- mobile stacking and responsive width behaviour

## Browser Storage

Per-recipe state uses:

```text
shukudu-kitchen:<slug>:ingredients
shukudu-kitchen:<slug>:cooking-step
shukudu-kitchen:<slug>:completed-steps
shukudu-kitchen:<slug>:scale
```

The scale key stores either:

- a preset multiplier
- an arbitrary positive multiplier calculated from exact quantity input

## Non-Scaling Values

Unless explicitly designed otherwise, these do not scale:

- cooking time
- soaking time
- temperature
- induction wattage
- pressure-cooking duration
- natural-release instructions
- subjective doneness descriptions

## Add or Update a Recipe

1. Create or update `data/recipes/<slug>.json`.
2. Keep the filename and internal slug identical.
3. Update `data/recipe-index.json` only when homepage metadata changes.
4. Follow `docs/RECIPE_DATA_STANDARD.md`.
5. Use `docs/INGREDIENT_REFERENCE.md` where relevant.
6. Use exact quantity input only when one quantity reliably drives the recipe.
7. Test preset buttons.
8. Test exact quantity input where enabled.
9. Test page refresh persistence.
10. Test the full recipe page and Cooking Mode.
11. Verify overrides and unit-aware formatting.

## Maintenance Rules

- Keep one recipe per JSON file.
- Keep the recipe index lightweight.
- Use structured ingredients for scalable recipes.
- Use stable ingredient IDs.
- Keep quantities synchronized through ingredient references.
- Store explicit base-ingredient scaling metadata.
- Keep composition changes outside automatic scaling.
- Keep non-linear overrides recipe-specific.
- Avoid partial override maps unless fallback is intentional.
- Keep scaling logic centralized in `recipe-scaling.js`.
- Keep exact quantity styling in `recipe-scaling.css`.
- Load `recipe-scaling.css` and `recipe-scaling.js` on recipe pages.
- Do not snap cup calculations to practical fractions.
- Update the changelog for notable changes.
- Update visible website versions for releases.
- Test preset, exact-input, rice, and generic scale controls.
