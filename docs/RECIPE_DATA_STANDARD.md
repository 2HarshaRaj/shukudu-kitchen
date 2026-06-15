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
  "baseUnit": "gram",
  "baseScale": 1,
  "inputMode": "quantity",
  "inputLabel": "Raw banana available",
  "inputMin": 50,
  "inputStep": 10
}
```

### Scaling Metadata Fields

- `baseIngredient`: stable ingredient ID used as the scaling reference
- `baseQuantity`: finalized recipe quantity of the base ingredient at 1×
- `baseUnit`: canonical unit used for the base quantity, such as `riceCup`, `gram`, or `count`
- `baseScale`: multiplier represented by the stored recipe quantities; normally `1`
- `inputMode`: scaling UI mode; use `options` for preset multipliers or quantities, and `quantity` for direct base-ingredient entry
- `inputLabel`: user-facing label shown beside the exact quantity input
- `inputMin`: smallest supported input quantity
- `inputStep`: practical increment used by the quantity input control
- `options`: supported preset scale values when `inputMode` is `options`

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
6. Choose `inputMode: "options"` or `inputMode: "quantity"`
7. For quantity input, define `inputLabel`, `inputMin`, and `inputStep`
8. Confirm that exact quantity input is suitable for the recipe composition
9. Choose practical recipe-level scale options when using preset mode
10. Mark each ingredient scalable or non-scalable
11. Use `scaleQuantities` where linear scaling is unsuitable
12. Ensure override keys cover every recipe scale option
13. Use stable ingredient IDs
14. Reference ingredient IDs from Preparation and Cooking Method
15. Keep one cooking action per step
16. Test the normal recipe page and Cooking Mode
17. Test every supported preset and arbitrary quantity scale
18. Verify cup, spoon, inch, produce, gram, and override formatting
19. Verify the entered quantity and arbitrary scale restore correctly after reload

## Required References

Use together with:

- `docs/ARCHITECTURE.md`
- `docs/INGREDIENT_REFERENCE.md`
- `docs/FEATURE_ROADMAP.md`
- `docs/BASE_INGREDIENT_SCALING.md`
