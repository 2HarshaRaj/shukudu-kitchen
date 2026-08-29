# Task: Add finalized Idli Sambar fresh-masala recipe

## Context

The user cooked and approved this Idli Sambar / Hotel-Style Tiffin Sambar version on 2026-08-29. It is based on a Hebbars Kitchen tiffin sambar recipe, adjusted for the user's practical batch: 1 kg idli batter with chutney, using 1/2 standard cup raw toor dal. Instead of commercial sambar powder, the tested version uses a freshly roasted masala ground with reserved tomato and a little cooked dal so the small quantity catches properly in a mixer.

This is a finalized recipe addition/refinement. Keep the implementation focused on recipe data and only the index/version/changelog changes required by current repo standards. Do not change README, architecture, schema, validators, UI, or unrelated recipes.

## Files to inspect before editing

Read and follow:
- `AGENTS.md`
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/CODEX-WORKFLOW.md`
- `docs/RECIPE_DATA_STANDARD.md`
- relevant existing finalized South Indian recipe JSON files for current conventions
- `data/recipe-index.json`
- `site-version.js`
- top of `CHANGELOG.md`

Determine whether an Idli Sambar recipe already exists. If it does, refine that stable recipe rather than creating a duplicate. If it does not, create one with a stable lowercase hyphenated slug such as `idli-sambar`, unless repository conventions clearly indicate a better existing identity.

## Finalized base recipe

Name: Idli Sambar / Hotel-Style Tiffin Sambar
Cuisine: South Indian
Status: Finalized
Source/inspiration: Hebbars Kitchen
Practical context: tested successfully with 1 kg idli batter and chutney.

### Dal
- Toor dal — 1/2 standard cup, approximately 100 g raw
- Water for pressure-cooking dal — 1.5 standard cups
- Pressure cook 3–4 whistles, then mash/whisk smooth.

### Vegetables / aromatics
- Onion — 1 medium (120 g), sliced
- Tomato — 1 medium (100 g), chopped; reserve 30 g for grinding and use remaining ~70 g in the sambar
- Carrot — 1 small (80 g), chopped
- Potato — 1 small (100 g), chopped
- Beans — 6 pieces (40 g), chopped
- Drumstick — 6 pieces (120 g)
- Green chilli — 2 small (10 g), slit
- Coriander leaves — 2 tablespoons (8 g), chopped
- Curry leaves — a few for the main sambar, plus the separately specified amounts for fresh masala/tempering as appropriate under the existing schema

### Fresh roasted masala — replaces 1.5 tablespoons commercial sambar powder
- Coriander seeds — 1 teaspoon
- Chana dal — 1/2 teaspoon
- Urad dal — 1/4 teaspoon
- Dried red chilli — 3
- Methi/fenugreek seeds — 1/4 teaspoon
- Curry leaves — 6–8
- Hing — 1 pinch
- Reserved tomato — 30 g (about 2 tablespoons)
- Cooked toor dal — 1 tablespoon, taken from the cooked dal
- Water — 2–3 tablespoons only as needed for grinding

Method: dry-roast the coriander seeds, chana dal, urad dal, dried red chillies, methi seeds, curry leaves, and hing until aromatic without burning. Cool slightly. Grind with the reserved 30 g tomato, 1 tablespoon cooked toor dal, and just enough water to make a smooth paste. This paste is the tested substitute for 1.5 tablespoons sambar powder.

Important: model the reserved tomato and cooked-dal use cleanly using the existing recipe schema and ingredient/step conventions. Do not invent a new field or reusable convention just for this recipe. Avoid double-counting the tomato or dal in displayed totals.

### Main sambar
- Oil — 2 tablespoons
- Salt — 2 teaspoons total, used in stages (1 teaspoon with vegetables and 1 teaspoon at final seasoning, unless existing data conventions represent staged use differently without double-counting)
- Turmeric powder — 1/2 teaspoon
- Main curry leaves — a few
- Water — 3 standard cups for cooking vegetables
- Tamarind paste — 1.5 tablespoons
- Jaggery — 1 teaspoon
- Additional water — 1.5 standard cups when adding dal / adjusting tiffin-sambar consistency
- Fresh masala paste from above

Method:
1. Cook and mash the dal as above; reserve 1 tablespoon cooked dal for grinding.
2. Prepare the fresh roasted masala as above.
3. Heat 2 tablespoons oil. Add sliced onion and saute until softened.
4. Add remaining ~70 g tomato, carrot, potato, beans, drumstick, 1 teaspoon salt, turmeric, green chillies, and curry leaves. Stir-fry for about 2 minutes.
5. Add 3 standard cups water. Boil until vegetables are about half-cooked (the tested guidance used about 5 minutes, but doneness is the important cue).
6. Add 1.5 tablespoons tamarind paste and 1 teaspoon jaggery only after the vegetables are partly cooked. Continue until vegetables are fully cooked.
7. Add remaining cooked dal, 1.5 standard cups water, the fresh masala paste, and remaining 1 teaspoon salt. Mix well and boil 5–7 minutes. Keep the final consistency slightly thin and pourable for idli/tiffin sambar.

### Tempering
- Coconut oil — 1 tablespoon
- Mustard seeds — 1 teaspoon
- Urad dal — 1/2 teaspoon
- Dried red chilli — 1
- Hing — 1 pinch
- Curry leaves — a few

Heat coconut oil; splutter mustard, then add urad dal, dried red chilli, hing, and curry leaves. Pour over sambar.

Finish with 2 tablespoons (8 g) chopped coriander leaves and simmer briefly/about 1 minute.

## Recipe notes to preserve

- This exact fresh-masala version was cooked and approved as good on 2026-08-29.
- The fresh paste replaces 1.5 tablespoons commercial sambar powder.
- Tomato + a small amount of cooked dal are deliberately used in grinding to give enough volume for a small mixer batch without adding coconut.
- Keep tiffin sambar slightly thin/pourable.
- Add tamarind only after vegetables are partly cooked so acidity does not slow vegetable softening.
- Whisk/mash dal smooth for the desired texture.
- Do not add speculative "next time improvements"; the cooked version is finalized as good.

## Relationships / scaling

Use only existing allowed relationship values. Choose meal types/dish types that fit the current model; do not add a new dish type merely for Sambar if it is not currently allowed. Pair with existing Idli and/or Dosa recipes only if those slugs actually exist and the pairing is appropriate under current repo conventions. Maintain reciprocal pairings manually where intended.

Choose scaling metadata that accurately represents this finalized 1/2-standard-cup raw toor dal base and follows existing schema. Do not introduce new scaling behavior. If a household base is not clearly known from existing supported assumptions, omit it rather than guessing.

Strong spices/tempering ingredients must respect the repository's non-linear scaling requirements. Use recipe-specific `scaleQuantities` where validators/current standards require them rather than blindly scaling strong spices.

## Documentation / release constraints

Treat this as a small shipped recipe-data change:
- add one new changelog entry at the top as required;
- bump the visible site version as required by current standards, using patch versioning;
- do not rewrite or condense older changelog history;
- do not update README for this recipe-only change;
- do not create a release file.

## Validation

Run the applicable validators and report results:
- `node scripts/validate-recipes.js`
- `node scripts/validate-produce-weights.js`
- `node scripts/validate-search.js`
- `node scripts/validate-recipe-pairings.js`
- `node scripts/validate-theme.js`

## Durable-learning checkpoint

Before finishing, consider whether this implementation revealed a consequential reusable non-obvious lesson. Preserve it in the nearest existing permanent documentation only if genuinely warranted. Do not create documentation churn for this ordinary recipe addition. Delete this temporary task file before completion; `.codex/tasks/` must not reach main.

## Definition of done

- Finalized tested Idli Sambar recipe is represented correctly in the current schema.
- Ingredient IDs are stable and consistent across Ingredients, Preparation, Cooking Method, and Cooking Mode.
- No ingredient quantity is accidentally double-counted because of the reserved tomato/dal used for grinding.
- Recipe index is synchronized.
- Existing reciprocal pairings are updated only if appropriate.
- Patch changelog/site version handling follows current repo rules.
- Applicable validators pass or failures are explicitly explained.
- No unrelated files are changed.
- Temporary task file is removed before final implementation commit.
- Final response lists files changed, validations run/results, version/changelog impact, assumptions, and deferred items.

Suggested commit title: `feat: add finalized idli sambar recipe`
