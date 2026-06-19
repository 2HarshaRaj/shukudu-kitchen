# Shukudu Kitchen Recipe Relationships

## Purpose

Recipe relationships define how a recipe connects to meals, dish types, and other recipes.

This document exists so relationship-style data stays consistent as the recipe library grows. It should be used before adding pairing, richer homepage discovery, or menu-planning features.

## Core Principle

Separate display metadata from structured relationship data.

```text
details = human-facing recipe metadata
relationships = structured discovery, filtering, and pairing metadata
```

`details` should describe the recipe on the recipe page. `relationships` should help the website understand how the recipe connects to use cases and other recipes.

## Target Structure

Use this structure for new and migrated recipes:

```json
{
  "details": {
    "Cuisine": "South Indian",
    "Status": "Finalized"
  },
  "relationships": {
    "mealTypes": ["Lunch", "Dinner"],
    "dishTypes": ["Rice"],
    "goesWellWith": []
  }
}
```

## Why `Meal Type` Moves Out of `details`

The old field:

```json
"details": {
  "Meal Type": "Lunch / Dinner"
}
```

is good display text, but weak structured data.

Problems:

- it stores multiple values in one string
- it is harder to filter reliably
- it is harder to build homepage chips from it
- it is harder to use for recipe pairing
- it behaves like text, not an Anytype-style relationship

The structured version:

```json
"relationships": {
  "mealTypes": ["Lunch", "Dinner"]
}
```

is better because each value is separate and can be used safely for filtering, cards, and future pairing logic.

## Relationship Fields

### `mealTypes`

Purpose: when the recipe is commonly eaten.

Type: array of strings.

Allowed values for now:

```text
Breakfast
Lunch
Dinner
Snack
Side
```

Rules:

- use an array even when there is only one value
- do not combine values with `/`, `,`, or `and`
- use title case
- keep values broad and practical

Examples:

```json
"mealTypes": ["Lunch", "Dinner"]
```

```json
"mealTypes": ["Side"]
```

### `dishTypes`

Purpose: what kind of dish the recipe is.

Type: array of strings.

Allowed starting values:

```text
Rice
Bath
Palya
Rasam
Curd Rice
Side Dish
One Pot
```

Rules:

- use an array even when there is only one value
- keep values recipe-discovery focused, not overly technical
- prefer stable broad types over too many narrow labels
- a recipe may have more than one dish type only when it genuinely helps discovery

Examples:

```json
"dishTypes": ["Rice", "Bath"]
```

```json
"dishTypes": ["Palya", "Side Dish"]
```

```json
"dishTypes": ["Rasam"]
```

### `goesWellWith`

Purpose: curated recipe pairings.

Type: array.

Initial value:

```json
"goesWellWith": []
```

The field is intentionally present from the beginning but may stay empty until pairing is designed.

Future supported shape may be either simple slugs:

```json
"goesWellWith": ["tomato-rasam", "beans-palya"]
```

or richer objects:

```json
"goesWellWith": [
  {
    "slug": "tomato-rasam",
    "reason": "Good rasam pairing for a rice meal."
  }
]
```

Do not mass-link every technically related recipe. Pairings should be curated and useful.

## Current Migration Rule

During migration, recipe files may temporarily have both:

```json
"details": {
  "Cuisine": "South Indian",
  "Meal Type": "Lunch / Dinner",
  "Status": "Finalized"
}
```

and:

```json
"relationships": {
  "mealTypes": ["Lunch", "Dinner"],
  "dishTypes": ["Rice"],
  "goesWellWith": []
}
```

After all recipe JSON files, UI rendering, and validation are updated, `details["Meal Type"]` should be removed.

## UI Usage

Homepage recipe cards should prefer relationship data:

```text
Cuisine chip -> details.Cuisine
Meal chips -> relationships.mealTypes
Dish/base chips -> relationships.dishTypes and scaling metadata where useful
```

Fallback behavior during migration:

1. Use `relationships.mealTypes` if present.
2. Otherwise split `details["Meal Type"]` only for display.
3. Do not treat split display fallback as the long-term data model.

## Recipe Page Usage

Recipe pages may continue to show human-friendly labels:

```text
Cuisine: South Indian
Meal Type: Lunch, Dinner
Status: Finalized
```

But the source for `Meal Type` should eventually be `relationships.mealTypes`, not `details["Meal Type"]`.

## Validation Direction

The validator should eventually enforce:

- `relationships` exists as an object
- `relationships.mealTypes` is a non-empty array
- every `mealTypes` value is allowed
- `relationships.dishTypes` is a non-empty array
- every `dishTypes` value is allowed
- `relationships.goesWellWith` is an array
- `details["Meal Type"]` is not used after migration is complete

## Development Order

Recommended implementation order:

1. Document this relationship model.
2. Add `relationships` to every existing recipe JSON.
3. Update homepage cards to use `relationships.mealTypes` and `relationships.dishTypes`.
4. Update recipe page details rendering to display meal types from `relationships`.
5. Update validator to require the relationship model.
6. Remove `details["Meal Type"]` once the migration is complete.
7. Add curated `goesWellWith` pairings later.

## Design Boundary

Relationships should improve discovery without turning the homepage into a dense dashboard.

Good:

```text
South Indian   Lunch   Dinner   Rice   1 rice cup base
```

Too much:

```text
South Indian   Karnataka   Lunch   Dinner   Weekday   Rice   Bath   One Pot   Spicy   Medium Time   Pressure Cooker   Cooking Mode Ready
```

Keep relationship data structured, but keep the card UI selective and calm.
