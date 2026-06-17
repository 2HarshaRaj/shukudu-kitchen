# Shukudu Kitchen Architecture

## Repository Structure

```text
shukudu-kitchen/
|- data/
|  |- recipe-index.json
|  `- recipes/
|- docs/
|- scripts/
|  `- validate-recipes.js
|- .github/
|  `- workflows/
|     `- validate-recipes.yml
|- index.html
|- recipe.html
|- script.js
|- recipe.js
|- recipe-scaling.js
|- recipe-scaling.css
|- theme.js
|- theme.css
|- theme-toggle-fix.css
|- style.css
`- CHANGELOG.md
```

## Main Responsibilities

- `index.html`: homepage layout and homepage theme-control host
- `recipe.html`: recipe-page shell, recipe top bar, and recipe theme-control host
- `script.js`: homepage search, filters, and recipe cards
- `recipe.js`: recipe rendering, ingredient checklist, and Cooking Mode
- `recipe-scaling.js`: recipe scaling, exact quantity input, overrides, and formatting
- `recipe-scaling.css`: scaling-control layout and responsive styling
- `theme.js`: theme selection, saved preference, and toggle behaviour
- `theme.css`: light and dark theme tokens and dark component overrides
- `theme-toggle-fix.css`: theme-control placement, sizing, spacing, and theme-specific surfaces
- `style.css`: shared site layout and Cooking Mode styling
- `scripts/validate-recipes.js`: recipe JSON validation and schema guardrails
- `.github/workflows/validate-recipes.yml`: GitHub Actions workflow that runs recipe validation on push

## Page Loading

Homepage:

```text
index.html
-> style.css
-> theme.css
-> theme-toggle-fix.css
-> theme.js
-> script.js
-> data/recipe-index.json
```

Recipe page:

```text
recipe.html
-> style.css
-> recipe-scaling.css
-> theme.css
-> theme-toggle-fix.css
-> theme.js
-> recipe.js
-> recipe-scaling.js
-> data/recipes/<slug>.json
```

`recipe.js` must load before `recipe-scaling.js`.

## Theme Architecture

The active theme is resolved in this order:

1. Read the saved `shukudu-theme` value.
2. When no saved value exists, follow the device theme preference.
3. Apply either light or dark theme to the root document element.

The selected theme is saved for future visits and applies across the homepage, recipe pages, and Cooking Mode.

Theme controls are placed in the page layout rather than floating over the page:

- homepage: top-right inside the main header
- recipe page: beside the Back to recipes link
- Cooking Mode: no separate toggle

Desktop controls use a fixed 92 px width so the button does not resize between labels. Mobile controls use a fixed 44 px circular icon-only button.

Light mode uses a light button surface. Dark mode uses a dark button surface.

## Recipe Data Architecture

Each recipe is stored independently under:

```text
data/recipes/<slug>.json
```

Scalable recipes use structured ingredient objects, stable IDs, recipe-level scaling metadata, and shared ingredient references across Ingredients, Preparation, Cooking Method, and Cooking Mode.

Ingredient groups must use `section` and `items`. Legacy `category` is not allowed inside ingredient groups.

Measured water used in cooking steps should be stored as a structured ingredient and referenced through `ingredientIds` instead of being hard-coded in step text.

## Scaling Flow

```text
base recipe quantities
-> preset or exact base quantity
-> calculated scale
-> optional recipe override
-> unit-aware formatting
-> recipe page and Cooking Mode
```

For normal scaling:

```text
effective quantity = base quantity x selected scale
```

For exact base-ingredient quantity input:

```text
selected scale = entered quantity / base quantity
```

Rice recipes use rice cup as the canonical base. Standard cup values are derived for display using:

```text
1 standard cup = 0.75 rice cup
```

Quantity-input recipes must use standard preset options:

```text
[0.5, 0.75, 1, 1.25, 1.5, 2]
```

For gram-based quantity recipes, scaling metadata uses `baseUnit: "g"`.

## Recipe Validation Architecture

Recipe data quality is enforced through GitHub Actions.

Workflow:

```text
.github/workflows/validate-recipes.yml
```

Runtime:

```text
Node.js 24
```

Validation entry point:

```text
node scripts/validate-recipes.js
```

The workflow uses:

- `actions/checkout@v6`
- `actions/setup-node@v6`
- `node-version: '24'`

The workflow runs automatically on pushes that affect:

- `data/recipes/**`
- `scripts/validate-recipes.js`
- `.github/workflows/validate-recipes.yml`

Validator guardrails include:

- JSON parse validation
- required top-level fields
- array validation for `ingredients`, `preparation`, and `cookingMethod`
- duplicate ingredient ID detection
- missing ingredient reference detection
- quantity-input scaling metadata validation
- exact `baseIngredient` to ingredient ID matching
- standard quantity options validation
- ingredient group structure validation
- legacy ingredient-group `category` rejection
- `tsp` / `tbsp` rejection in favour of `teaspoon` / `tablespoon`
- structured measured-water enforcement

## Browser Storage

Per-recipe state:

```text
shukudu-kitchen:<slug>:ingredients
shukudu-kitchen:<slug>:cooking-step
shukudu-kitchen:<slug>:completed-steps
shukudu-kitchen:<slug>:scale
```

Global theme state:

```text
shukudu-theme
```

## Maintenance Rules

- Keep one recipe per JSON file.
- Keep the recipe index lightweight.
- Keep scaling logic in `recipe-scaling.js`.
- Keep exact quantity styling in `recipe-scaling.css`.
- Keep theme behaviour in `theme.js`.
- Keep dark theme styling in `theme.css`.
- Keep theme-control layout rules in `theme-toggle-fix.css`.
- Keep validation rules in `scripts/validate-recipes.js`.
- Run `node scripts/validate-recipes.js` after recipe data changes.
- Test light and dark themes on homepage, recipe pages, and Cooking Mode.
- Test desktop and mobile theme controls.
- Update the changelog and visible versions for releases.
