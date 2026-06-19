# Shukudu Kitchen Architecture

## Repository Structure

```text
shukudu-kitchen/
|- data/
|  |- recipe-index.json
|  |- recipes/
|  `- validation/
|     `- non-linear-ingredients.json
|- docs/
|- icons/
|- scripts/
|  `- validate-recipes.js
|- .github/
|  `- workflows/
|     `- validate-recipes.yml
|- index.html
|- recipe.html
|- manifest.webmanifest
|- script.js
|- recipe.js
|- recipe-scaling.js
|- recipe-scaling.css
|- theme.js
|- theme.css
|- theme-toggle-fix.css
|- brand.css
|- style.css
`- CHANGELOG.md
```

## Main Responsibilities

- `index.html`: homepage layout, homepage theme-control host, PWA metadata, and brand header structure
- `recipe.html`: recipe-page shell, recipe top bar, PWA metadata, and recipe theme-control host
- `manifest.webmanifest`: installable app metadata, app name, start URL, display mode, theme color, and app icons
- `script.js`: homepage search, filters, and recipe cards
- `recipe.js`: recipe rendering, ingredient checklist, and Cooking Mode
- `recipe-scaling.js`: recipe scaling, exact quantity input, overrides, and formatting
- `recipe-scaling.css`: scaling-control layout and responsive styling
- `theme.js`: theme selection, saved preference, toggle behaviour, and dynamic browser theme-color updates
- `theme.css`: light and dark theme tokens and dark component overrides
- `theme-toggle-fix.css`: theme-control placement, sizing, spacing, and theme-specific surfaces
- `brand.css`: brand icon layout, homepage responsive branding, and recipe back-link icon sizing
- `style.css`: shared site layout and Cooking Mode styling
- `icons/`: install icons, favicons, and Apple touch icon assets
- `data/validation/non-linear-ingredients.json`: config list of ingredients that require recipe-specific non-linear scaling overrides when scalable
- `scripts/validate-recipes.js`: recipe JSON, index, slug, metadata, step, notes, scaling, rounding, non-linear override, scaling-mode consistency, and schema guardrails
- `.github/workflows/validate-recipes.yml`: GitHub Actions workflow that runs recipe validation on push

## Page Loading

Homepage:

```text
index.html
-> style.css
-> brand.css
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
-> brand.css
-> recipe-scaling.css
-> theme.css
-> theme-toggle-fix.css
-> theme.js
-> recipe.js
-> recipe-scaling.js
-> data/recipes/<slug>.json
```

`recipe.js` must load before `recipe-scaling.js`.

## PWA Architecture

Shukudu Kitchen includes a Progressive Web App foundation through `manifest.webmanifest` and page-level metadata.

The manifest defines:

- app name: `Shukudu Kitchen`
- short name: `Shukudu Kitchen`
- start URL: `/shukudu-kitchen/`
- scope: `/shukudu-kitchen/`
- display mode: `standalone`
- background color
- default theme color
- 192 px and 512 px install icons

Both `index.html` and `recipe.html` include:

- manifest link
- theme-color metadata
- Apple touch icon link
- favicon links

The PWA foundation currently supports installability and app-style launch behaviour. Offline support is intentionally deferred until a future Service Worker phase.

## Branding Architecture

Brand icon layout is handled through `brand.css`.

Homepage:

- desktop keeps the app icon beside the title block
- mobile stacks the app icon above the title block so the heading keeps full width
- icon asset: `icons/icon-192.png`

Recipe page:

- the app icon appears as a small visual marker beside `Back to recipes`
- the icon is intentionally smaller than the homepage icon so it does not compete with the recipe title
- icon asset: `icons/icon-192.png`

Favicons and install icons are stored under `icons/`.

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

`theme.js` also updates the browser `theme-color` metadata when the user changes theme. This allows supported Android browsers and installed PWAs to visually blend the status bar with the current page and selected theme.

Theme-color behaviour:

- homepage: uses the warm brand/header colour in both light and dark mode
- recipe page: uses the light page background in light mode and the dark page background in dark mode

## Recipe Data Architecture

Each recipe is stored independently under:

```text
data/recipes/<slug>.json
```

The recipe slug is the stable identity used across the recipe index, JSON file, URL, and recipe page. The file name must match the slug exactly:

```text
data/recipes/<slug>.json
```

`data/recipe-index.json` is the lightweight homepage source. It must list every recipe file and keep `name`, `category`, and `summary` synchronized with the recipe JSON.

Validation reference data is stored under:

```text
data/validation/
```

`data/validation/non-linear-ingredients.json` is the source list for ingredients that should not rely on blind linear scaling when `scalable: true`.

Scalable recipes use structured ingredient objects, stable IDs, recipe-level scaling metadata, and shared ingredient references across Ingredients, Preparation, Cooking Method, and Cooking Mode.

Scalable ingredients with a `quantity` must define `roundingType`. This makes each ingredient's display behaviour explicit before scaling and prevents the renderer from guessing whether to preserve exact values, round small whole counts, or apply large-produce guidance.

Ingredient groups must use `section` and `items`. Legacy `category` is not allowed inside ingredient groups.

Measured water used in cooking steps should be stored as a structured ingredient and referenced through `ingredientIds` instead of being hard-coded in step text.

Preparation and cooking steps support two shapes:

```json
{ "text": "Plain instruction." }
```

```json
{ "lead": "Add:", "ingredientIds": ["ingredient-id"], "after": "Cook briefly." }
```

Structured ingredient steps must use `lead` and `ingredientIds` together.

Recipe metadata under `details` must include non-empty `Cuisine`, `Meal Type`, and `Status`. `servingSuggestions` and `notes` must be arrays of non-empty strings when present.

## Scaling Flow

```text
base recipe quantities
-> preset or exact base quantity
-> calculated scale
-> optional recipe override
-> roundingType-aware unit formatting
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

## Rounding and Formatting Architecture

`roundingType` records the intended display behavior for scalable ingredients with quantities.

Allowed values:

- `exact`: preserve the calculated value and use unit-aware formatting, suitable for rice cups, cups, teaspoons, tablespoons, grams, liquids, powders, and other measured ingredients
- `small-whole`: use practical count handling for small whole ingredients such as green chilli, curry leaves, cloves, bay leaf, garlic cloves, and dry red chilli
- `large-produce`: use practical count or gram guidance for larger produce such as onion, tomato, potato, carrot, capsicum, brinjal, beans, and raw banana

The validator requires `roundingType` whenever `scalable: true` and `quantity` is present. Display-text-only fixed ingredients and non-scalable ingredients do not require it.

## Non-Linear Scaling Architecture

Most scalable ingredients use direct linear scaling.

Some ingredients use recipe-specific `scaleQuantities` because taste, heat, sourness, aroma, or tempering balance does not scale cleanly in direct proportion.

Examples include:

- green chilli
- mustard seeds
- urad dal
- chana dal
- curry leaves
- ginger
- coriander leaves
- lemon
- strong masala powders

Runtime scaling logic stays recipe-specific:

```text
selected scale
-> if scaleQuantities has selected scale key, use override value
-> otherwise use base quantity x selected scale
```

The validator uses `data/validation/non-linear-ingredients.json` only as a data-quality guardrail. It does not globally calculate runtime quantities. Recipe JSON remains the runtime source of truth for final displayed quantities.

`scalingMode` may be used when a recipe needs explicit intent:

- `scalingMode: "linear"` skips automatic non-linear config matching and must not define `scaleQuantities`
- `scalingMode: "non-linear"` requires `scaleQuantities`
- missing `scalingMode` uses config matching from `data/validation/non-linear-ingredients.json`

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

- `data/recipe-index.json`
- `data/recipes/**`
- `data/validation/**`
- `scripts/validate-recipes.js`
- `.github/workflows/validate-recipes.yml`

Validator guardrails include:

- JSON parse validation
- required top-level fields
- array validation for `ingredients`, `preparation`, and `cookingMethod`
- recipe-index array validation
- required recipe-index fields: `name`, `slug`, `category`, and `summary`
- duplicate recipe-index slug rejection
- recipe-index to recipe-file cross-checks
- every recipe JSON listed in `data/recipe-index.json`
- index `name`, `category`, and `summary` synchronized with recipe JSON
- slug format validation using `^[a-z0-9]+(-[a-z0-9]+)*$`
- slug to file-name validation using `<slug>.json`
- duplicate ingredient ID detection
- missing ingredient reference detection
- cooking-step structure validation for plain text and structured ingredient steps
- details metadata validation for `Cuisine`, `Meal Type`, and `Status`
- `servingSuggestions` and `notes` array validation
- quantity-input scaling metadata validation
- exact `baseIngredient` to ingredient ID matching
- standard quantity options validation
- ingredient group structure validation
- legacy ingredient-group `category` rejection
- `tsp` / `tbsp` rejection in favour of `teaspoon` / `tablespoon`
- structured measured-water enforcement
- `data/validation/non-linear-ingredients.json` shape validation
- `roundingType` allowed value validation for `exact`, `small-whole`, and `large-produce`
- required `roundingType` validation for scalable ingredients with quantities
- `scalingMode` value validation for `linear` and `non-linear`
- `scalingMode` consistency validation: `linear` must not define `scaleQuantities`, and `non-linear` must define `scaleQuantities`
- `scaleQuantities` object validation against recipe-level `scaling.options`
- required `scaleQuantities` validation for configured non-linear ingredients when `scalable: true`

The validator is complete for the current non-image recipe model. Image metadata validation is deferred until recipe images are introduced.

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
- Keep the recipe index lightweight and synchronized with recipe files.
- Keep validation config under `data/validation/`.
- Keep scaling logic in `recipe-scaling.js`.
- Keep exact quantity styling in `recipe-scaling.css`.
- Keep theme behaviour in `theme.js`.
- Keep dark theme styling in `theme.css`.
- Keep theme-control layout rules in `theme-toggle-fix.css`.
- Keep brand icon layout rules in `brand.css`.
- Keep PWA metadata in `manifest.webmanifest`, `index.html`, and `recipe.html` synchronized.
- Keep validation rules in `scripts/validate-recipes.js`.
- Run `node scripts/validate-recipes.js` after recipe data or validation config changes.
- Test light and dark themes on homepage, recipe pages, and Cooking Mode.
- Test desktop and mobile theme controls.
- Test installability and app icon behaviour after PWA metadata changes.
- Update the changelog and visible versions for releases.
