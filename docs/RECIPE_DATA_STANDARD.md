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

Rice-based scalable recipes must also include explicit scaling metadata:

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

New rice recipes should generally default to 1 rice cup unless another rice-cup base better represents the finalized recipe.

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

### Required Fields

- `id`: stable unique identifier
- `quantity`: numeric base quantity at 1×
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

## Non-Linear Ingredient Scaling

Some ingredients should not scale in direct proportion to the recipe size.

Examples:

- green chilli
- mustard seeds
- urad dal
- curry leaves
- ginger
- coriander
- lemon
- strong spice blends

For these ingredients, use the optional recipe-specific `scaleQuantities` field.

Example:

```json
{
  "id": "green-chilli",
  "quantity": 1,
  "countLabel": "small green chilli",
  "ingredient": "green chilli",
  "preparation": "finely chopped",
  "scalable": true,
  "roundingType": "small-whole",
  "scaleQuantities": {
    "1": 1,
    "2": 1,
    "3": 1.5,
    "4": 2,
    "5": 2
  }
}
```

### `scaleQuantities` Rules

- `scaleQuantities` is optional
- keys represent values from the recipe-level `scaling.options` array
- values represent the ingredient quantity to display and use at that scale
- when present, define an override for every supported scale option
- if a key is missing, the renderer falls back to normal linear scaling
- avoid partial override maps unless that fallback is intentional
- keep overrides recipe-specific rather than using a global runtime master list

Example relationship:

```json
"scaling": {
  "options": [1, 2, 3, 4, 5]
}
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

At selected scale `4`, the renderer uses `scaleQuantities["4"]`.

### Why Overrides Are Recipe-Specific

The same ingredient may scale differently depending on the dish.

For example:

- green chilli in curd rice should remain mild
- green chilli in chutney may increase more aggressively
- mustard in palya may scale differently from mustard in curd rice

Shared ingredient references may provide authoring guidance, but recipe-specific JSON controls runtime quantities.

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

## Scale Control Display

The engine stores scale multipliers internally.

For rice-cup-based recipes, the UI shows derived rice quantities.

For non-rice recipes, the UI shows generic multipliers such as:

```text
0.5×
1×
1.5×
```

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
2. Confirm all ingredient quantities
3. Add grams for vegetables where useful
4. Use rice cup as the canonical base for rice recipes
5. Define `baseIngredient`, `baseQuantity`, and `baseUnit`
6. Choose practical recipe-level scale options
7. Mark each ingredient scalable or non-scalable
8. Use `scaleQuantities` where linear scaling is unsuitable
9. Ensure override keys cover every recipe scale option
10. Use stable ingredient IDs
11. Reference ingredient IDs from Preparation and Cooking Method
12. Keep one cooking action per step
13. Test the normal recipe page and Cooking Mode
14. Test every supported scale
15. Verify practical counts, gram weights, cup equivalents, and override quantities

## Required References

Use together with:

- `docs/ARCHITECTURE.md`
- `docs/INGREDIENT_REFERENCE.md`
- `docs/FEATURE_ROADMAP.md`
