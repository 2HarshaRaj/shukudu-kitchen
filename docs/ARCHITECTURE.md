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
|  |- validate-recipes.js
|  |- validate-produce-weights.js
|  |- validate-search.js
|  `- validate-recipe-pairings.js
|- .github/
|  `- workflows/
|     `- validate-recipes.yml
|- index.html
|- recipe.html
|- manifest.webmanifest
|- script.js
|- recipe.js
|- recipe-pairings.js
|- recipe-pairings.css
|- recipe-scaling.js
|- recipe-scaling.css
|- homepage-filters.css
|- wake-lock.js
|- wake-lock.css
|- theme.js
|- theme.css
|- theme-toggle-fix.css
|- brand.css
|- style.css
`- CHANGELOG.md
```

## Main Responsibilities

- `index.html`: homepage layout, homepage theme-control host, PWA metadata, and brand header structure
- `recipe.html`: recipe-page shell, recipe top bar, PWA metadata, recipe theme-control host, and wake-lock asset loading
- `manifest.webmanifest`: installable app metadata, app name, start URL, display mode, theme color, and app icons
- `script.js`: homepage search, filters, and compact recipe cards using relationship metadata
- `recipe.js`: recipe rendering, details rendering, ingredient checklist, and Cooking Mode
- `recipe-pairings.js`: recipe-page Pairings section rendering from curated `relationships.goesWellWith` slugs
- `recipe-pairings.css`: Pairings chip styling on recipe pages
- `recipe-scaling.js`: recipe scaling, exact quantity input, overrides, and formatting
- `recipe-scaling.css`: scaling-control layout, compact preset display, scroll behavior, active scale styling, and responsive scaling UI
- `homepage-filters.css`: homepage meal type filter chip styling
- `wake-lock.js`: Cooking Mode screen wake-lock behavior and wake-lock UI injection
- `wake-lock.css`: wake-lock button styling, SVG-style icon rendering, and wake-lock status text layout
- `theme.js`: theme selection, saved preference, toggle behaviour, and dynamic browser theme-color updates
- `theme.css`: light and dark theme tokens and dark component overrides
- `theme-toggle-fix.css`: theme-control placement, sizing, SVG utility icons, select chevron polish, Cooking Mode close button styling, and theme-specific utility button surfaces
- `brand.css`: brand icon layout, homepage responsive branding, and recipe back-link icon sizing
- `style.css`: shared site layout, recipe cards, primary/secondary buttons, recipe layout, and Cooking Mode base styling
- `icons/`: install icons, favicons, and Apple touch icon assets
- `data/validation/non-linear-ingredients.json`: config list of ingredients that require recipe-specific non-linear scaling overrides when scalable
- `scripts/validate-recipes.js`: recipe JSON, index, slug, details, relationships, step, notes, scaling, rounding, non-linear override, scaling-mode consistency, and schema guardrails
- `scripts/validate-produce-weights.js`: produce weight guidance validation for large-produce ingredients
- `scripts/validate-search.js`: recipe-index search alias validation
- `scripts/validate-recipe-pairings.js`: curated pairing validation, including missing slug errors and non-reciprocal warning checks
- `.github/workflows/validate-recipes.yml`: GitHub Actions workflow that runs recipe validation on push

## Page Loading

Homepage:

```text
index.html
-> style.css
-> brand.css
-> homepage-filters.css
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
-> recipe-pairings.css
-> wake-lock.css
-> theme.css
-> theme-toggle-fix.css
-> theme.js
-> recipe.js
-> recipe-scaling.js
-> recipe-pairings.js
-> wake-lock.js
-> data/recipes/<slug>.json
-> data/recipe-index.json
```

`recipe.js` must load before `recipe-scaling.js` because `recipe-scaling.js` extends the scaling and formatting functions defined by the main recipe renderer. `recipe-pairings.js` loads after the recipe renderer so it can inject curated Pairings into the recipe page. `wake-lock.js` loads after the recipe renderer so it can attach controls after Cooking Mode is rendered.

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
- install icons

Both `index.html` and `recipe.html` include manifest, theme-color, Apple touch icon, and favicon metadata.

Offline support is intentionally deferred until a future Service Worker phase.

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

## Theme Architecture

The active theme is resolved in this order:

1. Read the saved `shukudu-theme` value.
2. When no saved value exists, follow the device theme preference.
3. Apply either light or dark theme to the root document element.

The selected theme is saved for future visits and applies across the homepage, recipe pages, and Cooking Mode.

Theme controls are placed in the page layout rather than floating over the page:

- homepage: top-right inside the main header
- recipe page: beside the Back to recipes link
- Cooking Mode: no separate theme toggle; it inherits the active page theme

Theme icons use CSS SVG masks rather than emoji or font-dependent glyphs so the appearance is consistent across Android, iPhone, Chrome, Safari, and desktop browsers.

`theme.js` updates browser `theme-color` metadata when the user changes theme.

Theme-color behaviour:

- homepage: uses the warm brand/header colour in both light and dark mode
- recipe page: uses the light page background in light mode and the dark page background in dark mode

## Recipe Data Architecture

Each recipe is stored independently under:

```text
data/recipes/<slug>.json
```

The recipe slug is the stable identity used across the recipe index, JSON file, URL, and recipe page. The file name must match the slug exactly.

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

## Recipe Metadata Architecture

Recipe metadata is split into two layers:

```text
details = human-facing recipe metadata
relationships = structured discovery, filtering, and pairing metadata
```

`details` must include:

- `Cuisine`
- `Status`

`relationships` must include:

- `mealTypes`
- `dishTypes`
- `goesWellWith`

Example:

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

`details["Meal Type"]` is not part of the current data model. It was migrated to `relationships.mealTypes`.

Homepage cards use relationship data selectively:

```text
Cuisine + Meal Type + primary Dish Type + base quantity
```

Recipe pages show the fuller detail set:

```text
Cuisine
Status
Meal Type
Dish Type
Base
Pairings, when curated pairings exist
```

`Base` is generated from `scaling.baseQuantity` and `scaling.baseUnit`.

## Relationship Classification Rules

`One Pot` means the rice or main ingredient cooks directly with the masala in the same vessel.

```text
One Pot = rice/main ingredient cooks directly with the masala in the same vessel.
Not One Pot = rice is cooked separately, cooled/rested, then mixed into masala later.
```

Current examples:

```text
Tomato Bath: Rice / Bath / One Pot
Menthya Rice Bath: Rice / Bath / One Pot
Bisi Bele Bath: Rice / Bath / One Pot
Vangi Bath: Rice / Bath
```

Curated pairings use `relationships.goesWellWith` as manual recipe slug links. Reverse links are not auto-created. Non-reciprocal links are allowed when intentional, but the pairing validator reports them as warnings.

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

Rice preset buttons may use compact `cup/cups` labels to reduce width, while the current selected value remains fully descriptive as `rice cup/rice cups`.

Quantity-input recipes must use standard preset options:

```text
[0.5, 0.75, 1, 1.25, 1.5, 2]
```

For gram-based quantity recipes, scaling metadata uses `baseUnit: "g"`.

Base metadata is not required for every scalable recipe. When `scaling.inputMode` is `quantity`, `baseIngredient`, `baseQuantity`, and `baseUnit` are required. When `baseIngredient` is present, it must match exactly one ingredient ID.

## Cooking Mode Architecture

Cooking Mode is rendered by `recipe.js` and includes:

- recipe title and current phase/step label
- step body with scaled ingredients
- progress bar
- previous/next navigation
- mark-complete control
- close control

Cooking Mode state is stored per recipe:

```text
shukudu-kitchen:<slug>:cooking-step
shukudu-kitchen:<slug>:completed-steps
```

## Cooking Mode Wake Lock

Cooking Mode includes optional screen wake-lock support through the browser Screen Wake Lock API.

Wake-lock behavior:

- the user must tap the wake-lock control to request screen wake lock
- wake lock is requested only while Cooking Mode is open
- wake lock is released when Cooking Mode closes
- unsupported browsers show an unavailable message
- the browser or operating system may release the wake lock at any time
- if the user had enabled wake lock, the page attempts to re-request it when the page becomes visible again

The feature is intentionally implemented outside `recipe.js` in `wake-lock.js` and `wake-lock.css` so it can remain a focused Cooking Mode enhancement without complicating the core recipe renderer.

## Button and Control Styling Architecture

Button states follow this pattern:

- primary actions and confirmed states may use accent fill and soft drop shadows
- utility controls are quiet by default and use subtle hover feedback
- active toggles use strong accent styling to show state clearly
- scale option buttons avoid drop shadows and use border/inset active styling so shadows do not clip inside scrollable rows
- native controls such as `select` may be visually polished while keeping browser-native menu behavior

SVG-style utility icons are used for:

- theme sun/moon toggle
- Cooking Mode wake-lock button
- Cooking Mode close button
- native select chevron

## Rounding and Formatting Architecture

`roundingType` records the intended display behavior for scalable ingredients with quantities.

Allowed values:

- `exact`: preserve the calculated value and use unit-aware formatting
- `small-whole`: use practical count handling for small whole ingredients
- `large-produce`: use practical count or gram guidance for larger produce

The validator requires `roundingType` whenever `scalable: true` and `quantity` is present. Display-text-only fixed ingredients and non-scalable ingredients do not require it.

## Non-Linear Scaling Architecture

Most scalable ingredients use direct linear scaling.

Some ingredients use recipe-specific `scaleQuantities` because taste, heat, sourness, aroma, or tempering balance does not scale cleanly in direct proportion.

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

The workflow runs:

```text
node scripts/validate-recipes.js
node scripts/validate-produce-weights.js
node scripts/validate-search.js
node scripts/validate-recipe-pairings.js
```

The workflow uses:

- `actions/checkout@v6`
- `actions/setup-node@v6`
- `node-version: '24'`

Validator guardrails include:

- JSON parse validation
- required top-level fields
- array validation for `ingredients`, `preparation`, and `cookingMethod`
- recipe-index validation and synchronization checks
- slug format and file-name validation
- duplicate ingredient ID detection
- missing ingredient reference detection
- cooking-step structure validation
- details metadata validation for `Cuisine` and `Status`
- relationship metadata validation for `mealTypes`, `dishTypes`, and `goesWellWith`
- `servingSuggestions` and `notes` array validation
- quantity-input scaling metadata validation
- exact `baseIngredient` to ingredient ID matching when `baseIngredient` is present
- required `baseIngredient`, `baseQuantity`, and `baseUnit` when `inputMode` is `quantity`
- standard quantity options validation for quantity-input recipes
- ingredient group structure validation
- legacy ingredient-group `category` rejection
- `teaspoon` / `tablespoon` unit standardization
- structured measured-water enforcement
- non-linear config shape, key, and duplicate validation
- `roundingType` allowed value and required-field validation
- `scalingMode` value and consistency validation
- `scaleQuantities` validation against recipe-level `scaling.options`
- configured non-linear override validation
- rice unit validation
- large-produce `weightGrams` validation
- search alias validation
- pairing missing-slug validation
- non-reciprocal pairing warnings

The validator set is complete for the current non-image recipe model. Image metadata validation is deferred until recipe images are introduced.

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
- Keep relationship metadata in `relationships`, not display-only `details`.
- Keep validation config under `data/validation/`.
- Keep scaling logic in `recipe-scaling.js`.
- Keep exact quantity and scale-control styling in `recipe-scaling.css`.
- Keep recipe-page Pairings rendering in `recipe-pairings.js`.
- Keep recipe-page Pairings styling in `recipe-pairings.css`.
- Keep wake-lock behavior in `wake-lock.js`.
- Keep wake-lock styling in `wake-lock.css`.
- Keep theme behaviour in `theme.js`.
- Keep dark theme tokens in `theme.css`.
- Keep theme-control and utility-control polish in `theme-toggle-fix.css`.
- Keep brand icon layout rules in `brand.css`.
- Keep PWA metadata in `manifest.webmanifest`, `index.html`, and `recipe.html` synchronized.
- Keep validation rules in the scripts under `scripts/` and run the full workflow after recipe data or validation config changes.
- Test light and dark themes on homepage, recipe pages, and Cooking Mode.
- Test desktop, mobile, and zoomed desktop layouts for utility controls and scale controls.
- Test installability and app icon behaviour after PWA metadata changes.
- Update the changelog and visible versions for releases.
