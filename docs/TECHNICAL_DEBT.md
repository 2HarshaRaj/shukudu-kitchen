# Technical Debt

This document tracks known cleanup items that are useful but not urgent enough to block current recipe work.

## Ingredient Formatter Consolidation

### Current State

Ingredient display currently has two layers:

```text
recipe.js
  base formatIngredient()

recipe-scaling.js
  scaling-aware override of formatIngredient()
```

`recipe-scaling.js` loads after `recipe.js` and overrides the formatter so it can support scale overrides, rice cup equivalents, quantity input, and practical unit-aware display.

### Why This Is Technical Debt

When a new ingredient display field is added to the base formatter, the scaling-aware override must also support it.

The `referenceQuantity` feature exposed this risk: the base formatter supported it first, but the scaling override initially did not, so the cup reference could disappear after scale changes.

### Current Guardrail

A code comment in `recipe-scaling.js` now states that the override must preserve all display fields supported by the base formatter, including:

```text
riceCupEquivalent
referenceQuantity
weightGrams
preparation
displayText
```

### Recommended Future Cleanup

Merge the two ingredient formatters into one source of truth.

Target shape:

```text
one formatter
  -> base quantity support
  -> scale override support
  -> rice/standard cup equivalents
  -> referenceQuantity
  -> count labels and gram weights
  -> preparation text
  -> displayText fallback
```

Do this after current recipe features are stable because formatter changes affect:

- Ingredients list
- Preparation steps
- Cooking Method
- Cooking Mode
- Scale changes
- Quantity-input recipes

### Priority

Medium.

Do not block recipe entry or normal feature work on this. Address during a cleanup/refactor phase.
