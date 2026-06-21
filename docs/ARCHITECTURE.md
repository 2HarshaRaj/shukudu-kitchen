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
|  `- UI_THEME_STANDARD.md
|- icons/
|  |- icon-192.png
|  |- icon-512.png
|  |- apple-touch-icon.png
|  |- favicon-32.png
|  |- favicon-16.png
|  `- social-preview.png
|- scripts/
|  |- validate-recipes.js
|  |- validate-produce-weights.js
|  |- validate-search.js
|  |- validate-recipe-pairings.js
|  `- validate-theme.js
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

- `index.html`: homepage layout, homepage theme-control host, PWA metadata, Open Graph/Twitter social preview metadata, and brand header structure
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
- `docs/UI_THEME_STANDARD.md`: visual theme rules for colors, pills, chips, buttons, shadows, touch behavior, and light/dark mode review
- `icons/`: install icons, favicons, Apple touch icon assets, and the site-level social preview image
- `icons/social-preview.png`: Open Graph/WhatsApp/Twitter large-preview image referenced from `index.html`
- `data/validation/non-linear-ingredients.json`: config list of ingredients that require recipe-specific non-linear scaling overrides when scalable
- `scripts/validate-recipes.js`: recipe JSON, index, slug, details, relationships, step, notes, scaling, rounding, non-linear override, scaling-mode consistency, and schema guardrails
- `scripts/validate-produce-weights.js`: produce weight guidance validation for large-produce ingredients
- `scripts/validate-search.js`: recipe-index search alias validation
- `scripts/validate-recipe-pairings.js`: curated pairing validation, including missing slug errors and non-reciprocal warning checks
- `scripts/validate-theme.js`: objective theme guardrails for theme documentation, known CSS files, CSS asset versions, approved hardcoded-color locations, approved shadow locations, and required dark-mode pill overrides
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

Both `index.html` and `recipe.html` include manifest, theme-color, Apple touch icon, and favicon metadata. The homepage also includes Open Graph and Twitter card metadata for link previews.

Offline support is intentionally deferred until a future Service Worker phase.

## Branding and Social Preview Architecture

Brand icon layout is handled through `brand.css`.

Homepage:

- desktop keeps the app icon beside the title block
- mobile stacks the app icon above the title block so the heading keeps full width
- icon asset: `icons/icon-192.png`

Recipe page:

- the app icon appears as a small visual marker beside `Back to recipes`
- the icon is intentionally smaller than the homepage icon so it does not compete with the recipe title
- icon asset: `icons/icon-192.png`

Social preview:

- preview image asset: `icons/social-preview.png`
- homepage metadata references the social preview using an absolute GitHub Pages URL
- Open Graph metadata includes type, site name, title, description, canonical URL, image URL, image type, and image dimensions
- Twitter metadata uses `summary_large_image` and the same preview image
- the social preview image is site-level branding, not recipe image data

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

UI theme standards are documented in `docs/UI_THEME_STANDARD.md`. Review that document before changing colors, pills, chips, buttons, shadows, hover states, active states, pressed states, or light/dark behavior.

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
