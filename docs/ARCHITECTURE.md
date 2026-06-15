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
├─ style.css
└─ CHANGELOG.md
```

## File Responsibilities

- `index.html`: homepage structure
- `script.js`: recipe index loading, search, filters, and cards
- `recipe.html`: individual recipe-page shell and script loading order
- `recipe.js`: core recipe rendering and interaction engine
- `recipe-scaling.js`: scaling extension layer
- `style.css`: responsive styling, scale controls, and Cooking Mode
- `data/recipe-index.json`: lightweight homepage metadata
- `data/recipes/<slug>.json`: full recipe data
- `docs/RECIPE_DATA_STANDARD.md`: recipe authoring and scaling rules
- `docs/INGREDIENT_REFERENCE.md`: default ingredient weights and rounding guidance
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

The recipe index contains only homepage metadata. Full recipe data is loaded only when a recipe page opens.

Scalable recipes use:

- structured ingredient objects
- stable ingredient IDs
- `ingredientIds` inside Preparation and Cooking Method
- recipe-level scaling metadata

This ensures Ingredients, Preparation, Cooking Method, and Cooking Mode use the same formatted values.

## Core Scaling Flow

```text
recipe JSON base quantities
→ recipe-level scaling options
→ selected scale from localStorage or recipe default
→ ingredient effective quantity
→ practical rounding and unit formatting
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

## Rice Recipe Scaling Architecture

### Canonical Base

Rice-based recipes use rice cup quantities as the canonical scaling base.

Required metadata:

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

New recipes generally use a 1 rice cup base, but a different practical base is allowed.

Example: Curd Rice uses a 0.25 rice cup base because that is a useful small portion.

### Standard Cup Display

Conversion rule:

```text
1 standard cup = 0.75 rice cup
```

Rice and rice-cooking water display rice cup first, with the standard cup equivalent derived automatically.

Example:

```text
1 rice cup rice (1⅓ standard cups)
2 rice cups water (2⅔ standard cups)
```

### Recipe-Aware Scale Controls

The engine stores multiplier values internally.

For rice recipes, the visible label is:

```text
baseQuantity × selected scale
```

For non-rice recipes, the UI shows generic multipliers.

Examples:

```text
Rice recipe: ¼ rice cup, ½ rice cup, ¾ rice cup, 1 rice cup
Non-rice recipe: 0.5×, 1×, 1.5×, 2×
```

Each recipe may define practical scale options rather than using one global option list.

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

Example:

```json
{
  "id": "green-chilli",
  "quantity": 1,
  "countLabel": "small green chilli",
  "ingredient": "green chilli",
  "scalable": true,
  "scaleQuantities": {
    "1": 1,
    "2": 1,
    "3": 1.5,
    "4": 2,
    "5": 2
  }
}
```

### Override Resolution

For an ingredient:

```text
if scaleQuantities[selected scale] exists
→ use the override quantity
otherwise
→ use base quantity × selected scale
```

The override keys correspond to values from the recipe-level `scaling.options` array.

Example:

```json
"options": [1, 2, 3, 4, 5]
```

```json
"scaleQuantities": {
  "1": 1,
  "2": 1,
  "3": 1.5,
  "4": 2,
  "5": 2
}
```

At selected scale `4`, the renderer uses the value under key `"4"`.

### Long-Term Rule

`scaleQuantities` remains recipe-specific.

Do not use a global runtime master list for chilli, mustard, curry leaves, or similar ingredients because their correct behaviour depends on the dish.

A shared ingredient reference may provide authoring guidance, but each recipe controls its own runtime quantities.

### Coverage Rule

When `scaleQuantities` is used, it should normally define a value for every supported recipe scale option.

Missing keys fall back to linear scaling. This fallback is intentional for resilience, but partial override maps should be avoided unless deliberately designed.

## Scaling Responsibilities

### Recipe JSON

The recipe file defines:

- base quantities
- whether scaling is enabled
- supported scale options
- rice scaling metadata where applicable
- which ingredients are scalable
- optional `scaleQuantities`
- count labels, units, gram weights, and rounding rules
- stable ingredient IDs

### `recipe.js`

The core engine handles:

- recipe loading
- ingredient maps
- generic scaling
- practical rounding
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
- non-linear `scaleQuantities` lookup
- fallback to linear scaling
- compatibility with legacy cup data during migration

## Browser Storage

Per-recipe state uses:

```text
shukudu-kitchen:<slug>:ingredients
shukudu-kitchen:<slug>:cooking-step
shukudu-kitchen:<slug>:completed-steps
shukudu-kitchen:<slug>:scale
```

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
6. Test the full recipe page.
7. Test Cooking Mode.
8. Test every supported scale.
9. Verify non-linear overrides at every option.

## Maintenance Rules

- Keep one recipe per JSON file.
- Keep the recipe index lightweight.
- Use structured ingredients for scalable recipes.
- Use stable ingredient IDs.
- Keep quantities synchronized through ingredient references.
- Store explicit rice scaling metadata.
- Keep non-linear overrides recipe-specific.
- Ensure `scaleQuantities` keys match recipe scale options.
- Avoid partial override maps unless fallback is intentional.
- Load `recipe-scaling.js` after `recipe.js`.
- Update the changelog for notable changes.
- Update visible website versions for releases.
- Test rice and non-rice scale controls.
- Test every supported scale after scaling changes.
