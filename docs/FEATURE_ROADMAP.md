# Shukudu Kitchen Feature Roadmap

## Purpose

This roadmap records completed functionality and the planned development path for Shukudu Kitchen.

## Current Version — v1.6.0

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

## Current Feature — Recipe Scaling

### Implemented Scale Options

- 0.5×
- 0.75×
- 1×
- 1.25×
- 1.5×
- 2×

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

### Current Pilot Status

Tomato Bath is the reference implementation and testing recipe for scaling.

Still to do:

- continue testing and refining Tomato Bath scaling data
- migrate Vangi Bath to the scalable schema
- migrate Curd Rice to the scalable schema
- validate all supported scales across all three recipes

### Open Design Decision — Standard Cup or Rice Cup Base

Discuss and decide whether scalable rice recipes should be authored primarily from:

- standard cup quantities, with rice cup equivalents shown in brackets
- rice cup quantities, with standard cup equivalents calculated for display
- a neutral base quantity model that stores both and allows the website to choose the display order

Current project rule remains:

```text
1 standard cup = 0.75 rice cup
```

Current display convention remains:

```text
Standard cup first (rice cup equivalent in brackets)
```

This should be reviewed before scaling is rolled out broadly to more rice recipes.

## Future Features

### Standard Cup and Rice Cup Display

Possible options:

- Standard cup first with rice cup equivalent in brackets
- Rice cup first with standard cup equivalent in brackets
- Show both with a user-selectable preference

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
7. Ingredient scaling — in progress
8. Standard cup and rice cup base-model decision
9. Migrate remaining recipes to scaling
10. Serving adjustment
11. Print view
12. Recipe images and richer cards

## Development Principle

Prioritize features that reduce friction while actively cooking.

The site should remain:

- Simple to maintain
- Fast on mobile
- Easy to read in the kitchen
- Compatible with GitHub Pages
- Free of unnecessary frameworks or backend dependencies
