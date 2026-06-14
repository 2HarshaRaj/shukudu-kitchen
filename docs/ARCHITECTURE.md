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
├─ style.css
├─ CHANGELOG.md
└─ docs/
```

## File Responsibilities

- `index.html`: homepage structure
- `script.js`: loads recipe metadata, search, filters, and cards
- `recipe.html`: shell for individual recipe pages
- `recipe.js`: loads one recipe and controls all recipe-page behaviour, including:
  - recipe rendering
  - ingredient checklists
  - sticky section navigation
  - Cooking Mode
  - step completion and progress persistence
  - scalable ingredient formatting
  - scale selector behaviour
  - practical count rounding
  - gram-weight formatting
  - ingredient references inside Preparation, Cooking Method, and Cooking Mode
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
→ data/recipes/tomato-bath.json
→ ingredient map and formatter
→ rendered recipe page and Cooking Mode
```

## Scaling Flow

For recipes with scaling enabled:

```text
recipe JSON base quantities at 1×
→ selected scale from localStorage or recipe default
→ recipe.js quantity and rounding functions
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

### `recipe.js`

The renderer is responsible for:

- multiplying scalable quantities
- preserving non-scalable wording
- formatting readable fractions
- maintaining standard cup and rice cup equivalents
- applying practical count rounding
- scaling and rounding gram weights
- ensuring all recipe sections use the same formatted ingredient value

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
- Update the changelog for notable changes
- Update the website footer when the release version changes
- Test the homepage and recipe pages after structural changes
- Test Cooking Mode after changes to steps or ingredient formatting
- Test all supported scales after changes to scaling or rounding logic
