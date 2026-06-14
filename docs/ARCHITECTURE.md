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
- `recipe.js`: loads one recipe, renders sections, checklist, navigation, and Cooking Mode
- `style.css`: site styling and responsive behavior
- `data/recipe-index.json`: lightweight homepage metadata
- `data/recipes/<slug>.json`: complete data for one recipe

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
→ rendered recipe page
```

## Add a New Recipe

1. Create `data/recipes/<slug>.json`.
2. Add one metadata entry to `data/recipe-index.json`.
3. Keep the filename and internal `slug` identical.
4. Test the page using `recipe.html?slug=<slug>`.

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
- ingredients
- preparation
- cookingMethod
- servingSuggestions
- notes

## Browser Storage

Per-recipe state is stored with these keys:

```text
shukudu-kitchen:<slug>:ingredients
shukudu-kitchen:<slug>:cooking-step
shukudu-kitchen:<slug>:completed-steps
```

## Maintenance Rules

- Keep one recipe per JSON file
- Keep the recipe index lightweight
- Do not reintroduce a combined recipe data file
- Ensure every index slug has a matching recipe file
- Update the changelog for notable changes
- Test the homepage and recipe pages after structural changes
