# Shukudu Kitchen Feature Roadmap

## Purpose

This roadmap captures planned functionality for Shukudu Kitchen so that future development decisions remain in the repository instead of being spread across chat history.

## Current State — Version 1

Shukudu Kitchen currently includes:

- JSON-driven recipe storage
- Homepage with recipe cards
- Search by recipe name, category, and summary
- Category filtering
- Individual recipe pages
- Anytype-inspired recipe layout
- Mobile-responsive styling
- Three initial recipes:
  - Tomato Bath
  - Vangi Bath
  - Curd Rice

## Version 2 — Kitchen Usability

### Functional Ingredient Checkboxes — Completed

Implemented behaviour:

- Tap an ingredient to mark it complete
- Completed ingredients are dimmed and struck through
- Checklist state is saved in the browser using `localStorage`
- Checklist state is stored separately for each recipe
- A `Reset ingredients` action clears the checklist
- Ingredient rows use larger mobile-friendly tap targets
- The old decorative checkbox style was removed to avoid duplicate checkboxes

Implementation files:

- `recipe.js`
- `style.css`

### Sticky Section Navigation — Next

Add a sticky navigation bar on recipe pages.

Planned sections:

- Recipe Details
- Ingredients
- Preparation
- Cooking Method
- Serving Suggestions
- Notes

Planned behaviour:

- Tap a section to scroll to it
- Highlight the current section where practical
- Keep the navigation compact on mobile
- Avoid covering section headings when scrolling
- Allow horizontal scrolling on narrow screens if needed

### Cooking Mode

Add a dedicated cooking experience launched with a `Start Cooking` button.

Planned behaviour:

- Show one preparation or cooking step at a time
- Use larger text for kitchen viewing
- Provide Previous and Next controls
- Show step number and progress
- Show ingredients relevant to the current step where data supports it
- Allow steps to be marked complete
- Preserve progress locally in the browser
- Offer a clear exit back to the full recipe

### Mobile Refinement

Improve active-cooking usability on phones.

Planned work:

- Larger tap targets
- Better spacing between checklist items
- Improved section padding
- Reduced unnecessary scrolling
- Clearer sticky controls

## Version 3 — Scaling and Measurement Tools

### Ingredient Scaling

Add scaling controls such as:

- 0.5×
- 0.75×
- 1×
- 1.25×
- 1.5×
- 2×

Planned behaviour:

- Recalculate ingredient quantities automatically
- Preserve readable fractions where possible
- Scale rice, water, vegetables, spices, and finishing ingredients consistently
- Keep cooking times unchanged unless a recipe-specific rule says otherwise
- Show the selected scale clearly throughout the page

This feature requires restructuring ingredient data from complete text sentences into structured quantity, unit, ingredient, and note fields.

### Standard Cup and Rice Cup Display

Add a measurement display control.

Possible options:

- Show standard cup first with rice cup equivalent in brackets
- Show rice cup first with standard cup equivalent in brackets
- Show both

Default rule:

- 1 standard cup = 0.75 rice cup

### Serving Adjustment

Allow recipes to be adjusted by serving count where that model makes sense.

Planned considerations:

- Distinguish serving-based recipes from rice-quantity-based recipes
- Avoid implying that pressure-cooking time always scales linearly
- Preserve recipe-specific water ratios

## Version 4 — Presentation and Convenience

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

Add a print-friendly recipe format.

Planned behaviour:

- Hide search, filters, sticky navigation, and decorative controls
- Remove shadows and unnecessary backgrounds
- Keep ingredient sections and cooking steps readable
- Fit recipes cleanly across printed pages

### Recipe Images

Add optional images to recipe cards and recipe pages.

Planned structure:

- Store image paths in recipe data
- Use a fallback when no image is available
- Keep image loading lightweight

### Direct Edit Link

Add an owner-focused link to the relevant recipe data in GitHub.

This is optional because recipes are expected to be maintained through chat and committed to GitHub rather than edited manually on the live website.

## Data Architecture Changes

The current `recipes.json` stores ingredient lines as complete text strings. This works for display but limits scaling and step-specific ingredient linking.

A future structured ingredient model may look like:

```json
{
  "id": "sona-masuri-rice",
  "quantity": 1,
  "unit": "standard cup",
  "riceCupEquivalent": 0.75,
  "ingredient": "sona masuri rice",
  "preparation": "rinsed and soaked for 20 minutes",
  "scalable": true
}
```

Cooking steps may later reference ingredient IDs:

```json
{
  "instruction": "Add the soaked rice and mix gently for 1 minute.",
  "ingredientIds": ["sona-masuri-rice"]
}
```

This would support:

- Automatic scaling
- Step-specific ingredient display
- Measurement toggles
- Better validation between ingredients and method steps

## Recommended Development Order

1. Functional ingredient checkboxes — completed
2. Sticky section navigation — next
3. Cooking mode
4. Mobile refinement
5. Structured recipe data migration
6. Ingredient scaling
7. Standard cup and rice cup display controls
8. Serving adjustment
9. Print view
10. Recipe images and richer cards

## Development Principle

Prioritize features that reduce friction while actively cooking.

The site should remain:

- Simple to maintain
- Fast on mobile
- Easy to read in the kitchen
- Compatible with GitHub Pages
- Free of unnecessary frameworks or backend dependencies
