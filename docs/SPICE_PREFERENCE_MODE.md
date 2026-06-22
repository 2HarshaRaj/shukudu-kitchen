# Spice Preference Mode

## Purpose

Some recipes in Shukudu Kitchen are intentionally mild by default so the finalized base recipe remains balanced, family-friendly, or true to the intended dish style. Guests may still prefer more khara or spice heat when eating the same recipe.

Spice Preference Mode is a future model for adjusting only heat-focused ingredients without making the whole recipe more masala-heavy. It should let a cook increase or reduce perceived heat while preserving the original masala profile, aroma balance, and finalized base quantities.

## Core Principle

- Spice Preference Mode controls heat/khara, not total masala strength.
- It should adjust only heat-driving ingredients.
- It must not blindly increase every spice.
- Default recipe quantities remain the finalized base.

The mode should protect recipes from becoming unbalanced. Increasing heat should not automatically increase turmeric, coriander powder, garam masala, whole spices, tempering aromatics, sourness, sweetness, or other balancing ingredients unless a specific recipe later defines an intentional override.

## Heat Ingredients

Ingredients that may be controlled by spice preference include:

- green chilli
- dry red chilli
- red chilli powder
- black pepper
- pepper-jeera mix where pepper is the heat driver

Recipe-specific handling may be needed. For example, one recipe may get its heat mainly from green chilli, another from red chilli powder, and another from black pepper. A pepper-jeera mix should only be treated as a heat ingredient when the recipe's intended heat comes from pepper and the jeera component does not distort the masala profile when adjusted.

## Ingredients Not Controlled

Ingredients that should normally not change as part of Spice Preference Mode include:

- turmeric
- cumin
- coriander powder
- garam masala
- whole spices
- mustard seeds
- curry leaves
- hing
- ginger
- garlic
- coconut
- tamarind
- jaggery

These ingredients affect aroma, balance, seasoning identity, body, sourness, sweetness, or the overall masala profile rather than only heat. Increasing them just because a guest wants more khara can make the dish taste heavier, sharper, more aromatic, more sour, or sweeter instead of simply spicier.

## Future Modes

Proposed future spice preference modes:

- Mild
- Default
- Spicy
- Guest Spicy

Mode meanings:

- **Mild** may reduce heat ingredients when a recipe is already spicy.
- **Default** means the stored finalized recipe quantity.
- **Spicy** increases heat moderately.
- **Guest Spicy** increases heat more, but still within recipe-specific limits.

Default should always preserve the recipe as authored. Other modes should be optional presentation and scaling behavior layered on top of the finalized recipe data.

## Proposed Future Metadata

A future optional metadata shape may describe which ingredients participate in Spice Preference Mode. This is only a proposed future shape and should not be implemented yet.

```json
"spiceProfile": {
  "defaultMode": "Default",
  "heatIngredients": ["green-chilli", "red-chilli-powder"],
  "notes": "Increase chilli only; do not increase garam masala."
}
```

The metadata should remain recipe-specific because heat sources and safe adjustment ranges vary by dish.

## Scaling Logic

Spice preference should combine with existing quantity scaling rather than replace it.

For example, if a recipe is scaled to 1.5× and spice mode is Spicy, the heat ingredient quantity should first follow the recipe scale, then apply the recipe-specific spice adjustment. The stored Default quantity remains the finalized base, the scaling engine derives the scaled base quantity, and Spice Preference Mode applies an additional heat adjustment only to configured heat ingredients.

Non-linear overrides may be needed for chillies and pepper. Whole chillies, strong chilli powders, and black pepper can become harsh if scaled too mechanically, especially at large recipe sizes or in Guest Spicy mode.

## Example Behavior

### Tomato Bath

- Default: existing chilli quantity
- Spicy: increase green chilli or chilli powder only
- Do not increase whole spices or garam masala

### Rasam

- Spicy: increase pepper or chilli depending on recipe style
- Do not increase tamarind or jaggery

### Punjabi Dal Tadka

- Spicy: increase chilli powder or green chilli
- Do not increase garam masala blindly

### Curd Rice

- Spice mode may affect green chilli in tempering only
- Default mild profile should remain intact

## Future UI

Possible future Recipe Details display:

- Spice Profile
- Default heat level

Possible future selector:

- Mild
- Default
- Spicy
- Guest Spicy

The selected spice mode should persist per recipe so a cook can return to the same recipe without reselecting the preferred heat level each time.

## Validation Future

Future validation could check:

- `spiceProfile.defaultMode` is valid
- `spiceProfile.heatIngredients` reference existing ingredient IDs
- heat ingredients are scalable or have mode-specific quantities
- non-heat spices are not accidentally included as heat ingredients

## Future Implementation Order

1. Document spice preference model
2. Add optional spiceProfile metadata
3. Identify heat ingredients per recipe
4. Add spice mode selector
5. Persist spice mode per recipe
6. Combine spice mode with existing scaling engine
7. Add recipe-specific non-linear spice overrides
8. Add validation
