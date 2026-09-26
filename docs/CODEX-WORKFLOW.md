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

When the user explicitly says **Send to Codex**, use the Codex Development Path
even when the requested recipe or data change would otherwise qualify for this
path.

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

Use an issue-first specification and Codex implementation for:

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

Use this dispatch, publication, and review sequence:

1. ChatGPT inspects the current repository, scopes the agreed change with the
   user, and creates a focused GitHub Issue as the durable task specification.
2. ChatGPT posts exactly one implementation dispatch comment on that Issue.
   Use an action-oriented mention such as `@codex Implement...`, `@codex Fix...`,
   or `@codex Update...`. Reserve `@codex review` for review-only work that must
   not change the repository. Never post duplicate mentions; they can start
   duplicate tasks.
3. Codex starts from current `main`, implements the focused change, runs the
   applicable validation, uses a focused feature branch, and commits and pushes
   its work. Codex should create a Draft PR targeting `main` when its environment
   supports authenticated publication.
4. Before reporting publication success, Codex treats GitHub as authoritative:
   verify that the remote branch exists and that the Draft PR exists with the
   expected head and base. A local commit or a completed Codex task alone is not
   evidence that either was published.
5. If automatic publication fails, first check GitHub for an equivalent remote
   branch or PR. Only when neither exists, use Codex Cloud's built-in **Create
   PR** or **Create draft PR** flow as the supported fallback, then verify the
   result on GitHub. Do not create a duplicate branch or PR.
6. When the user says Codex is done or the PR exists, ChatGPT independently
   inspects the actual PR, its diff, and its checks. No manual **Update branch**
   step is part of the normal workflow.
7. If corrections are required, ChatGPT posts one new structured,
   action-oriented comment such as `@codex Fix...` on the same PR. Codex should
   update that PR's existing head branch directly where practical and verify the
   updated remote state.
8. Before completing implementation, Codex performs the durable-learning
   checkpoint below. `.codex/tasks/` is a fallback-only dispatch mechanism when
   an Issue cannot be used; any temporary task file must be deleted and must
   never reach `main`.
9. The PR remains Draft until implementation and ChatGPT's independent review
   are complete.
10. Never merge without explicit user instruction. `Merge it` means squash
    merge and branch cleanup where tooling permits.
11. Implementation and deployment are separate approvals. Never deploy without
    an explicit request.

## One-time GitHub publication setup

Codex publication requires a separate fine-grained personal access token scoped
only to `2HarshaRaj/shukudu-kitchen`. A repository administrator creates this
dedicated token and gives it the minimum repository permissions:

- Contents: read and write;
- Pull requests: read and write; and
- normal metadata read access.

Store the token as a Secret in the Shukudu Kitchen Codex Cloud environment; for
example, use the sanitized secret name `GITHUB_TOKEN_CODEX_REPO`. The environment
setup script consumes the injected secret non-interactively. Never print the
token, enable shell tracing while handling it, commit it, put it in a remote URL,
paste it into documentation or logs, or reuse a broader personal token.

Use this pattern in the environment setup script to clear tokens that GitHub CLI
might otherwise prefer, authenticate with the injected repository-scoped secret,
remove that secret from the process environment, configure Git, and retain the
normal token-free HTTPS remote:

```bash
set +x
unset GH_TOKEN GITHUB_TOKEN
test -n "${GITHUB_TOKEN_CODEX_REPO:-}" || {
  echo "Missing required Codex Cloud secret: GITHUB_TOKEN_CODEX_REPO" >&2
  exit 1
}
printf '%s' "$GITHUB_TOKEN_CODEX_REPO" | gh auth login --hostname github.com --git-protocol https --with-token
unset GITHUB_TOKEN_CODEX_REPO
gh auth setup-git
repo_url="https://github.com/2HarshaRaj/shukudu-kitchen.git"
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "${repo_url}"
else
  git remote add origin "${repo_url}"
fi
gh auth status
gh repo view 2HarshaRaj/shukudu-kitchen --json nameWithOwner
git remote get-url origin
```

The final command must show
`https://github.com/2HarshaRaj/shukudu-kitchen.git`, with no embedded token.
Store and rotate the PAT through the environment's secret-management controls;
never save it in this repository. This setup follows the tested Personal
Automation Library pattern, adapted for and verified with Shukudu Kitchen.

### Disposable publication smoke test

Run this once after authentication from a clean, current `main`. Use a unique
branch name if the example name already exists:

```bash
git switch main
git pull --ff-only origin main
git switch -c codex/smoke-test-draft-pr
git commit --allow-empty -m "chore: test Codex draft PR publication"
git push -u origin codex/smoke-test-draft-pr
gh pr create --draft --base main --head codex/smoke-test-draft-pr \
  --title "chore: test Codex draft PR publication" \
  --body "Disposable authentication smoke test; close without merging."
git ls-remote --exit-code --heads origin codex/smoke-test-draft-pr
gh pr view codex/smoke-test-draft-pr --json isDraft,headRefName,baseRefName,url
gh pr close codex/smoke-test-draft-pr --delete-branch
git switch main
```

Confirm that `isDraft` is `true`, `headRefName` is the disposable branch, and
`baseRefName` is `main` before closing the PR unmerged. The final close command
removes the remote branch; delete the local disposable branch afterward if it
still exists.

Shukudu Kitchen's authenticated publication path was successfully smoke-tested
through Issue #63 and disposable Draft PR #64. Authentication and repository
identity checks passed, the token-free HTTPS `origin` was retained, and branch
`codex/smoke-test-draft-pr-20260926211538` was pushed. GitHub confirmed the
expected base, head, and commit SHA before PR #64 was closed unmerged and its
remote branch was deleted. Local cleanup completed and `main` remained
unchanged.

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
