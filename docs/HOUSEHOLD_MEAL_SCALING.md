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

Recipes may optionally declare household base metadata when the recipe's practical household base is reasonably known.

```json
"householdBase": {
  "people": 2,
  "meals": 2,
  "label": "2 people × 2 meals"
}
```

The metadata describes the practical household meaning of the recipe's current base quantity. The `label` field is used for human-readable display in Recipe Details.

PR 1 scope was intentionally limited to:

- optional `householdBase` metadata on recipes where the base is known
- display-only `Household Base` in Recipe Details when `householdBase.label` exists
- validation for the optional metadata shape

Recipes without this metadata continue to use only the existing scaling controls. PR 2 added the People × Meals selector and per-recipe persistence only. PR 3 connects that selector to the existing recipe scaling engine. Household search and filters remain future work.

## Current Household Base Assumptions

Current known household bases use practical recipe-family assumptions:

- 1 rice cup rice/bath recipes generally use a household base of 2 people × 2 meals.
- 500 g Palya recipes use a household base of 2 people × 2 meals.
- Curd Rice at a 0.25 rice cup base uses a household base of 2 people × 1 meal.
- Muesli is intentionally excluded until breakfast-specific and batch scaling are designed.
- Rustic rasam remains pending confirmation and should not receive household base metadata yet.

The recipe validator warns, but does not fail, when these known recipe families are missing the expected `householdBase` metadata or use a different People × Meals base. These warnings are guidance for currently known assumptions only; muesli and rustic rasam are explicitly excluded from the warning checks.

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

The household multiplier is calculated as:

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

The recipe page combines this household multiplier with the selected recipe scale before rendering quantities:

```text
effectiveScale = selectedRecipeScale × householdMultiplier
```

The existing recipe scale selector remains unchanged and continues to display the selected recipe scale. Rendered ingredient quantities, preparation quantities, cooking method quantities, and Cooking Mode quantities that come from the normal render path use the effective scale. Recipe-specific exceptions may still be needed for ingredients that do not scale linearly, recipes with side-dish assumptions, or recipes where leftovers behave differently from freshly cooked portions.

## Selector UI and Persistence

Recipes with `householdBase` metadata show a Household selector below the Recipe Details base information. The selector includes simple pill buttons for:

- People: 1, 2, 3, 4
- Meals: 1, 2, 3

The initial selection comes from the recipe's `householdBase.people` and `householdBase.meals` values. The selected household choice persists per recipe using local storage and is restored when returning to the same recipe.

The selector saves the selected People and Meals values per recipe. When either value changes, the recipe re-renders with the same selected recipe scale and applies the updated household multiplier to rendered quantities.

## Validation

Hard validation applies only to the optional metadata shape when `householdBase` is present:

- `householdBase.people` is positive
- `householdBase.meals` is positive
- `householdBase.label` is a non-empty string
- `householdBase.label` includes the people and meals numbers in readable form

Known recipe-family household assumptions are warning-only checks. Missing or different `householdBase` metadata for 500 g Palya recipes, 1 rice cup rice/bath recipes, and the Curd Rice 0.25 rice cup base should be reviewed, but those warnings do not block validation.

## Future Implementation Order

1. Document household model
2. Add optional metadata to recipe schema - completed in PR 1
3. Show household base in Recipe Details - completed in PR 1
4. Add validation - completed in PR 1
5. Add people × meals selector - completed in PR 2
6. Persist household selection - completed in PR 2
7. Combine with existing scaling engine - completed in PR 3
8. Add household search and filters if needed
