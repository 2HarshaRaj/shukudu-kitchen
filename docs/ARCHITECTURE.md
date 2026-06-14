# Shukudu Kitchen Architecture

## Repository Structure

```text
shukudu-kitchen/
├─ data/
│  ├─ recipe-index.json
│  └─ recipes/
│     ├─ tomato-bath.json
│     ├─ vangi-bath.json
│     └─ curd-rice.json
├─ index.html
├─ recipe.html
├─ script.js
├─ recipe.js
├─ recipe-scaling.js
├─ style.css
├─ CHANGELOG.md
└─ docs/
```

## File Responsibilities

- `index.html`: homepage structure
- `script.js`: loads recipe metadata, search, filters, and cards
- `recipe.html`: shell for individual recipe pages and loads both recipe scripts
- `recipe.js`: core recipe-page engine, including:
  - recipe loading and rendering
  - ingredient checklists
  - sticky section navigation
  - Cooking Mode
  - step completion and progress persistence
  - generic scalable ingredient formatting
  - generic scale selector behaviour
  - practical count rounding
  - gram-weight formatting
  - ingredient references inside Preparation, Cooking Method, and Cooking Mode
- `recipe-scaling.js`: scaling-display extension layer, including:
  - rice-cup-first display formatting
  - automatic standard cup equivalents
  - backward compatibility for legacy `riceCupEquivalent` data
  - recipe-aware scale labels
  - rice quantity controls for rice-cup-based recipes
  - generic multiplier controls for non-rice recipes
- `style.css`: site styling and responsive behaviour, including scale controls and mobile Cooking Mode
- `data/recipe-index.json`: lightweight homepage metadata
- `data/recipes/<slug>.json`: complete data for one recipe
- `docs/RECIPE_DATA_STANDARD.md`: recipe JSON authoring rules and scaling schema
- `docs/INGREDIENT_REFERENCE.md`: default common ingredient weights and rounding guidance
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
recipe.html?slug=tomato-bath
→ recipe.js
→ recipe-scaling.js
→ data/recipes/tomato-bath.json
→ ingredient map and formatter
→ rendered recipe page and Cooking Mode
```

`recipe.js` provides the core rendering and scaling functions. `recipe-scaling.js` extends the display layer after `recipe.js` loads so recipe-specific scale labels and cup equivalents can be added without duplicating the full recipe engine.

## Scaling Flow

For recipes with scaling enabled:

```text
recipe JSON base quantities at 1×
→ selected scale from localStorage or recipe default
→ recipe.js quantity and rounding functions
→ recipe-scaling.js recipe-aware labels and cup display
→ Ingredients
→ Preparation
→ Cooking Method
→ Cooking Mode
```

The same ingredient object is referenced by stable ingredient IDs so all recipe sections display matching quantities.

Example:

```text
tomatoes ingredient object
→ Ingredients checklist
→ Preparation bullet
→ Cooking Method bullet
→ Cooking Mode bullet
```

## Rice Recipe Scaling Architecture

### Canonical Base

Rice-based recipes use **rice cup quantities as the canonical scaling base**.

New rice recipes should generally default to **1 rice cup** as the base quantity, unless another rice-cup quantity better represents the finalized recipe.

The recipe must store its scaling base explicitly.

Example:

```json
"scaling": {
  "baseIngredient": "rice",
  "baseQuantity": 1,
  "baseUnit": "riceCup"
}
```

The scaling engine uses this metadata to calculate the scale factor. It must not infer the base from display text or ingredient order.

### Scope

This approach applies to:

- rice quantities
- rice-cooking water quantities

Other ingredients continue to use their natural units, such as:

- grams
- counts
- teaspoons
- tablespoons
- other recipe-specific units

### Standard Cup Display

Standard cup values are derived display equivalents rather than the internal scaling basis.

The conversion rule is:

```text
1 standard cup = 0.75 rice cup
```

Example display:

```text
Rice – 1 rice cup (1⅓ standard cups)
Water – 2 rice cups (2⅔ standard cups)
```

This keeps recipes practical for the primary cooking workflow while making public recipe links understandable to readers who use standard cups.

### Recipe-Aware Scale Controls

The scaling engine remains generic and continues to store multiplier values such as `0.5`, `1`, and `1.25`.

The visible control labels depend on recipe metadata:

- rice-cup-based recipes show the derived rice quantity
- non-rice recipes show generic multiplier labels

Example for a rice recipe with a 1 rice cup base:

```text
0.5 rice cup
0.75 rice cup
1 rice cup
1.25 rice cups
```

Example for a non-rice recipe:

```text
0.5×
0.75×
1×
1.25×
```

The visible rice quantity is always calculated as:

```text
baseQuantity × selected scale
```

### Future Extensibility

A future enhancement may allow users to enter a desired rice quantity in standard cups.

The input layer would:

1. Convert the standard cup input to rice cups.
2. Calculate the scale factor against the stored rice-cup base.
3. Reuse the existing scaling engine for all ingredients.
4. Render the result in the selected display format.

Because the canonical base and unit are stored explicitly, this is an enhancement to the current model rather than a replacement architecture.

## Add a New Recipe

1. Create `data/recipes/<slug>.json`.
2. Add one metadata entry to `data/recipe-index.json`.
3. Keep the filename and internal `slug` identical.
4. Follow `docs/RECIPE_DATA_STANDARD.md`.
5. Use `docs/INGREDIENT_REFERENCE.md` for default common weights where relevant.
6. Test the page using `recipe.html?slug=<slug>`.
7. Test the full recipe page and Cooking Mode.
8. When scaling is enabled, test every supported scale.

Example slug:

```text
lemon-rice
```

## Update an Existing Recipe

Edit only its individual file, for example:

```text
data/recipes/tomato-bath.json
```

Update `data/recipe-index.json` only when the recipe name, slug, category, or summary changes.

## Slug Rules

Use lowercase letters, numbers, and hyphens only.

Valid:

```text
tomato-bath
bisi-bele-bath
```

## Recipe Data Shape

Each recipe file contains:

- name
- slug
- category
- summary
- details
- optional scaling configuration
- ingredients
- preparation
- cookingMethod
- servingSuggestions
- notes

Scalable recipes use structured ingredient objects with stable IDs. Preparation and cooking steps reference those IDs through `ingredientIds`.

## Browser Storage

Per-recipe state is stored with these keys:

```text
shukudu-kitchen:<slug>:ingredients
shukudu-kitchen:<slug>:cooking-step
shukudu-kitchen:<slug>:completed-steps
shukudu-kitchen:<slug>:scale
```

Purpose:

- `ingredients`: checked ingredient state
- `cooking-step`: current Cooking Mode step
- `completed-steps`: completed Cooking Mode steps
- `scale`: last selected recipe scale

## Scaling Responsibilities

### Recipe JSON

The recipe file defines:

- base quantities at 1×
- whether scaling is enabled
- available scale options
- whether each ingredient is scalable
- count labels, units, gram weights, and rounding types
- ingredient IDs referenced by steps
- explicit scaling base metadata for rice-based recipes

### `recipe.js`

The core renderer is responsible for:

- multiplying scalable quantities
- preserving non-scalable wording
- formatting readable fractions
- applying practical count rounding
- scaling and rounding gram weights
- ensuring all recipe sections use the same formatted ingredient value
- loading, saving, and applying the selected scale

### `recipe-scaling.js`

The scaling display extension is responsible for:

- converting rice cup quantities to standard cup equivalents for display
- showing rice cup first for rice-based recipes
- preserving compatibility with legacy standard-cup-first recipe data during migration
- identifying whether a recipe uses a rice-cup scaling base
- showing rice quantity labels for rice-based recipes
- retaining multiplier labels for non-rice recipes

### Non-Scaling Values

Unless explicitly configured otherwise, these remain unchanged:

- cooking time
- soaking time
- temperature
- induction wattage
- pressure-cooking duration
- natural-release instructions
- doneness descriptions

## Maintenance Rules

- Keep one recipe per JSON file
- Keep the recipe index lightweight
- Do not reintroduce a combined recipe data file
- Ensure every index slug has a matching recipe file
- Use stable ingredient IDs for scalable recipes
- Keep ingredient quantities consistent through ingredient references
- Use recipe-specific measurements before default reference weights
- Store explicit rice scaling metadata for scalable rice recipes
- Keep `recipe.js` as the core engine and `recipe-scaling.js` limited to scaling-display extensions
- Load `recipe-scaling.js` after `recipe.js`
- Update the changelog for notable changes
- Update the website footer when the release version changes
- Test the homepage and recipe pages after structural changes
- Test Cooking Mode after changes to steps or ingredient formatting
- Test rice-based and non-rice scale labels after changes to scaling controls
- Test all supported scales after changes to scaling or rounding logic
