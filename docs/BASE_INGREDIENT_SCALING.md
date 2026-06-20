# Base-Ingredient Quantity Scaling

## Purpose

Base ingredient metadata identifies the finalized recipe base used for display and, when enabled, exact quantity scaling.

There are two related but different uses:

1. **Base display**: recipe pages can show `Base` from `scaling.baseQuantity` and `scaling.baseUnit`.
2. **Exact quantity input**: some recipes allow the cook to enter the actual amount available, such as 300 g beans or 750 g raw banana.

Base metadata is useful beyond exact quantity input. For example, Tomato Rasam can show `Base: 500 g` even though it still uses normal preset scale buttons.

## Appropriate Use

Use base metadata when one ingredient clearly describes the recipe size.

Examples:

- rice recipes by rice cup
- raw banana palya by raw banana weight
- beans palya by beans weight
- tomato rasam by tomato weight
- dal recipes by total dal weight

Do not force base metadata onto every scalable recipe if it does not improve clarity.

## Recipe Metadata

### Normal scalable recipe with base display

Use this when the base is useful for Recipe Details but the recipe does not need a free-entry quantity box.

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

This shows a generated recipe detail such as:

```text
Base: 500 g
```

### Quantity-input recipe

Use this when the cook should be able to enter the exact amount of the base ingredient available.

```json
"scaling": {
  "enabled": true,
  "baseIngredient": "raw-banana",
  "baseQuantity": 500,
  "baseUnit": "g",
  "baseScale": 1,
  "inputMode": "quantity",
  "inputLabel": "Raw banana quantity",
  "inputMin": 1,
  "inputStep": 1,
  "options": [0.5, 0.75, 1, 1.25, 1.5, 2]
}
```

## Validator Requirements

The validator does **not** require base metadata for every scalable recipe.

Rules:

- when `scaling.baseIngredient` is present, it must match exactly one ingredient `id`
- when `scaling.inputMode` is `quantity`, `baseIngredient` is required
- when `scaling.inputMode` is `quantity`, `baseQuantity` is required and must be a positive number
- when `scaling.inputMode` is `quantity`, `baseUnit` is required
- gram-based quantity recipes must use `baseUnit: "g"`, not `"gram"`
- when `scaling.inputMode` is `quantity`, `inputLabel` must be present and end with `quantity`
- when `scaling.inputMode` is `quantity`, `options` must be `[0.5, 0.75, 1, 1.25, 1.5, 2]`

## Calculation

For exact quantity input:

```text
selected scale = entered quantity ÷ baseQuantity
```

Example:

```text
300 g ÷ 500 g = 0.6×
```

The calculated scale reuses the existing ingredient scaling, non-linear overrides, practical rounding, persistence, and Cooking Mode logic.

## Controls

Quantity-input recipes may show both:

- preset buttons for common quantities
- an exact quantity input for the amount actually available

For a 500 g base, the standard presets display as:

```text
250 g, 375 g, 500 g, 625 g, 750 g, 1,000 g
```

An exact value such as 300 g produces a 0.6× scale.

Normal scalable recipes without `inputMode: "quantity"` use preset options only.

Rice quantity preset buttons may use compact `cup/cups` labels in the UI to reduce width:

```text
½ cup, ¾ cup, 1 cup, 1¼ cups, 1½ cups, 2 cups
```

The current selected value remains fully descriptive:

```text
Current: 1¼ rice cups
```

This keeps the UI compact without changing the underlying rice-cup-first data model.

## Persistence

The resulting scale is stored using the existing key:

```text
shukudu-kitchen:<slug>:scale
```

Quantity-input recipes may persist arbitrary positive scale values, not only values listed in `scaling.options`.

## Boundaries

Use exact quantity input when:

- one ingredient clearly drives recipe size
- recipe composition stays the same
- supporting ingredients can reasonably scale from that quantity

For mixed-vegetable recipes, total-weight scaling is appropriate only when the vegetable proportions remain broadly similar.

Automatic scaling must not decide:

- substitutions
- missing vegetables
- major proportion changes
- which vegetable should dominate
- method changes caused by a different vegetable mix

Those are recipe-composition decisions and should be handled separately.
