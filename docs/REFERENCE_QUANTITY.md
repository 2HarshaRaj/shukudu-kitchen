# Reference Quantity Metadata

`referenceQuantity` is optional display metadata for ingredients whose source-of-truth quantity is stored in another unit, especially grams, but where a cup or spoon reference helps during cooking.

This document is an extension of `docs/RECIPE_DATA_STANDARD.md`. Use it together with the main recipe data standard when adding gram-based pantry staples that need cup or spoon guidance.

## Purpose

Use `referenceQuantity` when an ingredient is measured accurately in grams but commonly understood in cups or spoons.

Examples:

- dal measured in grams, with cup reference
- rice or flour measured in grams, with cup reference
- pantry staples where household measurement context is useful

Do not use it for vegetables, fresh herbs, chillies, garlic, ginger, lemon, or count-based fresh ingredients. For those, use grams, `countLabel`, and `weightGrams` as appropriate.

## Structure

```json
{
  "id": "toor-dal",
  "quantity": 100,
  "unit": "g",
  "ingredient": "toor dal",
  "referenceQuantity": {
    "quantity": 0.5,
    "unit": "cup",
    "approx": true
  },
  "scalable": true,
  "roundingType": "exact"
}
```

## Display Rule

The main `quantity` and `unit` remain the source of truth. `referenceQuantity` is display-only.

At 1×:

```text
Toor dal – 100 g (≈ ½ cup)
```

At 2×:

```text
Toor dal – 200 g (≈ 1 cup)
```

At 0.5×:

```text
Toor dal – 50 g (≈ ¼ cup)
```

The same formatter is used for the Ingredients list, Preparation, Cooking Method, and Cooking Mode.

## Validation

When present, `referenceQuantity` must be an object with:

- `quantity`: positive number
- `unit`: non-empty string
- `approx`: optional boolean

The validator currently prints warnings, not errors, when a scalable gram-based pantry staple is missing `referenceQuantity`.

Current warning terms use whole-word matching for:

```text
rice, dal, poha, avalakki, rava, sooji, flour, besan
```

Warnings can be converted to errors later after current recipes are stable.
