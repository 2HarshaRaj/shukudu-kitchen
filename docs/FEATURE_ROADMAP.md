# Shukudu Kitchen Feature Roadmap

## Purpose

This roadmap records completed functionality and the planned development path for Shukudu Kitchen.

## Current Version - v1.18.10

Shukudu Kitchen currently includes:

- JSON-driven recipe storage
- one recipe file per recipe
- homepage recipe index, search, category filters, meal type filters, and dish type filters
- homepage search aliases for alternate names and regional dish names
- homepage search across relationship metadata such as Cuisine, meal types, dish types, and goes-well-with slugs
- compact homepage relationship chips including the primary dish type
- individual recipe pages with full relationship details, generated base quantity, and curated Pairings links
- ingredient checklists
- sticky section navigation
- Cooking Mode with saved progress
- optional Cooking Mode screen wake-lock support
- structured preparation and cooking steps
- scalable ingredient schema
- rice-cup-first scaling for rice recipes
- exact base-ingredient quantity scaling for supported recipes
- display-only household base metadata on selected recipes
- People × Meals selector for recipes with household base metadata
- per-recipe persistence for household People and Meals selections
- household selector integration with recipe quantity scaling
- practical ingredient rounding and gram guidance
- recipe-specific non-linear scaling overrides
- recipe relationship validation
- recipe pairing validation with warning-only non-reciprocal checks
- household base assumption warning validation for known recipe families
- search alias validation
- phase 1 theme validation
- saved light and dark themes
- installable PWA foundation
- app icons, favicons, Apple touch icon, and social preview image support
- homepage and recipe-page app branding
- Open Graph and Twitter card metadata for large link previews
- dynamic browser theme-color handling

## Completed Feature Groups

### Recipe Data Architecture

- One JSON file per recipe under `data/recipes/`
- Lightweight homepage metadata in `data/recipe-index.json`
- Validation reference data under `data/validation/`
- Stable ingredient IDs and structured steps
- Shared quantities across Ingredients, Preparation, Cooking Method, and Cooking Mode

### Recipe Relationships, Discovery, and Pairings

- Dedicated relationship model documented in `docs/RECIPE_RELATIONSHIPS.md`
- Clear separation between `details` and `relationships`
- `relationships.mealTypes` stores meal classification
- `relationships.dishTypes` stores dish classification
- `relationships.goesWellWith` stores manual curated recipe pairings
- Homepage cards use compact relationship chips: Cuisine, Meal Type, primary Dish Type, and base quantity
- Homepage Meal Type filters use `relationships.mealTypes`
- Homepage Dish Type filters use `relationships.dishTypes`
- Homepage search includes relationship metadata, including dish types
- Recipe pages show full relationship details and generated base quantity
- Recipe pages show display-only household base when recipe metadata includes a `householdBase.label`
- Recipe pages show curated Pairings links when pairings exist
- Main validator enforces relationship metadata
- Main validator warns when known recipe families are missing expected household base metadata
- Pairing validator checks pairing slugs and warns when a pairing is not reciprocal
- Reverse pairing links are not auto-created
- `One Pot` classification rule documented
- Dish Type filter behavior documented in `docs/DISH_TYPE_FILTERS.md`

### Homepage Filtering and Search

- Search filter
- Category dropdown filter
- Meal Type chip filters: All, Breakfast, Lunch, Dinner, Snack, and Side
- Dish Type chip filters generated from existing `relationships.dishTypes`
- Search, category, meal type, and dish type filters work together
- Mobile filter chips scroll horizontally instead of wrapping into a tall block
- `searchAliases` added to `data/recipe-index.json`
- Search includes recipe aliases, relationship fields, and non-common ingredient names
- `docs/SEARCH.md` documents search sources and future search improvements
- `scripts/validate-search.js` validates search alias structure and duplicates

### Recipe Scaling

- Preset scaling controls
- Rice-cup-first canonical base for rice recipes
- Compact rice preset button labels
- Automatic standard cup equivalents
- Exact base-ingredient quantity input
- Arbitrary scale calculation and persistence
- Optional base metadata for generated Recipe Details display
- Optional household base metadata for display-only Recipe Details context
- People × Meals selector UI for recipes with household base metadata
- Per-recipe household People and Meals selection persistence
- Household People × Meals multiplier combined with selected recipe scale for rendered quantities
- Recipe-specific non-linear overrides through `scaleQuantities`
- Required `roundingType` authoring intent for scalable ingredients with quantities
- Display-text-only fixed ingredients protected from accidental scaling
- Optional `referenceQuantity` metadata for gram-based pantry staples
- Unit-aware formatting
- Practical produce and small-whole rounding

### Cooking Mode, Wake Lock, and UI Polish

- Ingredient checklists with saved progress
- Sticky section navigation
- Cooking Mode with step tracking
- Optional screen wake-lock support in Cooking Mode
- Wake-lock control beside the Cooking Mode close button
- Wake lock releases when Cooking Mode closes
- Wake-lock status text below the Cooking Mode title
- SVG-style wake-lock and close icons
- Theme toggle uses SVG-style sun and moon icons
- Native category dropdown closed state uses a custom SVG chevron
- Homepage cards show a selective, calm metadata chip set
- Pairing recipe chips match the existing pill background style in light and dark mode
- Meal Type and Dish Type filter rows follow the same pill visual language
- Dish Type row spacing refined for mobile in `v1.17.1` and layout-only inline styling removed in `v1.17.2`

### Validation Framework

- Automated validation workflow in GitHub Actions
- Node.js 24 validation runtime
- `scripts/validate-recipes.js`
- `scripts/validate-produce-weights.js`
- `scripts/validate-search.js`
- `scripts/validate-recipe-pairings.js`
- `scripts/validate-theme.js`
- Recipe-index and recipe-file cross-checks
- Slug and filename validation
- Ingredient reference validation
- Scaling base ingredient reference validation
- Quantity-input base metadata validation
- Rice recipe unit validation
- Optional household base metadata validation
- Large-produce `weightGrams` validation
- Relationship metadata validation
- Pairing missing-slug validation
- Non-reciprocal pairing warnings
- Search alias validation
- Phase 1 theme guardrails for CSS files, hardcoded colors, shadows, asset versions, and dark-mode overrides

### PWA, Branding, and Social Preview

- `manifest.webmanifest` added
- Installable app metadata added
- Standalone display mode added
- App name and short name standardized to `Shukudu Kitchen`
- App icons, favicons, Apple touch icon, and social preview image metadata added
- Homepage brand icon added
- Recipe page brand icon added
- Dedicated `brand.css` added
- Theme-color metadata updates with the selected theme and page context
- `icons/social-preview.png` added for WhatsApp, Open Graph, and large link previews
- Homepage Open Graph metadata added for title, description, site name, URL, and preview image
- Twitter large-card metadata added for platforms that use Twitter card tags

## Future Features

- Household search/filter support remains future work. Household metadata/display/validation, People × Meals selector persistence, and scaling engine integration are implemented for selected recipes. Design is documented in `docs/HOUSEHOLD_MEAL_SCALING.md`.
- Khara/spice preference mode remains future work for adjusting chilli, green chilli, red chilli powder, and similar heat ingredients when cooking for guests who prefer spicier food, without changing the overall masala profile. Design is documented in `docs/SPICE_PREFERENCE_MODE.md`; implementation is not completed yet.
- Multi-Recipe Cooking Mode for keeping two or more active recipes open while cooking and switching quickly between them without losing each recipe's step progress, ingredient checklist state, or scale. Design is documented in `docs/MULTI_RECIPE_COOKING_MODE.md`; implementation remains future work.
- Cooking timers inside Cooking Mode for timed steps, with optional start, pause, reset controls and saved timer state per recipe step
- Standard cup scaling input
- Print view
- Recipe images
- Direct edit link
- Offline recipe support
- Schema versioning if the recipe model expands significantly
- Optional richer pairing shape with reasons or categories
- Optional non-recipe pairing items such as papad, boondi, pickle, chips, roti, or plain curd if the data model expands

## Future Validation Enhancements

Image metadata validation is deferred because recipe images are not part of the current recipe model yet. The social preview image is site-level branding, not recipe image data.

Possible non-image validation enhancements:

- clean up validator structure
- duplicate ingredient name warning or error
- preparation coverage checks
- cooking method ingredient coverage checks
- stricter CSS/theme validation after more UI components stabilize

Once recipe images are introduced, possible validation checks include:

- image file exists
- image path matches recipe slug
- thumbnail exists
- image format and dimensions are valid
- recipe-index image references remain valid

## Recommended Development Order

1. Ingredient checklists - completed
2. Sticky section navigation - completed
3. Cooking Mode - completed
4. Recipe-per-file architecture - completed
5. Structured recipe steps - completed
6. Ingredient scaling engine - completed for supported recipes
7. Rice cup scaling base - completed
8. Exact base-ingredient quantity scaling - completed
9. Light and dark themes - completed
10. Recipe validation framework - completed for current non-image model
11. PWA foundation and app branding - completed
12. Non-linear ingredient validation - completed
13. ScalingMode consistency validation - completed
14. RoundingType validation - completed
15. DisplayText safety validation - completed
16. Scaling base ingredient reference validation - completed
17. Non-linear config uniqueness validation - completed
18. Rice recipe unit validation - completed
19. Large-produce weightGrams validation - completed
20. Cooking Mode wake lock - completed
21. SVG utility icon and button-state polish - completed
22. Recipe relationships design document - completed
23. Add relationship fields to recipes - completed
24. Update homepage cards to use relationship data - completed
25. Update recipe details rendering for relationship-based meal types - completed
26. Add recipe relationship validation - completed
27. Add generated Base to recipe details - completed
28. Add Meal Type filters - completed
29. Add search aliases and relationship-aware search - completed
30. Document goesWellWith rules before pairings - completed
31. Add curated goesWellWith recipe pairings - completed
32. Add goes-well-with recipe links on recipe pages - completed
33. Add pairing reciprocity warning validation - completed
34. Add social preview image and Open Graph metadata - completed
35. Add UI theme standard and phase 1 theme validator - completed
36. Add dedicated Dish Type filter UI - completed
37. Household meal scaling metadata, display, and validation foundation - completed
38. Household meal scaling People × Meals selector
39. Household meal scaling integration with scaling engine
40. Khara/spice preference mode
41. Multi-Recipe Cooking Mode
42. Cooking timers inside Cooking Mode
43. Clean up validator structure
44. Duplicate ingredient name warning or error
45. Preparation coverage validation
46. Cooking method ingredient coverage validation
47. Print view
48. Recipe images and richer cards
49. Optional standard-cup scaling input
50. Offline recipe support
51. Image metadata validation after recipe images are introduced

## Development Principle

Prioritize features that reduce friction while actively cooking.

The site should remain simple to maintain, fast on mobile, easy to read in the kitchen, compatible with GitHub Pages, and free of unnecessary framework dependencies.
