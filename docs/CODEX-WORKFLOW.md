# Codex Change Workflow

## Purpose

Shukudu Kitchen uses two change paths. The path depends on the nature and risk of
the change, not on how quickly it can be made. Both paths preserve all repository
standards in `AGENTS.md` and the relevant recipe, UI, architecture, validation,
changelog, and versioning documentation.

## Fast Data Path

ChatGPT may make a routine source-data change directly to `main` only when the
existing documented recipe/data model represents the change cleanly and no model
or system change is needed.

Changes that may qualify include:

- adding or refining a recipe using the current recipe schema;
- correcting quantities, ingredients, preparation or cooking text, notes,
  aliases, status, or existing relationship values;
- synchronizing `data/recipe-index.json` under the existing recipe/index
  contract;
- maintaining reciprocal pairings or existing metadata with their current
  documented semantics; and
- ordinary data corrections that require no new fields, validator changes,
  architecture changes, UI behavior, or new conventions.

This path does not relax quality requirements. Follow `docs/RECIPE_DATA_STANDARD.md`
and all other applicable standards, including recipe/index synchronization,
stable lowercase hyphenated slugs, stable and consistently referenced ingredient
IDs, known-only `householdBase` values, reciprocal pairings where appropriate,
approved dish types, applicable validators, changelog updates, and visible site
version updates when current standards require them.

If the current model cannot represent the request cleanly, stop and use the
Codex Development Path. Do not introduce a field, relationship meaning, schema
workaround, UI behavior, or convention on the Fast Data Path.

### Direct-to-main validation

Run the applicable repository validators before writing when the available
workflow permits it. The current `Validate Recipes` GitHub Actions workflow is
triggered by pushes only for its configured data, validation, theme, HTML, CSS,
script, and workflow paths. It then runs the recipe, produce-weight, search,
pairing, and theme validators. A direct commit therefore receives post-commit CI
when it touches a configured path; this is not pre-merge validation. If that CI
fails, correct the source promptly. Documentation-only paths not listed in the
workflow do not trigger it. Do not claim checks or automation that did not run.

## Codex Development Path

Use a Draft PR, temporary task, and Codex implementation for:

- recipe/data schema changes or reusable field conventions;
- validators, validation rules, GitHub Actions, or scripts;
- UI, theme, layout, Cooking Mode, Meal Mode, PWA, JavaScript, CSS, or other site
  behavior;
- architecture or workflow changes;
- bulk migrations, restructuring, destructive changes, or other broad changes;
- stable slug or identity semantics;
- new relationship semantics or dish-type/model conventions;
- deployment or configuration changes;
- anything the current model cannot represent cleanly; and
- any other substantial, subtle, or high-risk change.

Use this dispatch and review sequence:

1. ChatGPT scopes the change with the user.
2. ChatGPT may create only the temporary dispatch scaffolding: a focused branch,
   a Draft PR, one `.codex/tasks/<task>.md`, and one PR dispatch comment.
3. Mention Codex exactly once, and only in the dispatch comment.
4. Codex makes every permanent change and runs applicable validation.
5. Before deleting the temporary task, Codex performs the durable-learning
   checkpoint below.
6. Codex deletes the temporary task specification. `.codex/tasks/` must never
   reach `main`.
7. The user presses **Update branch** and tells ChatGPT `PR Updated`.
8. ChatGPT independently reviews the actual updated PR.
9. When practical, follow-up fixes use a new Codex task on the same PR.
10. The PR remains Draft until implementation and review are complete.
11. Never merge without explicit user instruction. `Merge it` means squash merge
    and branch cleanup where tooling permits.
12. Implementation and deployment are separate approvals. Never deploy without
    an explicit request.

## Durable-learning checkpoint

Before deleting each Codex Development Path task, consider whether implementation
or review revealed a consequential, reusable, non-obvious lesson that would help
future implementation or review. If it did, preserve the lesson in the nearest
existing permanent documentation:

- a repository-wide agent or reviewer invariant belongs in `AGENTS.md`;
- a recipe, data, or model constraint belongs in the relevant existing data
  standard;
- a UI, theme, or architecture constraint belongs in the relevant UI or
  architecture document; and
- an operational, setup, or versioning rule belongs in the nearest existing
  operational documentation.

Do not create a generic `LEARNINGS.md`, decision-log directory, notebook system,
or documentation churn merely to satisfy this checkpoint. If there is no durable
lesson, make no learning-only edit. During independent PR review, ChatGPT verifies
that important durable learning was preserved where appropriate and rejects
speculative or duplicative documentation.

## Selective Codex Code Review

An additional Codex Code Review is optional, not a routine gate. During its
independent PR review, ChatGPT should recommend one when the actual change is
high-risk or unusually subtle, such as:

- authentication, security, or permissions;
- deployment or workflow automation;
- schema or data migrations;
- destructive or bulk mutation;
- stable slug or identity semantics;
- broad validator or model changes;
- concurrency, locking, idempotency, retry, or persistence behavior;
- major architecture changes; or
- a first independent review that finds non-obvious defects.

Do not recommend an additional Codex review for ordinary low-risk, bounded,
well-tested work. The user must approve before ChatGPT dispatches an additional
Codex review or task. ChatGPT remains the final independent review gate before
merge.
