# Shukudu Kitchen Recipe Relationships

## Purpose

Recipe relationships define how a recipe connects to meals, dish types, and other recipes.

This document exists so relationship-style data stays consistent as the recipe library grows. It should be used before adding meal filters, dish filters, pairing suggestions, or menu-planning features.

## Core Principle

Separate human-facing metadata from structured relationship data.

```text
details = human-facing recipe metadata
relationships = structured discovery, filtering, and pairing metadata
```

`details` should describe the recipe on the recipe page. `relationships` should help the website understand how the recipe connects to use cases and other recipes.

## Current Standard Structure

Use this structure for recipes:

```json
{
  "details": {
    "Cuisine": "South Indian · Karnataka",
    "Status": "Finalized"
  },
  "relationships": {
    "mealTypes": ["Lunch", "Dinner"],
    "dishTypes": ["Rice", "Bath", "One Pot"],
    "goesWellWith": []
  }
}
```

`Meal Type` must not be stored inside `details`. Meal classification belongs in `relationships.mealTypes`.

## Why `Meal Type` Belongs in `relationships`

The old field:

```json
"details": {
  "Meal Type": "Lunch / Dinner"
}
```

was good display text, but weak structured data.

Problems:

- it stored multiple values in one string
- it was harder to filter reliably
- it was harder to build homepage chips from it
- it was harder to use for recipe pairing
- it behaved like text, not an Anytype-style relationship

The structured version:

```json
"relationships": {
  "mealTypes": ["Lunch", "Dinner"]
}
```

is better because each value is separate and can be used safely for filtering, cards, search, and pairing logic.

## Relationship Fields

### `mealTypes`

Purpose: when the recipe is commonly eaten.

Type: array of strings.

Allowed values:

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
"mealTypes": ["Lunch", "Dinner", "Side"]
```

### `dishTypes`

Purpose: what kind of dish the recipe is.

Type: array of strings.

Allowed values:

```text
Rice
Bath
Palya
Rasam
Dal
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
"dishTypes": ["Rice", "Bath", "One Pot"]
```

```json
"dishTypes": ["Palya", "Side Dish"]
```

```json
"dishTypes": ["Rasam"]
```

```json
"dishTypes": ["Dal", "Side Dish"]
```

### `One Pot` Rule

Use `One Pot` only when the rice or main ingredient cooks directly with the masala in the same vessel.

```text
One Pot = rice/main ingredient cooks directly with the masala in the same vessel.
Not One Pot = rice is cooked separately, cooled/rested, then mixed into masala later.
```

Current examples:

```text
Tomato Bath: Rice / Bath / One Pot
Menthya Rice Bath: Rice / Bath / One Pot
Bisi Bele Bath: Rice / Bath / One Pot
Vangi Bath: Rice / Bath
Curd Rice: Rice / Curd Rice
Palya: Palya / Side Dish
Rasam: Rasam
Dal Tadka: Dal / Side Dish
```

### `goesWellWith`

Purpose: curated recipe pairings.

Type: array of recipe slugs.

Initial value:

```json
"goesWellWith": []
```

The field should stay present even when a recipe has no curated pairings yet.

Currently supported shape:

```json
"goesWellWith": ["beans-palya", "balekai-palya"]
```

Rules:

- use recipe slugs only
- use only slugs that exist in `data/recipes/`
- do not self-reference the current recipe
- do not mass-link every technically related recipe
- pairings should be curated and useful
- prefer pairings the user would realistically cook or serve together
- keep the list small; usually 1-5 pairings is enough
- keep pairings manual
- do not auto-create reverse links
- pairings may be one-way if intentionally useful
- the validator warns, but does not fail, when a pairing is not reciprocal

Good examples:

```text
Dal Tadka -> jeera rice or another existing rice recipe when useful
Bisi Bele Bath -> curd rice, if both recipes exist and the pairing is intentional
Rasam -> palya recipes, when the pairing is intentionally useful
Palya -> curd rice, rasam, or dal recipes when the pairing is intentionally useful
```

For the current site, only link to recipes that already exist in the repo. Do not add plain foods like `roti`, `boondi`, `pickle`, `papad`, `chips`, or `plain curd` to `goesWellWith` until they exist as recipes or the field is expanded to support non-recipe serving items.

A future richer shape may be introduced later if reasons, pairing categories, or non-recipe serving items are needed.

Possible future richer shape:

```json
"goesWellWith": [
  {
    "slug": "tomato-rasam",
    "reason": "Balances dry palya with rice and rasam",
    "type": "meal-pairing"
  }
]
```

Do not use the richer shape yet. Current validators expect an array of slugs.

## UI Usage

### Homepage Cards

Homepage recipe cards should stay compact.

Show:

```text
Cuisine + Meal Type + primary Dish Type + base quantity
```

Example:

```text
South Indian · Karnataka   Lunch   Dinner   Rice   1 rice cup base
```

For a recipe with multiple dish types, homepage cards show only the first dish type. The full relationship data remains in JSON for search, filters, and recipe-page details.

### Recipe Page Details

Recipe pages should show full recipe details.

Example:

```text
Cuisine: South Indian · Karnataka
Status: Finalized
Meal Type: Lunch / Dinner
Dish Type: Rice / Bath / One Pot
Base: 1 rice cup
```

`Base` is generated from `scaling.baseQuantity` and `scaling.baseUnit`, not from manual display text.

### Recipe Page Pairings

Recipe pages show a `Pairings` section when `relationships.goesWellWith` contains existing recipe slugs.

The section should remain curated and small. It should not become a complete reverse lookup of every technically related dish.

### Search

Homepage search includes relationship metadata.

This means search should match values such as:

```text
Lunch
Dinner
Palya
Rasam
One Pot
South Indian
Karnataka
```

Search also includes `relationships.goesWellWith` slugs. Searching for a related recipe slug may surface recipes that link to it.

## Validation Standard

`node scripts/validate-recipes.js` enforces core relationship shape:

- `relationships` exists as an object
- `relationships.mealTypes` is a non-empty array
- every `mealTypes` value is allowed
- duplicate `mealTypes` values are rejected
- `relationships.dishTypes` is a non-empty array
- every `dishTypes` value is allowed
- duplicate `dishTypes` values are rejected
- `relationships.goesWellWith` is an array
- `goesWellWith` values use slug format
- `goesWellWith` must not self-reference the current recipe
- `details` requires `Cuisine` and `Status`
- `details["Meal Type"]` is no longer part of the recipe data standard

`node scripts/validate-recipe-pairings.js` enforces pairing-specific quality checks:

- missing `goesWellWith` recipe slugs are errors
- non-reciprocal pairings are warnings only
- warnings do not fail the workflow
- reverse pairings are not automatically created

Code may keep a legacy display fallback for older data, but new and current recipe JSON should use `relationships` as the source of truth.

## Implementation Status

Completed:

1. Relationship model documented.
2. `relationships` added to every recipe JSON.
3. Meal type data moved from `details["Meal Type"]` to `relationships.mealTypes`.
4. `relationships.dishTypes` added for discovery.
5. Empty `relationships.goesWellWith` arrays added.
6. Homepage cards updated to use relationship data.
7. Recipe page details updated to show relationship data and generated base quantity.
8. Validator updated to enforce relationship metadata.
9. Old `details["Meal Type"]` removed from recipe JSON.
10. `Dal` added as a supported dish type for North Indian dal recipes.
11. Homepage Meal Type filters added.
12. Homepage search updated to include relationship metadata.
13. Curated recipe pairings added for selected recipes.
14. Recipe pages now display curated `Pairings` links.
15. Pairing validator added with warning-only checks for non-reciprocal links.

Future:

- dish type filters
- optional richer pairing shape with reasons or categories
- support for non-recipe serving items if needed later

## Design Boundary

Relationships should improve discovery without turning the homepage into a dense dashboard.

Good:

```text
South Indian · Karnataka   Lunch   Dinner   Rice   1 rice cup base
```

Too much:

```text
South Indian   Karnataka   Lunch   Dinner   Weekday   Rice   Bath   One Pot   Spicy   Medium Time   Pressure Cooker   Cooking Mode Ready
```

Keep relationship data structured, but keep the card UI selective and calm.
