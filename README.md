# Shukudu Kitchen

Recipes refined through real cooking.

## Current Version

`v1.18.4`

## Overview

Shukudu Kitchen is a lightweight public recipe website built with HTML, CSS, JavaScript, and JSON. It is designed as a practical cooking-ready cookbook rather than a static archive of copied recipes.

Current highlights:

- rice-cup-first scaling for rice recipes
- exact base-ingredient quantity scaling for supported recipes
- practical ingredient rounding and gram guidance
- structured recipe relationships for meal types, dish types, and curated pairings
- homepage search, category filters, meal type filters, and dish type filters
- compact homepage relationship chips
- full recipe-page relationship details with generated base quantity
- curated Pairings links between recipes
- mobile-friendly Cooking Mode with saved progress
- optional Cooking Mode screen wake-lock support
- saved light and dark themes
- installable Progressive Web App support
- app-style branding and Open Graph social preview metadata

## Main Features

- Recipe cards with search, category filters, meal type filters, and dish type filters
- Homepage search across recipe name, summary, aliases, relationship metadata, and non-common ingredients
- One JSON file per recipe under `data/recipes/`
- Lightweight homepage metadata in `data/recipe-index.json`
- Ingredient checklists with saved progress
- Sticky section navigation
- Cooking Mode with step tracking
- Scalable ingredients with per-recipe persistence
- Rice-cup-first display for rice recipes
- Exact base-ingredient quantity input for supported recipes
- Structured recipe relationship model documented in `docs/RECIPE_RELATIONSHIPS.md`
- Dish Type filter behavior documented in `docs/DISH_TYPE_FILTERS.md`
- Reference quantity metadata documented in `docs/REFERENCE_QUANTITY.md`
- Search alias rules documented in `docs/SEARCH.md`
- UI theme rules documented in `docs/UI_THEME_STANDARD.md`
- Static asset versioning documented in `docs/STATIC_ASSET_VERSIONING.md`
- Technical debt and formatter cleanup notes tracked in `docs/TECHNICAL_DEBT.md`
- Social preview image and metadata for large link previews
- Automated validation through GitHub Actions
- Theme validation through `scripts/validate-theme.js`

## Project Structure

Main files include data recipes, docs, icons, validation scripts, index.html, recipe.html, script.js, recipe.js, recipe-scaling.js, homepage-filters.css, theme files, brand.css, style.css, and CHANGELOG.md.

## Recipe Relationships

Recipe relationships separate display metadata from discovery data.

details = human-facing recipe metadata
relationships = structured discovery, filtering, and pairing metadata

Homepage cards show a compact subset: Cuisine, Meal Type, primary Dish Type, and base quantity.

Homepage filtering combines search + category + meal type + dish type.

Meal Type filters use `relationships.mealTypes`. Dish Type filters use `relationships.dishTypes`. Recipe pages show the full relationship details, generated base quantity, and curated Pairings recipe links when pairings exist.

## Validation

The GitHub Actions workflow is named Validate Recipes and runs recipe validation, produce weight validation, search validation, pairing validation, and theme validation.

The recipe validators enforce recipe structure, recipe-index consistency, relationships, scaling rules, pairing links, search aliases, produce weights, and theme guardrails.
