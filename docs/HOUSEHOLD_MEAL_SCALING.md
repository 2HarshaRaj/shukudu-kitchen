# Household Meal Scaling

## Purpose

Generic labels such as "serves 4" are not accurate enough for this cookbook. Shukudu Kitchen recipes should be able to describe practical household references that match how the recipe is actually cooked and reused.

Instead of relying only on universal serving labels, future household scaling should support recipe-specific references such as:

- 2 people × 2 meals
- 2 people × 1 meal
- 1 person × 1 meal

These references are intended to answer practical questions such as whether a cooked batch is enough for one lunch, lunch plus dinner, or leftovers for the next meal.

## Philosophy

Household scaling is practical, not universal. A "meal" can vary by recipe, person, side dishes, appetite, and whether the food is a main dish, side dish, breakfast, snack, or leftover-friendly batch.

Each recipe can have its own household base. For example, one recipe may naturally start from a rice-cup quantity that feeds 2 people for 2 meals, while another recipe may have a much smaller base intended for 2 people for 1 meal.

Existing rice-cup scaling remains unchanged. Exact quantity scaling also remains unchanged. Household scaling is an additional layer on top of the existing scaling model, not a replacement for the current rice-cup-first or exact base-ingredient quantity behavior.

## Household Base Metadata

A future recipe may optionally declare household base metadata. This is only a proposed future shape and should not be treated as implemented schema yet.

```json
"householdBase": {
  "people": 2,
  "meals": 2,
  "note": "User household reference"
}
```

The metadata would describe the practical household meaning of the recipe's current base quantity. Recipes without this metadata would continue to use only the existing scaling controls.

## Examples

### Tomato Bath

- Base quantity: 1 rice cup
- Household base: 2 people × 2 meals

### Curd Rice

- Base quantity: 0.25 rice cup
- Household base: 2 people × 1 meal

### Punjabi Dal Tadka

- Base quantity: total dal weight
- Household base: 2 people × 2 meals

### Muesli

- Household base may be breakfasts instead of lunch/dinner meals, so it may need recipe-specific wording later.

## Multiplier Logic

The basic household multiplier can be calculated as:

```text
selected multiplier =
requested people × requested meals
 divided by
base people × base meals
```

Examples:

- Base: 2 people × 2 meals
- Request: 2 people × 1 meal
- Multiplier: 0.5×

- Base: 2 people × 2 meals
- Request: 4 people × 2 meals
- Multiplier: 2×

This formula is a starting point. Recipe-specific exceptions may still be needed for ingredients that do not scale linearly, recipes with side-dish assumptions, or recipes where leftovers behave differently from freshly cooked portions.

## Future UI

Possible future Recipe Details display:

- Base
- Household Base

Possible future selector:

- People
- Meals

The selected household scaling should persist per recipe, similar to the existing scale persistence. Returning to a recipe should restore the household selection when that recipe supports household scaling.

## Validation Future

Future validation could check that:

- `householdBase.people` is positive
- `householdBase.meals` is positive
- `householdBase` wording is present when needed
- household scaling is only shown when metadata exists

## Implementation Order

1. Document household model
2. Add optional metadata to recipe schema
3. Show Household Base in Recipe Details
4. Add people × meals selector
5. Persist household selection
6. Combine with existing scaling engine
7. Add validation
