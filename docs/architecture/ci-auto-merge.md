# CI Auto-Merge Contract

## Goal

Allow GitHub to auto-merge pull requests after CI succeeds, but only when `pr-reviewer` has explicitly marked the PR as approved.

This flow is intentionally separate from the main CI pipeline. `pr-reviewer` cannot use GitHub's native review approval on its own PRs, so the merge-enablement path must react to an explicit PR signal outside the normal test/build workflow.

## Workflow Contract

The repository uses a dedicated workflow file, `.github/workflows/pr-reviewer-automerge.yml`.

That workflow listens to `pull_request_target` metadata events and enables GitHub auto-merge when all of the following are true:

- the PR targets `main`
- the PR is not a draft
- the PR carries the label `pr-reviewer-approved`

The main CI workflow remains responsible only for install, lint, test, and build checks.

The workflow does **not** check out PR code in the auto-merge step. It only uses pull-request metadata plus the GitHub CLI command:

```bash
gh pr merge <pr-number> --auto --squash --delete-branch=false
```

That means the merge itself still waits on branch protection and required checks. If those checks are already green, GitHub may merge immediately. Otherwise it will merge automatically once requirements pass.

## Required Platform Setting

Before the first run can succeed, repository admins must enable:

- `Settings > General > Pull Requests > Allow auto-merge`

Without that GitHub setting, the auto-merge step will fail even if the workflow and label are correct.

## Token and Permissions

The workflow requests:

- `contents: write`
- `pull-requests: write`

If the repository or organization blocks write-capable `GITHUB_TOKEN` usage for Actions, admins must allow Actions to use write permissions or this workflow will not be able to enable auto-merge.

## Usage Guidance For `pr-reviewer`

`pr-reviewer` should mark a PR as ready for automatic merge by applying the label:

- `pr-reviewer-approved`

Recommended usage:

1. `pr-reviewer` finishes review and decides the PR is acceptable for merge once CI passes.
2. `pr-reviewer` applies `pr-reviewer-approved`.
3. The dedicated PR-reviewer auto-merge workflow enables GitHub auto-merge for that PR.
4. If new commits are pushed while the label remains, the workflow re-runs on `synchronize` and re-enables auto-merge if needed.

This keeps the approval signal explicit and avoids brittle comment parsing.
