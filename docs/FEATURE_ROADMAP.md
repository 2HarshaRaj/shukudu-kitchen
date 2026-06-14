# Shukudu Kitchen Feature Roadmap

## Purpose

This roadmap records completed functionality and the planned development path for Shukudu Kitchen.

## Current Version — v1.7.0

Shukudu Kitchen currently includes:

- JSON-driven recipe storage
- One recipe file per recipe
- Lightweight homepage recipe index
- Homepage with recipe cards
- Search by recipe name, category, and summary
- Category filtering
- Individual recipe pages
- Anytype-inspired recipe layout
- Mobile-responsive styling
- Functional ingredient checkboxes
- Sticky pill-style section navigation
- Cooking Mode
- Cooking progress persistence
- Step completion tracking
- Structured preparation and cooking steps
- Bullet rendering in recipe pages and Cooking Mode
- Scalable ingredient schema
- Live scale controls with per-recipe persistence
- Practical rounding for whole produce and small whole ingredients
- Optional gram display for count-based and unit-based ingredients
- Ingredient reference standards
- Rice-cup-first scaling architecture for rice recipes
- Automatic standard cup equivalents for rice and rice-cooking water
- Recipe-aware scale controls for rice and non-rice recipes
- Explicit rice scaling metadata using `baseIngredient`, `baseQuantity`, and `baseUnit`
- Three initial recipes:
  - Tomato Bath
  - Vangi Bath
  - Curd Rice

## Completed Features

### Functional Ingredient Checkboxes — Completed

Implemented behaviour:

- Tap an ingredient to mark it complete
- Completed ingredients are dimmed and struck through
- Checklist state is saved in the browser using `localStorage`
- Checklist state is stored separately for each recipe
- A `Reset ingredients` action clears the checklist
- Ingredient rows use larger mobile-friendly tap targets

### Sticky Section Navigation — Completed

Implemented behaviour:

- Sticky pill-style navigation on recipe pages
- Tap a section to scroll to it
- Active section highlighting while scrolling
- Horizontal scrolling on narrow screens
- Mobile-active pill positioning
- Stable section tracking without flicker

### Cooking Mode — Completed

Implemented behaviour:

- One preparation or cooking step at a time
- Large mobile-friendly text
- Previous, Next, and Finish controls
- Step number and progress bar
- Resume current step using `localStorage`
- Mark individual steps complete
- Persistent completed-step state
- Clear exit back to the full recipe
- Mobile-safe bottom controls above browser navigation UI

Step-specific ingredient display was removed from the plan because cooking instructions already repeat exact ingredient quantities.

### Structured Recipe Steps — Completed

Implemented behaviour:

- Simple steps using `text`
- Structured steps using `lead`, `items`, and `after`
- Bulleted ingredient lists within preparation and cooking steps
- Structured-step rendering in normal recipe pages
- Structured-step rendering in Cooking Mode
- Backward compatibility for text-only steps

### Recipe Data Architecture — Completed

Implemented structure:

```text
data/
├─ recipe-index.json
└─ recipes/
   ├─ tomato-bath.json
   ├─ vangi-bath.json
   └─ curd-rice.json
```

Benefits:

- Each recipe is maintained independently
- The homepage loads only lightweight metadata
- Updating one recipe does not require changing unrelated recipes
- The site can scale to a much larger cookbook

### Rice-Cup Scaling Base — Completed

Implemented behaviour:

- Rice-based recipes use rice cup quantities as the canonical base
- New rice recipes generally default to 1 rice cup unless another rice-cup base better fits the finalized recipe
- Standard cup equivalents are derived automatically for display
- Scale controls show rice quantities only for recipes with a rice-cup scaling base
- Non-rice recipes retain generic multiplier controls
- Tomato Bath has been migrated to a canonical 1 rice cup base
- The current model supports future standard-cup input without requiring a redesign

## Current Feature — Recipe Scaling

### Implemented Scale Options

- 0.5×
- 0.75×
- 1×
- 1.25×
- 1.5×
- 2×

For rice-cup-based recipes, these internal scale values are displayed as rice quantities derived from the stored base quantity.

### Implemented Behaviour

- Recalculate scalable ingredient quantities automatically
- Update matching quantities in Preparation and Cooking Method
- Preserve readable fractions where practical
- Scale rice, water, vegetables, spices, and finishing ingredients consistently
- Keep temperatures and cooking timings unchanged unless a recipe-specific rule says otherwise
- Show the selected scale clearly on the recipe page
- Save the selected scale per recipe
- Apply scaled quantities inside Cooking Mode
- Use practical kitchen rounding for whole produce and small whole ingredients
- Keep gram values as the precise scaled target
- Render optional gram values for both count-based and unit-based ingredients
- Calculate standard cup equivalents automatically for rice and rice-cooking water
- Use recipe-specific labels for rice-based and non-rice scaling controls

### Current Pilot Status

Tomato Bath is the reference implementation and testing recipe for scaling.

Completed:

- migrated Tomato Bath to a canonical 1 rice cup base
- added explicit rice scaling metadata
- added rice-cup-first display with automatic standard cup equivalents
- added recipe-aware scale controls

Still to do:

- continue testing and refining Tomato Bath scaling data
- migrate Vangi Bath to the scalable schema
- migrate Curd Rice to the scalable schema
- validate all supported scales across all three recipes

### Finalized Design Decision — Rice Cup Scaling Base

Rice-based recipes are authored and scaled using **rice cup quantities as the canonical base**.

New rice recipes should generally default to **1 rice cup** as the base quantity, unless another rice-cup quantity better represents the finalized recipe.

Current behaviour:

- Rice recipes store explicit scaling metadata.
- Rice and rice-cooking water use rice cup measurements as the scaling basis.
- Standard cup equivalents are calculated for display.
- Other ingredients continue using their natural units.
- Public recipe links remain understandable because standard cup equivalents are shown in brackets.

Example:

```text
Rice – 1 rice cup (1⅓ standard cups)
Water – 2 rice cups (2⅔ standard cups)
```

Required scaling metadata:

```json
"scaling": {
  "baseIngredient": "rice",
  "baseQuantity": 1,
  "baseUnit": "riceCup"
}
```

The engine must use this metadata rather than infer the scaling base from display text.

Rationale:

Shukudu Kitchen is intended to optimize recipes for practical day-to-day cooking rather than preserve internet recipe measurement systems exactly. Internet recipes are treated as source material; GitHub stores the adapted cooking-ready version.

The conversion rule remains:

```text
1 standard cup = 0.75 rice cup
```

## Future Features

### Future Enhancement — Standard Cup Scaling Input

A future enhancement may allow users to enter the desired rice quantity using standard cups.

The engine would:

1. Convert the standard cup input into rice cups.
2. Calculate the scale factor against the stored rice-cup base.
3. Reuse the existing scaling engine for all ingredients.
4. Render the result in the selected display format.

This enhancement is intentionally deferred. Because the current recipe model stores the canonical base explicitly, adding standard-cup input later would extend the existing architecture rather than require a redesign.

### Standard Cup and Rice Cup Display

Current behaviour:

- Rice cup first with standard cup equivalent in brackets
- Standard cup values remain derived display equivalents

Possible future enhancement:

- user-selectable display order without changing the canonical scaling base

Default rule:

- 1 standard cup = 0.75 rice cup

### Serving Adjustment

Planned considerations:

- Distinguish serving-based recipes from rice-quantity-based recipes
- Avoid implying that pressure-cooking time scales linearly
- Preserve recipe-specific water ratios

### Improved Recipe Cards

Possible metadata:

- Cuisine
- Meal type
- Base rice quantity
- Approximate cooking time
- Serving estimate
- Recipe status
- Recipe image

### Print View

Planned behaviour:

- Hide search, filters, sticky navigation, and decorative controls
- Remove shadows and unnecessary backgrounds
- Keep ingredient sections and cooking steps readable
- Fit recipes cleanly across printed pages

### Recipe Images

Planned structure:

- Store image paths in recipe data
- Use a fallback when no image is available
- Keep image loading lightweight

### Direct Edit Link

Optional owner-focused link to the relevant recipe file in GitHub.

## Recommended Development Order

1. Functional ingredient checkboxes — completed
2. Sticky section navigation — completed
3. Cooking Mode — completed
4. Mobile refinements — completed
5. Recipe-per-file architecture — completed
6. Structured recipe steps — completed
7. Ingredient scaling engine — completed for pilot use
8. Rice cup scaling base decision — completed
9. Tomato Bath migration to 1 rice cup base — completed
10. Validate and refine Tomato Bath scales — in progress
11. Migrate remaining recipes to scaling
12. Serving adjustment
13. Print view
14. Recipe images and richer cards
15. Optional standard-cup scaling input
16. Optional cup display-order preference

## Development Principle

Prioritize features that reduce friction while actively cooking.

The site should remain:

- Simple to maintain
- Fast on mobile
- Easy to read in the kitchen
- Compatible with GitHub Pages
- Free of unnecessary frameworks or backend dependencies
