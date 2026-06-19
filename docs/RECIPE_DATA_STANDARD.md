# Shukudu Kitchen Recipe Data Standard

## Purpose

This document defines how recipes must be written and stored so that:

- recipe pages remain consistent
- Cooking Mode remains readable
- ingredient quantities stay synchronized across sections
- scaling remains predictable
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
    "Cuisine": "South Indian",
    "Meal Type": "Lunch / Dinner",
    "Status": "Finalized"
  },
  "ingredients": [],
  "preparation": [],
  "cookingMethod": [],
  "servingSuggestions": [],
  "notes": []
}
```

Scalable recipes must also include explicit scaling metadata. Rice-based recipes may use option buttons:

```json
"scaling": {
  "enabled": true,
  "baseIngredient": "rice",
  "baseQuantity": 1,
  "baseUnit": "riceCup",
  "baseScale": 1,
  "inputMode": "options",
  "options": [0.5, 0.75, 1, 1.25, 1.5, 2]
}
```

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

### Slug Rules

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

### Recipe Index Rules

`data/recipe-index.json` must remain synchronized with `data/recipes/`.

Rules:

- `data/recipe-index.json` must be an array
- each index entry must include non-empty `name`, `slug`, `category`, and `summary`
- duplicate index slugs are not allowed
- each index slug must point to `data/recipes/<slug>.json`
- every recipe JSON file must be listed in `data/recipe-index.json`
- index `name`, `category`, and `summary` must match the recipe JSON

### Details Metadata Rules

`details` must be an object.

Every recipe must include these non-empty metadata fields:

- `Cuisine`
- `Meal Type`
- `Status`

### Serving Suggestions and Notes

`servingSuggestions` and `notes` are optional, but when present:

- each must be an array
- every item must be a non-empty string

### Scaling Metadata Fields

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

### When Exact Quantity Input Is Appropriate

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

For mixed-vegetable recipes, use exact quantity input only when the entered quantity represents the total combined vegetable weight and the recipe defines a fixed vegetable mix. Otherwise keep preset scaling and handle ingredient substitutions or imbalanced quantities manually.

The scale calculation for quantity input is:

```text
selected scale = entered quantity ÷ baseQuantity
```

The entered quantity and resulting arbitrary scale may be persisted by the website so the same recipe state is restored on return.

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

### Optional Fields

- `preparation`
- `countLabel`
- `weightGrams`
- `roundingType`
- `displayText`
- `scaleQuantities`
- `scalingMode`

### `scalingMode`

`scalingMode` is optional and documents the author's scaling intent for an ingredient.

Allowed values:

```text
linear
non-linear
```

Rules:

- `scalingMode: "linear"` means the ingredient intentionally uses normal proportional scaling.
- `scalingMode: "linear"` skips automatic matching from `data/validation/non-linear-ingredients.json`.
- `scalingMode: "non-linear"` means the ingredient must define `scaleQuantities`.
- missing `scalingMode` means the validator checks `data/validation/non-linear-ingredients.json` to decide whether `scaleQuantities` is required.

Use `scalingMode` only when it improves clarity or avoids a false positive. Most ingredients can omit it.

### Unit Names

Use full unit names for spoon measurements:

- `teaspoon`
- `tablespoon`

Do not use abbreviated spoon units:

- `tsp`
- `tbsp`

For gram-based quantity scaling metadata, use `baseUnit: "g"`, not `"gram"`.

### Rice and Water

Rice example:

```json
{
  "id": "rice",
  "quantity": 1,
  "unit": "rice cup",
  "ingredient": "sona masuri rice",
  "scalable": true
}
```

Rice-cooking water example:

```json
{
  "id": "water",
  "quantity": 2.5,
  "unit": "rice cup",
  "ingredient": "water",
  "scalable": true
}
```

Do not store a separate standard-cup equivalent for new rice-based recipes. The renderer derives it automatically.

Measured water used in cooking instructions must be a structured ingredient and referenced through `ingredientIds`. Avoid hard-coded measured water in step text.

## Vegetable Weight Rule

Vegetables should include practical count or size guidance and grams whenever useful.

Examples:

```text
1 medium onion (120 g)
2 medium tomatoes (180 g)
1 large potato (250 g)
```

Recipe-specific measured values take priority over default ingredient references.

## Ingredient Consistency

Ingredient quantities used in Preparation and Cooking Method must come from the same ingredient objects used in Ingredients.

Rules:

- do not introduce unlisted quantities
- do not skip listed ingredients
- do not duplicate hard-coded scaled quantities in steps
- use stable `ingredientIds`
- keep wording consistent across Ingredients and Cooking Mode

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
  "ingredientIds": [
    "tomatoes",
    "turmeric",
    "red-chilli-powder",
    "salt"
  ],
  "after": "Cook until the tomatoes soften."
}
```

Step validation rules:

- each `preparation` and `cookingMethod` step must be an object
- a plain-text step may use `{ "text": "..." }`
- a structured ingredient step may use `{ "lead": "...", "ingredientIds": [...], "after": "..." }`
- `text` must be non-empty when present
- `lead` must be non-empty when present
- `ingredientIds` must be an array when present
- `ingredientIds` must not be empty
- `lead` requires `ingredientIds`
- `ingredientIds` requires `lead`
- `after` must be non-empty when present

Guidelines:

- keep one cooking action per step
- split steps containing distinct actions
- keep steps short enough for mobile Cooking Mode
- use ingredient references instead of repeated manual quantities

## Scaling Rules

### Default Linear Scaling

For a normally scalable ingredient:

```text
effective quantity = base quantity × selected scale
```

Use linear scaling for ingredients that generally increase in direct proportion, such as:

- rice
- rice-cooking water
- curd
- milk
- vegetables by weight
- measured powders and liquids when appropriate

### Recipe-Specific Scale Options

Each recipe may define its own `scaling.options`.

Example for a recipe with a 0.25 rice cup base:

```json
"options": [1, 2, 3, 4, 5]
```

This produces practical visible rice quantities:

```text
¼ rice cup
½ rice cup
¾ rice cup
1 rice cup
1¼ rice cups
```

The visible rice quantity is always:

```text
baseQuantity × selected scale
```

Do not assume the selected scale value itself equals the rice quantity.

For quantity-input recipes, use the standard preset options:

```json
"options": [0.5, 0.75, 1, 1.25, 1.5, 2]
```

## Non-Linear Ingredient Scaling

Some ingredients should not scale in direct proportion to the recipe size.

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

The validator also checks `data/validation/non-linear-ingredients.json`. If a scalable ingredient matches that config and does not have `scalingMode: "linear"`, it must define `scaleQuantities`.

Example:

```json
{
  "id": "green-chillies",
  "quantity": 3,
  "countLabel": "green chilli",
  "ingredient": "green chillies",
  "preparation": "slit",
  "scalable": true,
  "roundingType": "small-whole",
  "scaleQuantities": {
    "0.5": 2,
    "0.75": 2,
    "1": 3,
    "1.25": 3,
    "1.5": 4,
    "2": 5
  }
}
```

### `scaleQuantities` Rules

- `scaleQuantities` keys must exactly match the values from the recipe-level `scaling.options` array.
- Every recipe-level scale option must have a matching `scaleQuantities` key.
- Extra `scaleQuantities` keys are not allowed.
- Values must be numeric.
- Values must not be negative.
- `0` is allowed when an ingredient is intentionally skipped at a scale.
- `scaleQuantities` may be used only on ingredients where `scalable: true`.
- Missing override keys are validator errors, not silent renderer fallbacks.

Example relationship:

```json
"scaling": {
  "options": [0.5, 0.75, 1, 1.25, 1.5, 2]
}
```

```json
"scaleQuantities": {
  "0.5": 2,
  "0.75": 2,
  "1": 3,
  "1.25": 3,
  "1.5": 4,
  "2": 5
}
```

At selected scale `1.5`, the renderer uses `scaleQuantities["1.5"]`.

### Non-Linear Ingredient Config

The maintained source list of known non-linear ingredients is:

```text
data/validation/non-linear-ingredients.json
```

The config contains matching rules such as:

```json
{
  "key": "green-chilli",
  "match": ["green chilli", "green chillies"],
  "reason": "Heat does not scale safely in direct proportion."
}
```

The validator checks these ingredient fields against the config:

- `id`
- `ingredient`
- `countLabel`
- `displayText`

Validation behavior:

```text
scalingMode: "linear"
    -> skip config matching

scalingMode: "non-linear"
    -> scaleQuantities required

missing scalingMode
    -> use config matching
```

### Why Overrides Are Recipe-Specific

The same ingredient may scale differently depending on the dish.

For example:

- green chilli in curd rice should remain mild
- green chilli in chutney may increase more aggressively
- mustard in palya may scale differently from mustard in curd rice
- lemon in tomato bath may scale differently from lemon in vangi bath

Shared ingredient references and validation config provide authoring guidance, but recipe-specific JSON controls runtime quantities.

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

## Practical Kitchen Rounding

### Large Produce

For tomato, onion, potato, brinjal, capsicum, carrot, beans, and similar ingredients:

- use practical whole counts or ranges
- keep grams as the precise target
- avoid awkward count fractions

Preferred:

```text
3 medium tomatoes (338 g)
```

Avoid:

```text
3⅜ medium tomatoes
```

### Small Whole Ingredients

For green chilli, lemon, garlic cloves, curry leaves, and similar ingredients:

- prefer practical half or whole counts
- use `scaleQuantities` when linear scaling gives poor culinary results
- avoid values such as 0.25 chilli unless genuinely usable

## Unit-Aware Quantity Formatting

Quantity display must reflect how the ingredient is actually measured in the kitchen.

### Cups

For `rice cup`, `standard cup`, and `cup`:

- preserve the calculated quantity
- use familiar quarter fractions when exact, such as `¼`, `½`, `¾`, `1¼`, and `1½`
- use a decimal for awkward values rather than forcing an unfamiliar fraction
- do not snap cup quantities to the nearest quarter

Examples:

```text
1.25 → 1¼
1.5 → 1½
1.666 → 1.67
3.125 → 3.125
4.167 → 4.17
```

This protects rice and water ratios while making values easier to judge quickly.

### Teaspoons and Tablespoons

For `teaspoon` and `tablespoon`:

- snap the displayed quantity to the nearest ¼ spoon
- use practical measuring-spoon fractions

Examples:

```text
0.834 teaspoon → ¾ teaspoon
1.666 teaspoons → 1¾ teaspoons
3.334 tablespoons → 3¼ tablespoons
```

### Inches

For `inch`:

- snap the displayed quantity to the nearest ¼ inch

Example:

```text
1.666 inches → 1¾ inches
```

### Grams

- display gram weights using the existing gram-rounding rules
- normally use the nearest whole gram
- keep grams as the precise guide for produce

### Scope

These are display-formatting rules. They do not change the underlying scale factor or stored recipe quantities.

## Scale Control Display

The engine stores scale multipliers internally.

For rice-cup-based recipes, the UI shows derived rice quantities using the cup-display rules above.

For quantity-input recipes, the UI shows the entered base-ingredient quantity and derives the scale internally.

For non-rice preset recipes, the UI shows generic multipliers such as:

```text
0.5×
1×
1.5×
```

## Recipe Validation

Recipe data is validated by `scripts/validate-recipes.js` and the GitHub Actions workflow `.github/workflows/validate-recipes.yml`.

The workflow runs on push when recipe index data, recipe files, validation config, the validator script, or the validation workflow changes. It uses Node.js 24 with `actions/checkout@v6` and `actions/setup-node@v6`, then runs:

```text
node scripts/validate-recipes.js
```

Validator rules:

- recipe JSON must parse successfully
- required top-level fields must exist
- `ingredients`, `preparation`, and `cookingMethod` must be arrays
- `details` must be an object with non-empty `Cuisine`, `Meal Type`, and `Status`
- `servingSuggestions` must be an array when present, and every item must be a non-empty string
- `notes` must be an array when present, and every item must be a non-empty string
- recipe slug must match `^[a-z0-9]+(-[a-z0-9]+)*$`
- recipe file name must match the slug exactly as `<slug>.json`
- `data/recipe-index.json` must be an array
- each index entry must include non-empty `name`, `slug`, `category`, and `summary`
- duplicate index slugs are rejected
- each index slug must point to `data/recipes/<slug>.json`
- every recipe JSON file must be listed in `data/recipe-index.json`
- index `name`, `category`, and `summary` must match the recipe JSON
- ingredient IDs must not be duplicated
- `preparation` and `cookingMethod` ingredient references must point to existing ingredient IDs
- each preparation and cooking step must be an object
- steps may use plain text with `{ "text": "..." }`
- steps may use structured ingredients with `{ "lead": "...", "ingredientIds": [...], "after": "..." }`
- `text`, `lead`, and `after` must be non-empty when present
- `ingredientIds` must be a non-empty array when present
- `lead` and `ingredientIds` must be used together
- quantity-input recipes must have `baseIngredient`, positive numeric `baseQuantity`, valid `baseUnit`, `inputLabel`, and standard `options`
- quantity-input `inputLabel` must end with `quantity`
- quantity-input `options` must be `[0.5, 0.75, 1, 1.25, 1.5, 2]`
- quantity-input `baseIngredient` must match exactly one ingredient ID
- gram-based quantity recipes must use `baseUnit: "g"`
- ingredient groups must use `section` and `items`
- ingredient groups must not use legacy `category`
- abbreviated ingredient units are not allowed: use `teaspoon` and `tablespoon`, not `tsp` or `tbsp`
- hard-coded measured water in cooking method text should be avoided; measured water should be a structured ingredient and referenced through `ingredientIds`
- `data/validation/non-linear-ingredients.json` must exist and contain valid rule objects
- `scalingMode`, when present, must be `linear` or `non-linear`
- `scaleQuantities` must be a complete object whose keys exactly match recipe-level `scaling.options`
- `scaleQuantities` values must be numeric and not negative; `0` is allowed
- configured non-linear ingredients with `scalable: true` must define `scaleQuantities` unless `scalingMode: "linear"` is set

New recipe creation must satisfy these validator rules before pushing. The validator is complete for the current non-image recipe model. Image metadata validation is deferred until recipe images are introduced.

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
2. Use lowercase hyphenated slug format: `^[a-z0-9]+(-[a-z0-9]+)*$`
3. Confirm the recipe file name exactly matches `<slug>.json`
4. Add or update the recipe entry in `data/recipe-index.json`
5. Ensure index `name`, `category`, and `summary` match the recipe JSON
6. Confirm all ingredient quantities
7. Add grams for vegetables where useful
8. Use rice cup as the canonical base for rice recipes
9. Define `baseIngredient`, `baseQuantity`, and `baseUnit`
10. Choose `inputMode: "options"` or `inputMode: "quantity"`
11. For quantity input, define `inputLabel`, `inputMin`, and `inputStep`
12. Confirm that exact quantity input is suitable for the recipe composition
13. For quantity input, use `baseUnit: "g"` for gram-based recipes
14. For quantity input, ensure `baseIngredient` matches exactly one ingredient ID
15. For quantity input, use `options: [0.5, 0.75, 1, 1.25, 1.5, 2]`
16. Use ingredient groups with `section` and `items`, not legacy `category`
17. Use `teaspoon` and `tablespoon`, not `tsp` or `tbsp`
18. Add measured water as a structured ingredient and reference it from steps
19. Mark each ingredient scalable or non-scalable
20. Check whether each scalable ingredient matches `data/validation/non-linear-ingredients.json`
21. Use `scaleQuantities` where linear scaling is unsuitable or required by validation config
22. Ensure `scaleQuantities` keys cover every recipe scale option and no extra options
23. Use `scalingMode: "linear"` only when intentionally overriding a config match
24. Use `scalingMode: "non-linear"` only when explicitly requiring `scaleQuantities`
25. Use stable ingredient IDs
26. Reference ingredient IDs from Preparation and Cooking Method
27. Keep every preparation and cooking step as an object
28. Use `{ "text": "..." }` for plain-text steps
29. Use `lead` and `ingredientIds` together for structured ingredient steps
30. Keep one cooking action per step
31. Ensure `details` includes `Cuisine`, `Meal Type`, and `Status`
32. Keep `servingSuggestions` and `notes` as arrays of non-empty strings when present
33. Run `node scripts/validate-recipes.js`
34. Test the normal recipe page and Cooking Mode
35. Test every supported preset and arbitrary quantity scale
36. Verify cup, spoon, inch, produce, gram, and override formatting
37. Verify the entered quantity and arbitrary scale restore correctly after reload

## Required References

Use together with:

- `docs/ARCHITECTURE.md`
- `docs/INGREDIENT_REFERENCE.md`
- `docs/FEATURE_ROADMAP.md`
- `docs/BASE_INGREDIENT_SCALING.md`
