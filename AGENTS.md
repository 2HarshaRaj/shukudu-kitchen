# AGENTS.md

## Repository Rules

- Read `README.md`, `docs/ARCHITECTURE.md`, and relevant docs before making changes.
- Keep changes small and focused.
- Prefer one logical change per PR.
- Avoid touching unrelated files.

## Recipe Data Rules

- Follow `docs/RECIPE_DATA_STANDARD.md` for recipe JSON structure.
- One recipe file must live under `data/recipes/<slug>.json`.
- Keep `data/recipe-index.json` synchronized with recipe files.
- Use stable lowercase hyphenated slugs.
- Keep ingredient IDs stable and referenced consistently across ingredients, preparation, cooking method, and Cooking Mode.
- Add `householdBase` only when the household base assumption is known.
- Add reciprocal pairings manually where appropriate; reverse pairings are not auto-created.

## UI Rules

- Read `docs/UI_THEME_STANDARD.md` before changing colors, pills, chips, buttons, shadows, hover states, active states, pressed states, or dark-mode behavior.
- CSS belongs in CSS.
- Layout should not be controlled by JavaScript unless necessary.
- Prefer existing design patterns over introducing new ones.

## Validation

After relevant changes, run or expect GitHub Actions to run:

- `node scripts/validate-recipes.js`
- `node scripts/validate-produce-weights.js`
- `node scripts/validate-search.js`
- `node scripts/validate-recipe-pairings.js`
- `node scripts/validate-theme.js`

The GitHub Actions workflow already runs these validators on recipe, data, UI, and validation-related changes.

## Documentation and Versioning

- Maintain `CHANGELOG.md` as the single release history.
- Add new changelog entries at the top.
- Never condense, delete, or rewrite older changelog history.
- Bump the visible site version for shipped changes.
- README changes are needed only when user-facing capabilities, architecture, workflows, or standards change.
- Do not create `docs/releases/vX.Y.Z.md` for small patch fixes.
