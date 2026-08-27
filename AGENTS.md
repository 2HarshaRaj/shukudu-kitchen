# AGENTS.md

## Repository Rules

- Read `README.md`, `docs/ARCHITECTURE.md`, `docs/CODEX-WORKFLOW.md`, and relevant docs before making changes.
- Keep changes small and focused.
- Prefer one logical change per PR.
- Avoid touching unrelated files.
- Use the bounded Fast Data Path only for routine changes that fit the existing recipe/data model; use the Codex Development Path for model, code, UI, validation, workflow, architecture, bulk, or other higher-risk changes.

## Codex Prompt and Review Guidance

Codex prompts and final responses should clearly identify:

- Task
- Context
- Files inspected or changed
- Constraints followed
- Validation performed
- Recipe/data/index/UI/theme impact
- Changelog and visible site version impact
- Assumptions and intentionally deferred items

Review Shukudu Kitchen changes for:

- recipe JSON validity
- recipe-index synchronization
- stable lowercase hyphenated slugs
- ingredient ID consistency across ingredients, preparation, cooking method, and Cooking Mode
- `householdBase` only when known
- reciprocal pairings where appropriate
- approved dish type usage
- UI changes following `docs/UI_THEME_STANDARD.md`
- light/dark mode, hover, active, pressed, and disabled states for UI changes
- relevant validation scripts
- changelog and visible site version impact for shipped user-facing changes

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
