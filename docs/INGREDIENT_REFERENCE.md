# Shukudu Kitchen Ingredient Reference

## Purpose

This document provides standard reference weights and practical display guidance for commonly used ingredients in Shukudu Kitchen.

These values are defaults for recipe authoring and scaling. A specific recipe may override them when an ingredient is unusually large, small, dense, or otherwise different from the standard reference.

## Core Principle

```text
Count or household measure = practical guidance
Grams = precise scaled target
```

Use the reference values below when a recipe does not provide a better measured value.

## Common Reference Weights

| Ingredient | Practical measure | Reference weight |
|---|---:|---:|
| Fresh ginger | 1 inch piece | 15 g |
| Garlic | 1 clove | 3 g |
| Medium onion | 1 medium | 120 g |
| Medium tomato | 1 medium | 100 g |
| Small lemon | 1 small | 60 g |

## Usage Examples

### Ginger

```json
{
  "id": "ginger",
  "quantity": 1,
  "unit": "inch",
  "weightGrams": 15,
  "ingredient": "ginger",
  "preparation": "finely grated",
  "scalable": true,
  "roundingType": "exact"
}
```

Rendered at 1×:

```text
1 inch ginger (15 g), finely grated
```

Rendered at 1.5×:

```text
1½ inches ginger (23 g), finely grated
```

### Garlic

```json
{
  "id": "garlic",
  "quantity": 5,
  "countLabel": "garlic clove",
  "weightGrams": 15,
  "ingredient": "garlic",
  "preparation": "finely chopped",
  "scalable": true,
  "roundingType": "small-whole"
}
```

### Tomato

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

### Onion

```json
{
  "id": "onion",
  "quantity": 1,
  "countLabel": "medium onion",
  "weightGrams": 120,
  "ingredient": "onion",
  "preparation": "sliced",
  "scalable": true,
  "roundingType": "large-produce"
}
```

## Rounding Guidance

### Large Produce

Examples:

- tomato
- onion
- potato
- brinjal
- capsicum
- carrot

Rules:

- round displayed count to a practical whole number
- keep grams as the precise target
- round grams to the nearest whole gram
- use a whole-number range when one count would be misleading

### Small Whole Ingredients

Examples:

- garlic cloves
- green chilli
- lemon
- curry leaves

Rules:

- prefer practical half or whole counts
- keep grams as the precise target when available
- for weights below 10 g, display to the nearest 0.5 g
- for weights of 10 g or more, display to the nearest whole gram

### Exact Measured Ingredients

Examples:

- rice
- water
- oil
- spice powders
- teaspoons
- tablespoons
- cups

Rules:

- preserve readable fractions where practical
- append grams only when `weightGrams` is intentionally provided

## Override Rule

Use the recipe-specific measured value instead of this reference when:

- the ingredient is unusually large or small
- the recipe was tested with a known gram quantity
- the ingredient variety materially changes weight
- count and gram values were directly measured while cooking

Example:

```text
Reference: 1 medium tomato = 100 g
Recipe-specific: 2 medium tomatoes = 180 g
```

The recipe-specific value takes priority.

## Authoring Checklist

Before adding common ingredient weights:

1. Use this document as the default reference
2. Prefer recipe-specific measured values when available
3. Add `weightGrams` only when gram display is useful
4. Choose the correct `roundingType`
5. Confirm the rendered count remains practical at all supported scales
6. Confirm gram values scale and round correctly

## Required References

Use together with:

- `docs/RECIPE_DATA_STANDARD.md`
- `docs/ARCHITECTURE.md`
- `docs/FEATURE_ROADMAP.md`
