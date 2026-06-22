# Shukudu Kitchen Recipe Data Standard

## Purpose

This document defines how recipes must be written and stored so that:

- recipe pages remain consistent
- Cooking Mode remains readable
- ingredient quantities stay synchronized across sections
- scaling remains predictable
- relationship metadata remains useful for discovery, filters, search, and curated pairings
- future recipes can be added without relying on chat history

## Rice Cup and Standard Cup Conversion

Use this conversion:

```text
1 standard cup = 0.75 rice cup
```

For rice-based recipes:

- rice cup is the canonical authoring and scaling base
- rice and rice-cooking water display rice cup first
- standard cup equivalents are derived automatically and shown in brackets

Examples:

```text
1 rice cup rice (1⅓ standard cups)
2 rice cups water (2⅔ standard cups)
```

Use this consistently in Ingredients, Preparation, Cooking Method, and Cooking Mode.

## Recipe JSON Structure

Each recipe file must contain:

```json
{
  "name": "Recipe Name",
  "slug": "recipe-name",
  "category": "Rice",
  "summary": "Short homepage description.",
  "details": {
    "Cuisine": "South Indian · Karnataka",
    "Status": "Finalized"
  },
  "relationships": {
    "mealTypes": ["Lunch", "Dinner"],
    "dishTypes": ["Rice", "Bath"],
    "goesWellWith": []
  },
  "householdBase": {
    "people": 2,
    "meals": 2,
    "label": "2 people × 2 meals"
  },
  "scaling": {
    "enabled": true,
    "baseIngredient": "rice",
    "baseQuantity": 1,
    "baseUnit": "riceCup",
    "baseScale": 1,
    "inputMode": "options",
    "options": [0.5, 0.75, 1, 1.25, 1.5, 2]
  },
  "ingredients": [],
  "preparation": [],
  "cookingMethod": [],
  "servingSuggestions": [],
  "notes": []
}
```

`details["Meal Type"]` is no longer part of the recipe data standard. Meal classification belongs in `relationships.mealTypes`.

Recipes that should scale from the exact amount of a base ingredient may use quantity input:

```json
"scaling": {
  "enabled": true,
  "baseIngredient": "raw-banana",
  "baseQuantity": 500,
  "baseUnit": "g",
  "baseScale": 1,
  "inputMode": "quantity",
  "inputLabel": "Raw banana quantity",
  "inputMin": 50,
  "inputStep": 10,
  "options": [0.5, 0.75, 1, 1.25, 1.5, 2]
}
```

Recipes may also define `baseIngredient`, `baseQuantity`, and `baseUnit` for display-only base details without using `inputMode: "quantity"`.

Example:

```json
"scaling": {
  "enabled": true,
  "baseIngredient": "tomatoes",
  "baseQuantity": 500,
  "baseUnit": "g",
  "baseScale": 1,
  "options": [0.5, 0.75, 1, 1.25, 1.5, 2]
}
```

## Slug Rules

The recipe slug is the stable recipe ID used by the index, recipe file, URL, and internal recipe identity.

Slug requirements:

- use lowercase letters and numbers
- separate words with single hyphens
- use this allowed pattern: `^[a-z0-9]+(-[a-z0-9]+)*$`
- reject spaces, underscores, uppercase letters, and special characters
- keep the slug stable after publishing unless there is a deliberate migration

The recipe file name must match the slug exactly:

```text
slug: tomato-bath
file: data/recipes/tomato-bath.json
```

## Recipe Index Rules

`data/recipe-index.json` must remain synchronized with `data/recipes/`.

Rules:

- `data/recipe-index.json` must be an array
- each index entry must include non-empty `name`, `slug`, `category`, and `summary`
- duplicate index slugs are not allowed
- each index slug must point to `data/recipes/<slug>.json`
- every recipe JSON file must be listed in `data/recipe-index.json`
- index `name`, `category`, and `summary` must match the recipe JSON
- index `searchAliases` may be used for alternate names and regional names

## Details Metadata Rules

`details` must be an object.

Every recipe must include these non-empty metadata fields:

- `Cuisine`
- `Status`

Optional human-facing fields may be added only when they are recipe-specific and useful on the recipe page.

Do not store relationship-style values in `details`. In particular:

- use `relationships.mealTypes`, not `details["Meal Type"]`
- use `relationships.dishTypes`, not a display-only dish type string
- use `scaling.baseQuantity` and `scaling.baseUnit` for base quantity; the recipe page generates the `Base` detail from scaling metadata

## Household Base Metadata

Recipes may optionally include `householdBase` when the practical household meaning of the current base recipe is reasonably known.

Use this shape:

```json
"householdBase": {
  "people": 2,
  "meals": 2,
  "label": "2 people × 2 meals"
}
```

Rules:

- `people` must be a positive number
- `meals` must be a positive number
- `label` must be a non-empty human-readable string
- `label` should include the people and meals numbers in readable form
- add `householdBase` only when it is supported by the recipe's existing base assumptions
- current known household assumptions are warning-validated guidance, not hard-error validation
- for current 500 g Palya recipes, `householdBase` should be 2 people × 2 meals
- for current 1 rice cup rice/bath recipes, `householdBase` should be 2 people × 2 meals
- for Curd Rice at a 0.25 rice cup base, `householdBase` should be 2 people × 1 meal

`householdBase` defines the base People × Meals reference used by the recipe page household selector. Recipe pages may show a generated Recipe Details row such as:

```text
Household Base: 2 people × 2 meals
```

When a household selection is available, rendered quantities use `effectiveScale = selectedRecipeScale × householdMultiplier`, where `householdMultiplier` compares the selected People × Meals values with `householdBase.people × householdBase.meals`. The recipe scale controls themselves remain based on the selected recipe scale.

## Relationship Metadata Rules

Every recipe must include `relationships`.

Required fields:

```json
"relationships": {
  "mealTypes": ["Lunch", "Dinner"],
  "dishTypes": ["Rice", "Bath", "One Pot"],
  "goesWellWith": []
}
```

### `mealTypes`

Allowed values:

```text
Breakfast
Lunch
Dinner
Snack
Side
```

Rules:

- must be a non-empty array
- values must be from the allowed list
- duplicate values are not allowed
- use broad, practical meal categories

### `dishTypes`

Allowed values:

```text
Rice
Bath
Palya
Rasam
Dal
Side Dish
One Pot
Cereal
```

Rules:

- must be a non-empty array
- values must be from the allowed list
- duplicate values are not allowed
- keep labels broad and useful for recipe discovery

### `One Pot`

Use `One Pot` only when the rice or main ingredient cooks directly with the masala in the same vessel.

```text
One Pot = rice/main ingredient cooks directly with the masala in the same vessel.
Not One Pot = rice is cooked separately, cooled/rested, then mixed into masala later.
```

Examples:

```text
Tomato Bath: Rice / Bath / One Pot
Menthya Rice Bath: Rice / Bath / One Pot
Bisi Bele Bath: Rice / Bath / One Pot
Vangi Bath: Rice / Bath
Punjabi Dal Tadka: Dal
```

### `goesWellWith`

Rules:

- must be an array
- may be empty
- values must be recipe slugs
- values must use slug format
- values must point to existing recipe files
- a recipe must not self-reference its own slug
- pairings should be curated, not automatically mass-linked
- keep pairings manual
- do not auto-create reverse links
- non-reciprocal pairings are warnings only, not errors

## Serving Suggestions and Notes

`servingSuggestions` and `notes` are optional, but when present:

- each must be an array
- every item must be a non-empty string

## Scaling Metadata Fields

- `enabled`: whether scaling controls are active
- `baseIngredient`: stable ingredient ID used as the scaling reference
- `baseQuantity`: finalized recipe quantity of the base ingredient at 1×
- `baseUnit`: canonical unit used for the base quantity, such as `riceCup`, `g`, or `cup`
- `baseScale`: multiplier represented by the stored recipe quantities; normally `1`
- `inputMode`: scaling UI mode; use `options` for preset multipliers or quantities, and `quantity` for direct base-ingredient entry
- `inputLabel`: user-facing label shown beside the exact quantity input
- `inputMin`: smallest supported input quantity
- `inputStep`: practical increment used by the quantity input control
- `options`: supported preset scale values

New rice recipes should generally default to 1 rice cup unless another rice-cup base better represents the finalized recipe.

Base metadata is optional for normal scalable recipes. It should be used when it helps explain the recipe size on the recipe page.

When `scaling.inputMode` is `quantity`, these fields are required:

- `baseIngredient`
- `baseQuantity`
- `baseUnit`

When `baseIngredient` is present, it must match exactly one ingredient ID.

For quantity-input recipes, use the standard preset options:

```json
"options": [0.5, 0.75, 1, 1.25, 1.5, 2]
```

## When Exact Quantity Input Is Appropriate

Use `inputMode: "quantity"` when:

- the cook normally starts with the amount of one dominant ingredient already available
- the ingredient can be measured reliably in one unit, especially grams
- the whole recipe can reasonably scale from that ingredient
- examples include raw banana palya, beans palya, cabbage palya, and other single-vegetable dishes

Avoid exact quantity input when:

- the recipe depends on several co-equal vegetables whose proportions matter
- changing one ingredient alone would make the recipe unbalanced
- the base ingredient is difficult to measure consistently
- the recipe requires culinary judgement rather than uniform proportional scaling

The scale calculation for quantity input is:

```text
selected scale = entered quantity ÷ baseQuantity
```

## Ingredient Structure

Use structured ingredient objects for scalable recipes.

Example:

```json
{
  "id": "tomatoes",
  "quantity": 3,
  "countLabel": "medium tomato",
  "weightGrams": 300,
  "ingredient": "tomatoes",
  "preparation": "chopped",
  "scalable": true,
  "roundingType": "large-produce"
}
```

### Ingredient Groups

Ingredient groups must use `section` and `items`.

```json
{
  "section": "Main",
  "items": []
}
```

Do not use the legacy `category` field inside ingredient groups.

### Required Fields

- `id`: stable unique identifier
- `quantity`: numeric base quantity at 1×, except display-text-only fixed ingredients
- `ingredient`: ingredient name
- `scalable`: whether the quantity changes with scale

Use `unit` for measured ingredients such as cups, teaspoons, tablespoons, grams, and rice cups.

When an ingredient has `scalable: true` and a `quantity`, it must also define `roundingType`.

### Optional Fields

- `preparation`
- `countLabel`
- `weightGrams`
- `roundingType`
- `displayText`
- `scaleQuantities`
- `scalingMode`
- `referenceQuantity`

## Rounding and Scaling Rules

Allowed `roundingType` values:

```text
exact
small-whole
large-produce
```

Rules:

- `roundingType` is required when `scalable: true` and `quantity` exists
- use `exact` for measured quantities where fractional display is acceptable
- use `small-whole` for small count-based ingredients where awkward decimals should be avoided
- use `large-produce` for larger produce where practical counts and gram guidance matter
- scalable count-based ingredients with `roundingType: "large-produce"` should include positive `weightGrams`

### `scalingMode`

Allowed values:

```text
linear
non-linear
```

Rules:

- `scalingMode: "linear"` skips automatic matching from `data/validation/non-linear-ingredients.json`
- `scalingMode: "linear"` must not be used together with `scaleQuantities`
- `scalingMode: "non-linear"` requires `scaleQuantities`
- missing `scalingMode` means the validator checks `data/validation/non-linear-ingredients.json`

## Unit Names

Use full unit names for spoon measurements:

- `teaspoon`
- `tablespoon`

Do not use abbreviated spoon units:

- `tsp`
- `tbsp`

For gram-based quantity scaling metadata, use `baseUnit: "g"`, not `"gram"`.

## Rice and Water

Rice example:

```json
{
  "id": "rice",
  "quantity": 1,
  "unit": "rice cup",
  "ingredient": "sona masuri rice",
  "scalable": true,
  "roundingType": "exact"
}
```

Rice-cooking water example:

```json
{
  "id": "water",
  "quantity": 2.5,
  "unit": "rice cup",
  "ingredient": "water",
  "scalable": true,
  "roundingType": "exact"
}
```

Do not store a separate standard-cup equivalent for new rice-based recipes. The renderer derives it automatically.

Measured water used in cooking instructions must be a structured ingredient and referenced through `ingredientIds`. Avoid hard-coded measured water in step text.

## Non-Linear Ingredient Scaling

Some ingredients should not scale in direct proportion to recipe size.

Examples:

- green chilli
- mustard seeds
- urad dal
- chana dal
- curry leaves
- ginger
- coriander leaves
- lemon
- strong spice blends and masala powders

For these ingredients, use recipe-specific `scaleQuantities`.

The validator checks `data/validation/non-linear-ingredients.json`. If a scalable ingredient matches that config and does not have `scalingMode: "linear"`, it must define `scaleQuantities`.

`scaleQuantities` rules:

- keys must exactly match recipe-level `scaling.options`
- every recipe-level option must have a matching key
- extra keys are not allowed
- values must be numeric and not negative
- `0` is allowed when an ingredient is intentionally skipped at a scale
- `scaleQuantities` may be used only when `scalable: true`

## Non-Scalable Ingredients

Use `scalable: false` for wording that should remain unchanged.

Example:

```json
{
  "id": "salt",
  "ingredient": "salt",
  "displayText": "Salt, as required",
  "scalable": false
}
```

Do not automatically scale:

- cooking time
- soaking time
- temperature
- induction wattage
- pressure-cooking duration
- natural-release instructions
- subjective doneness descriptions

## Preparation and Cooking Steps

Use simple text for one standalone instruction:

```json
{
  "text": "Mash the cooked rice thoroughly and allow it to cool until warm."
}
```

Use structured steps when ingredients are involved:

```json
{
  "lead": "Add:",
  "ingredientIds": ["tomatoes", "turmeric", "salt"],
  "after": "Cook until the tomatoes soften."
}
```

Step validation rules:

- each `preparation` and `cookingMethod` step must be an object
- a plain-text step may use `{ "text": "..." }`
- a structured ingredient step may use `{ "lead": "...", "ingredientIds": [...], "after": "..." }`
- `text`, `lead`, and `after` must be non-empty when present
- `ingredientIds` must be an array when present
- `ingredientIds` must not be empty
- `lead` requires `ingredientIds`
- `ingredientIds` requires `lead`

Guidelines:

- keep one cooking action per step
- split steps containing distinct actions
- keep steps short enough for mobile Cooking Mode
- use ingredient IDs instead of repeated hard-coded quantities

## Unit-Aware Quantity Formatting

Quantity display must reflect how the ingredient is actually measured in the kitchen.

- Cup values preserve the calculated quantity and use familiar fractions when possible
- Teaspoon and tablespoon values use practical measuring-spoon fractions
- Inch values use practical fractional display
- Gram weights normally use the nearest whole gram
- Formatting does not change the underlying scale factor or stored recipe quantities

## Recipe Validation

Recipe data is validated by the GitHub Actions workflow `.github/workflows/validate-recipes.yml`.

The workflow runs on push when recipe index data, recipe files, validation config, validation scripts, or the validation workflow changes. It uses Node.js 24 with `actions/checkout@v6` and `actions/setup-node@v6`, then runs:

```text
node scripts/validate-recipes.js
node scripts/validate-produce-weights.js
node scripts/validate-search.js
node scripts/validate-recipe-pairings.js
node scripts/validate-theme.js
```

Validator rules include:

- recipe JSON must parse successfully
- required top-level fields must exist
- `ingredients`, `preparation`, and `cookingMethod` must be arrays
- `details` must be an object with non-empty `Cuisine` and `Status`
- `relationships` must exist as an object
- `relationships.mealTypes` must be a non-empty array of allowed values
- `relationships.dishTypes` must be a non-empty array of allowed values
- `relationships.goesWellWith` must be an array of valid slugs when populated
- `relationships.goesWellWith` slugs must point to existing recipes
- non-reciprocal `goesWellWith` links are warnings only
- `servingSuggestions` and `notes` must be arrays of non-empty strings when present
- recipe slug must match `^[a-z0-9]+(-[a-z0-9]+)*$`
- recipe file name must match the slug exactly as `<slug>.json`
- `data/recipe-index.json` must stay synchronized with recipe files
- ingredient IDs must not be duplicated
- `preparation` and `cookingMethod` ingredient references must point to existing ingredient IDs
- cooking-step structure must be valid
- quantity-input metadata must be valid
- quantity-input recipes must define `baseIngredient`, `baseQuantity`, and `baseUnit`
- when `baseIngredient` is present, it must match exactly one ingredient ID
- gram-based quantity recipes must use `baseUnit: "g"`
- ingredient groups must use `section` and `items`
- abbreviated ingredient units are not allowed
- measured water should be a structured ingredient and referenced through `ingredientIds`
- `roundingType` must be valid and present for scalable ingredients with quantities
- `scalingMode` must be valid and consistent with `scaleQuantities`
- `scaleQuantities` must exactly match recipe-level `scaling.options`
- configured non-linear ingredients with `scalable: true` must define `scaleQuantities` unless `scalingMode: "linear"` is set
- `searchAliases` must be structurally valid and unique

New recipe creation must satisfy these validator rules before pushing. The validator set is complete for the current non-image recipe model. Image metadata validation is deferred until recipe images are introduced.

## Tamarind Rule

Use tamarind paste whenever tamarind is required unless explicitly requested otherwise.

## No-Assumptions Rule

Do not assume:

- substitutions
- shortcuts
- alternative ingredients
- quantity changes
- structural changes
- non-linear scaling values

Confirm recipe intent before introducing culinary overrides.

## New Recipe Checklist

Before adding or updating a recipe:

1. Confirm recipe name and slug
2. Use lowercase hyphenated slug format
3. Confirm the recipe file name exactly matches `<slug>.json`
4. Add or update the recipe entry in `data/recipe-index.json`
5. Ensure index `name`, `category`, and `summary` match the recipe JSON
6. Confirm `details` includes `Cuisine` and `Status`
7. Confirm `relationships.mealTypes`, `relationships.dishTypes`, and `relationships.goesWellWith`
8. Use stable ingredient IDs
9. Confirm all ingredient quantities
10. Add grams for vegetables where useful
11. Define `baseIngredient`, `baseQuantity`, and `baseUnit` when the recipe needs base display or quantity input
12. Choose preset-only scaling or `inputMode: "quantity"`
13. For quantity input, define `inputLabel`, `inputMin`, and `inputStep`
14. For quantity input, ensure `baseIngredient`, `baseQuantity`, and `baseUnit` are present
15. When `baseIngredient` is present, ensure it matches exactly one ingredient ID
16. Use ingredient groups with `section` and `items`
17. Use `teaspoon` and `tablespoon`, not `tsp` or `tbsp`
18. Add measured water as a structured ingredient and reference it from steps
19. Mark each ingredient scalable or non-scalable
20. For every scalable ingredient with `quantity`, choose `roundingType`
21. Use `scaleQuantities` where linear scaling is unsuitable or required by validation config
22. Reference ingredient IDs from Preparation and Cooking Method
23. Keep every preparation and cooking step as an object
24. Keep one cooking action per step
25. Keep `servingSuggestions` and `notes` as arrays of non-empty strings when present
26. Run the full validation workflow locally when possible
27. Test the normal recipe page and Cooking Mode
28. Test every supported scale option

Local validation commands:

```text
node scripts/validate-recipes.js
node scripts/validate-produce-weights.js
node scripts/validate-search.js
node scripts/validate-recipe-pairings.js
node scripts/validate-theme.js
```

## Required References

Use together with:

- `docs/ARCHITECTURE.md`
- `docs/INGREDIENT_REFERENCE.md`
- `docs/FEATURE_ROADMAP.md`
- `docs/BASE_INGREDIENT_SCALING.md`
- `docs/RECIPE_RELATIONSHIPS.md`
- `docs/SEARCH.md`
