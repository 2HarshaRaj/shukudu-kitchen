# Dish Type Filters

## Purpose

Dish Type filters let the homepage browse recipes by `relationships.dishTypes` metadata.

They sit beside the existing Meal Type filters and help answer questions like:

- show rice recipes
- show dal recipes
- show one-pot recipes
- show bath recipes

## Data Source

Dish Type filters are generated from full recipe JSON files:

```json
"relationships": {
  "dishTypes": ["Rice", "Bath", "One Pot"]
}
```

The filter UI does not maintain a separate hardcoded dish type list. It reads the available dish types from recipes, removes duplicates, and sorts them alphabetically after `All`.

## Filtering Behavior

Homepage filtering now combines:

```text
search + category + meal type + dish type
```

A recipe appears only when it matches all active filters.

Examples:

- `Lunch` + `Rice` shows recipes that are both lunch recipes and rice recipes.
- `Dinner` + `Dal` shows dinner recipes tagged as dal.
- `All` dish type keeps dish type filtering disabled.

## UI Behavior

The Dish Type filter row uses the same pill style as the Meal Type filter row.

Rules:

- inactive pills use the normal neutral filter style
- active pill uses the accent selected style
- the Dish Type row has extra spacing below Meal Type so the headings and pills do not feel cramped on mobile
- mobile rows scroll horizontally like Meal Type filters

## Version

Added in `v1.17.0`.

Spacing refined in `v1.17.1`.
