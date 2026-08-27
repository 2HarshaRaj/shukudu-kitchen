# Task: establish Shukudu Kitchen repository change workflow

## Goal

Create a repository-local change workflow for Shukudu Kitchen that uses two paths:

1. a Fast Data Path for routine recipe/data maintenance that cleanly applies the existing documented model; and
2. a Codex Development Path for structural, behavioral, UI, validation, workflow, architecture, bulk, or otherwise higher-risk changes.

Adopt the durable-learning checkpoint and selective high-risk Codex Code Review standard already used in the owner's other actively maintained repositories, while preserving Shukudu Kitchen's existing recipe, UI, validation, changelog, and visible-version rules.

## Required reading

Before changing permanent files, inspect at minimum:

- `README.md`
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/RECIPE_DATA_STANDARD.md`
- `docs/UI_THEME_STANDARD.md`
- `CHANGELOG.md`
- relevant validation scripts/workflow as needed to accurately describe current validation behavior

Also inspect the current repository structure and recent conventions rather than assuming another repository's workflow can be copied verbatim.

## Required implementation

### 1. Add `docs/CODEX-WORKFLOW.md`

Document the two-path operating model.

#### Fast Data Path

Permit ChatGPT to make routine source-data changes directly to `main` only when the existing documented recipe/data model is sufficient and no model/system change is required.

Examples that may qualify when they use existing fields and semantics:

- add or refine a recipe using the current recipe schema;
- correct recipe quantities, ingredients, preparation/cooking text, notes, aliases, status, or existing relationship values;
- maintain `data/recipe-index.json` as required by the existing recipe/index contract;
- maintain reciprocal pairings or existing metadata using current documented semantics;
- ordinary corrections that do not require new fields, validator changes, architecture changes, UI behavior changes, or new conventions.

Fast Data Path must preserve all existing repository rules, including recipe/index synchronization, stable slugs/ingredient IDs, validation requirements, changelog impact, and visible site-version impact where the current standards require them. Do not weaken existing quality/versioning expectations merely because the write goes directly to `main`.

If a routine change reveals that the existing model cannot represent the request cleanly, stop the Fast Data Path and escalate to the Codex Development Path. Do not invent a new field, relationship meaning, schema workaround, or UI behavior during a Fast Data Path update.

Document how validation works for direct-to-main changes using the repository's actual current GitHub Actions behavior. Be explicit that post-commit CI is not the same as pre-merge validation; if a Fast Data Path commit fails validation, correct the source promptly. Do not invent automation that does not exist.

#### Codex Development Path

Require the Draft PR + temporary task + Codex implementation workflow for changes such as:

- recipe/data schema or reusable field-convention changes;
- validators or validation rules;
- UI, theme, layout, Cooking Mode, Meal Mode, PWA, JavaScript, CSS, or site behavior;
- architecture or workflow changes;
- GitHub Actions;
- scripts;
- bulk migrations/restructuring;
- stable slug/identity semantics;
- new relationship semantics or dish-type/model conventions;
- deployment/configuration changes;
- anything that cannot be represented cleanly by the current model;
- other substantial or high-risk changes.

Document the current dispatch workflow:

1. ChatGPT scopes the change with the user.
2. ChatGPT may create only temporary dispatch scaffolding: focused branch, Draft PR, one `.codex/tasks/<task>.md`, and one PR dispatch comment.
3. The Codex mention appears exactly once and only in the dispatch comment.
4. Codex makes all permanent changes and runs applicable validation.
5. Before temporary task deletion, perform the durable-learning checkpoint below.
6. Codex deletes the temporary task specification; `.codex/tasks/` must never reach `main`.
7. User presses Update branch and tells ChatGPT `PR Updated`.
8. ChatGPT independently reviews the actual updated PR.
9. Follow-up fixes use a new Codex task on the same PR where practical.
10. PR remains Draft until implementation/review are complete.
11. Never merge without explicit user instruction; `Merge it` means squash merge and branch cleanup where tooling permits.
12. Implementation and deployment are separate approvals; never deploy without explicit request.

### 2. Durable-learning checkpoint

For each Codex Development Path task, before deleting the temporary task specification, consider whether implementation/review produced a consequential, reusable, non-obvious lesson that would help future implementation or review.

When such a lesson exists, preserve it in the nearest existing permanent documentation based on subject, for example:

- repo-wide agent/reviewer invariant -> `AGENTS.md`;
- recipe/data/model constraint -> relevant existing recipe/data standard;
- UI/theme/architecture constraint -> relevant existing UI or architecture doc;
- operational/setup/versioning rule -> nearest existing operational documentation.

Do not create `LEARNINGS.md`, a decision-log directory, notebook infrastructure, or documentation churn just to satisfy this checkpoint. If no durable learning exists, make no documentation-only change.

During ChatGPT PR review, verify that important durable learning was preserved where appropriate and reject speculative/duplicative documentation.

### 3. Selective high-risk Codex Code Review

Document Codex Code Review as optional, not mandatory.

During ChatGPT's PR review, recommend an additional user-approved Codex Code Review when the actual change is high-risk or unusually subtle, including examples such as:

- authentication/security/permissions;
- deployment or workflow automation;
- schema/data migrations;
- destructive or bulk mutation;
- stable slug/identity semantics;
- broad validator/model changes;
- concurrency, locking, idempotency, retry or persistence behavior;
- major architecture changes;
- a first independent review that already finds non-obvious defects.

Do not recommend it routinely for ordinary low-risk, bounded, well-tested changes. User approval is required before dispatching an additional Codex review/task, and ChatGPT remains the final independent review gate before merge.

### 4. Align `AGENTS.md`

Make only the minimum changes needed so future agents are instructed to read/follow `docs/CODEX-WORKFLOW.md` and understand which path applies. Preserve the existing Shukudu-specific recipe, UI, validation, changelog, and versioning guidance.

Do not duplicate the full workflow in `AGENTS.md`; keep detailed workflow logic centralized in `docs/CODEX-WORKFLOW.md`.

### 5. Changelog

Because this is a meaningful repository-level operating-model change, add a concise top entry to `CHANGELOG.md` if that matches the repository's existing changelog policy. Do not bump the visible site version solely for an internal development-workflow documentation change unless the current repository standards explicitly require it.

## Out of scope

Do not change:

- recipe JSON or recipe index data;
- recipe schema/model;
- validators;
- GitHub Actions;
- UI/theme/site behavior;
- `site-version.js` unless existing standards clearly require it for this internal workflow-only change;
- deployment;
- runtime code;
- generated assets.

Do not create a generic learning log, extra workflow infrastructure, or unnecessary new documentation beyond `docs/CODEX-WORKFLOW.md` and minimal aligned edits to existing guidance/changelog.

## Validation

Run appropriate static checks for a documentation/workflow-only change, at minimum:

- `git diff --check`;
- confirm the final committed diff contains only the intended documentation/guidance files;
- confirm the temporary `.codex/tasks/shukudu-codex-workflow-standard.md` file is absent before completion;
- run any repository-specific lightweight documentation/static validation that is applicable without claiming unrelated recipe/runtime checks as live testing.

Clearly distinguish static validation from any live site/deployment testing. No deployment is authorized.

## Completion criteria

- `docs/CODEX-WORKFLOW.md` exists and accurately documents the two-path model.
- Fast Data Path is narrowly bounded to ordinary existing-model recipe/data maintenance.
- Codex Development Path preserves Draft PR, temporary task, Update branch, ChatGPT review, explicit merge, and separate deployment approvals.
- Durable-learning checkpoint is included.
- Selective high-risk Codex Code Review guidance is included.
- `AGENTS.md` is minimally aligned.
- `CHANGELOG.md` is updated if appropriate.
- Existing Shukudu-specific standards remain intact.
- No runtime/data/schema/UI/deployment changes are included.
- Temporary task spec is deleted before Codex finishes.