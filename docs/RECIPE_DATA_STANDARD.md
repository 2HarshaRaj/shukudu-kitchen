# Shukudu Kitchen Recipe Data Standard

## Purpose

This document defines how every recipe must be written and stored so that:

- recipe pages remain Anytype-compatible in structure
- Cooking Mode remains readable
- ingredients and method steps stay consistent
- future scaling can be added safely
- new recipes follow the same format without relying on chat history

## Standard Cup Conversion

Use this conversion for all recipes:

```text
1 standard cup = 0.75 rice cup
```

All rice quantities must show the standard cup first and the rice cup equivalent in brackets.

Example:

```text
1 standard cup rice (0.75 rice cup)
```

All water used for cooking rice must follow the same rule.

Example:

```text
2 standard cups water (1.5 rice cups)
```

This format must be used consistently in:

- Ingredients
- Preparation
- Cooking Method
- Cooking Mode

## Recipe JSON Structure

Each recipe file must contain:

```json
{
  "name": "Recipe Name",
  "slug": "recipe-name",
  "category": "Rice",
  "summary": "Short homepage description.",
  "details": {
    "Cuisine": "South Indian",
    "Meal Type": "Lunch / Dinner",
    "Status": "Finalized"
  },
  "ingredients": [],
  "preparation": [],
  "cookingMethod": [],
  "servingSuggestions": [],
  "notes": []
}
```

## Ingredient Rules

Ingredients are grouped into sections.

```json
{
  "section": "Main Ingredients",
  "items": [
    "1 standard cup sona masuri rice (0.75 rice cup)",
    "2 medium tomatoes (180 g), chopped"
  ]
}
```

Every vegetable must include:

- count or size
- weight in grams in parentheses

Examples:

```text
Onion – 1 medium (120 g)
Tomato – 2 medium (180 g)
Potato – 1 large (250 g)
Beans – 20 pieces (180 g)
```

Do not omit grams for vegetables.

## Ingredient Consistency

Ingredient quantities used in preparation and cooking steps must match the Ingredients section exactly.

Rules:

- Do not introduce new quantities
- Do not skip listed ingredients
- Do not merge ingredients unless already grouped in Ingredients
- Do not use vague wording such as `as needed` unless the Ingredients section already uses that wording
- Do not assume substitutions or shortcuts

## Preparation Step Structure

Preparation steps may be simple text:

```json
{
  "text": "Rinse 1 standard cup sona masuri rice (0.75 rice cup) and soak it for 20 minutes."
}
```

Or structured with bullets:

```json
{
  "lead": "Prepare:",
  "items": [
    "3 medium tomatoes (300 g), chopped",
    "1 medium onion (120 g), sliced",
    "1 inch ginger, grated"
  ],
  "after": "Keep everything ready before heating the cooker."
}
```

## Cooking Step Structure

Use a simple step when only one instruction is needed:

```json
{
  "text": "Mash the cooked rice thoroughly and allow it to cool until warm."
}
```

Use a structured step when more than one ingredient is used.

```json
{
  "lead": "Add:",
  "items": [
    "3 chopped tomatoes (300 g)",
    "½ teaspoon turmeric powder",
    "1 teaspoon red chilli powder",
    "1 teaspoon garam masala",
    "Salt, as required"
  ],
  "after": "Cook until the tomatoes soften and the oil begins to separate."
}
```

This renders as:

```text
Add:

• 3 chopped tomatoes (300 g)
• ½ teaspoon turmeric powder
• 1 teaspoon red chilli powder
• 1 teaspoon garam masala
• Salt, as required

Cook until the tomatoes soften and the oil begins to separate.
```

## Cooking Method Rules

Every cooking step must mention ingredient quantities exactly as listed in Ingredients.

When a step uses more than one ingredient:

- use `lead`
- list each ingredient separately in `items`
- use `after` for the action or result after adding them

Do not place multiple ingredients in one long sentence when they can be separated clearly.

### Cooking Mode Step Length Rule

Keep each step short enough to follow comfortably on a phone.

Use these rules:

- one cooking action per step
- bullet the ingredients used in that action
- split the step when it contains two distinct cooking actions

A step may scroll in Cooking Mode when needed, but excessive scrolling should be avoided. Clear, focused steps make Cooking Mode easier to follow while actively cooking.

## Tamarind Rule

Use tamarind paste whenever tamarind is required.

Do not use:

- whole tamarind
- soaked tamarind water

unless explicitly requested.

## No-Assumptions Rule

Do not assume:

- substitutions
- shortcuts
- alternative ingredients
- quantity changes
- structural changes

Ask before changing recipe intent or ingredients.

## Anytype Compatibility

When presenting recipes in chat or documentation:

- use `##` for main section headings
- use checkbox-style ingredient lists
- keep clean section separation
- follow the finalized Anytype recipe template

The JSON itself does not use Markdown checkboxes, but the website renderer should display ingredients as interactive checkboxes.

## New Recipe Checklist

Before adding a new recipe:

1. Confirm the recipe name and slug
2. Confirm all ingredient quantities
3. Confirm all vegetables include grams in parentheses
4. Confirm rice and rice-cooking water use standard cup first and rice cup in brackets
5. Confirm preparation and cooking steps reuse exact ingredient quantities
6. Use bullet items for any step with multiple ingredients
7. Keep one cooking action per step
8. Split steps that contain two distinct cooking actions
9. Confirm no ingredient is omitted
10. Add the recipe file under `data/recipes/`
11. Add metadata to `data/recipe-index.json`
12. Test the normal recipe page and Cooking Mode

## Required References

Before creating or updating a recipe, refer to:

- `docs/RECIPE_DATA_STANDARD.md`
- `docs/ARCHITECTURE.md`
- `docs/FEATURE_ROADMAP.md`
