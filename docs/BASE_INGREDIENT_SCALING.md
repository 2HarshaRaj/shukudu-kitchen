# Base-Ingredient Quantity Scaling

## Purpose

Some recipes are most naturally scaled from the exact amount of one main ingredient available.

Examples:

- raw banana palya by raw banana weight
- beans palya by beans weight
- tomato-based recipes by tomato weight when explicitly designed that way

## Recipe Metadata

Quantity-input recipes must use this metadata shape:

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

Validator requirements:

- `baseIngredient` must match exactly one ingredient `id`
- `baseQuantity` must be a positive number
- gram-based quantity recipes must use `baseUnit: "g"`, not `"gram"`
- `inputLabel` must be present and end with `quantity`
- `options` must be `[0.5, 0.75, 1, 1.25, 1.5, 2]`

## Calculation

```text
selected scale = entered quantity ÷ baseQuantity
```

Example:

```text
300 g ÷ 500 g = 0.6×
```

The calculated scale reuses the existing ingredient scaling, non-linear overrides, practical rounding, persistence, and Cooking Mode logic.

## Controls

Recipes may show both:

- preset buttons for common quantities
- an exact quantity input for the amount actually available

For a 500 g base, the standard presets display as:

```text
250 g, 375 g, 500 g, 625 g, 750 g, 1,000 g
```

An exact value such as 300 g produces a 0.6× scale.

## Persistence

The resulting scale is stored using the existing key:

```text
shukudu-kitchen:<slug>:scale
```

Quantity-input recipes may persist arbitrary positive scale values, not only values listed in `scaling.options`.

## Appropriate Use

Use this model when:

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
