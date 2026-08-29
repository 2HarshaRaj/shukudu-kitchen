# Task
Refine the existing Idli Sambar recipe in PR #59 so it reflects the method actually used successfully in the kitchen.

## Context
The current recipe records a workaround where the fresh roasted masala is ground with reserved tomato, reserved cooked dal, and grinding water. That workaround turned out to be unnecessary: the roasted masala could be ground successfully as a dry powder on its own.

The user also wants the later addition of the fresh masala to appear as a separate ingredient bullet in the cooking step instead of being buried in prose.

## Required changes
1. Update `data/recipes/idli-sambar.json` only as needed to reflect the tested method:
   - Remove the instruction to reserve 30 g tomato for grinding.
   - Remove the instruction to reserve 1 tablespoon cooked dal for grinding.
   - Remove `grinding-water` from the Fresh Roasted Masala section.
   - The fresh masala should be dry-roasted, cooled slightly, and ground to a dry powder.
   - Use the full listed tomato quantity normally in the sambar; do not split it for grinding.
   - Use all cooked toor dal normally in the sambar; do not split it for grinding.
   - Remove notes/explanations that say tomato + cooked dal were used to give the mixer enough grinding volume or prevent double-counting.
2. In the cooking step where the dal, final water, salt, and fresh masala are added, make the fresh masala appear as its own ingredient-style bullet/item in rendered recipe/Cooking Mode output rather than only as sentence text such as `then mix in all the fresh masala paste`.
   - Reuse the current documented recipe-data model; do not add a new schema field or UI behavior.
   - If a dedicated structured ingredient item is needed to represent the prepared fresh masala powder cleanly, use an existing supported recipe-data pattern and ensure validators accept it.
   - Wording should describe it as the freshly ground sambar masala / fresh masala powder, not a paste.
3. Keep all other tested quantities and cooking order unchanged unless a direct consequence of removing the grinding workaround requires wording cleanup.
4. Do not change README, architecture, UI, schema, validators, or unrelated recipes.
5. Keep the existing PR version/changelog scope unless this correction genuinely requires a small wording adjustment to the existing 1.22.2 changelog entry. Do not create a new release entry/version for this pre-merge correction.

## Validation
Run all applicable repository validators:
- `node scripts/validate-recipes.js`
- `node scripts/validate-produce-weights.js`
- `node scripts/validate-search.js`
- `node scripts/validate-recipe-pairings.js`
- `node scripts/validate-theme.js`
- `git diff --check`

## Workflow requirements
- Read `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/CODEX-WORKFLOW.md`, and `docs/RECIPE_DATA_STANDARD.md` first.
- Keep the change small and focused on PR #59.
- Make all permanent implementation changes yourself.
- Perform the durable-learning checkpoint; only update permanent docs if this reveals a genuinely reusable, non-obvious rule.
- Remove this temporary `.codex/tasks/refine-idli-sambar-dry-masala.md` file before completion so `.codex/tasks/` does not reach `main`.
