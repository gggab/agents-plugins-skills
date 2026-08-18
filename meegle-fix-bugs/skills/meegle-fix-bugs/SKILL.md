---
name: meegle-fix-bugs
description: Repair Feishu Project (Meegle) bugs from evidence-based reproduction through guarded delivery and verified closure. Use when finding assigned bugs, fixing issues from Meegle, or updating them after deployment.
---

# Meegle Bug Fix

Handle each Bug independently. Do not claim a stage without evidence from its source system.

## Respect the authorized scope

Infer permission only from the user's request:

| Request | Allowed actions |
|---|---|
| Find or check Bugs | Read Meegle |
| Diagnose or reproduce | Read Meegle and the workspace |
| Fix | Edit and test locally |
| Commit | Create the requested local commit |
| Push | Push only when the user explicitly requests it; never push by default |
| Deploy | Deploy only after showing the project, pipeline, SHA, job, and environment and receiving any required approval |
| Close or update | Confirm business values, write to Meegle, and read back |

“Automate,” “finish,” and “continue” do not authorize commit, push, deployment, or shared-data updates.

## Load relevant guidance

- Read [references/workflow.md](references/workflow.md) before repairing a Bug.
- Read [references/safety-gates.md](references/safety-gates.md) before any commit, push, deployment, comment, field update, or transition.
- Read [references/meegle-writeback.md](references/meegle-writeback.md) before resolving assignment or writing to Meegle.
- Use [assets/repair-comment.md](assets/repair-comment.md) for every repair comment, and write the comment in English.

Use the declared `meegle` MCP for Bug discovery and write-back, and `gitlab_deployment` for pipeline and deployment operations. If a dependency is missing or unauthenticated, direct the user to the host's installation or login flow; do not install it or change MCP configuration unless asked. Missing Meegle blocks discovery and write-back. Missing GitLab deployment blocks only deployment and closure.

## Follow the repair workflow

1. Resolve “me” from the authenticated account. Revalidate the project, work-item type, fields, roles, pagination, and current Bug state.
2. Reproduce the issue from its description, comments, and attachments before editing. Separate facts from inference. If details are insufficient, request them only when authorized and stop without code changes.
3. Inspect the repository, applicable `AGENTS.md`, branch, remote state, submodules, and dirty worktree. Preserve unrelated changes.
4. Prefer a focused failing check before the fix. Afterward, run focused tests, relevant full tests, the production build, and a diff review as appropriate.
5. Reuse one confirmed project/ref/environment scope across all read-only `gitlab_deployment` calls in the current run; ask again only if that scope changes. For authorized delivery, keep one Bug per commit, treat deployment approval as a separate gate, and verify that the terminal job used the expected SHA.
6. After a successful deployment, tell the user that the Bug status will be transitioned and an English repair comment will be added. Resolve write-back values from current valid values, explicit user input, and unique live options. If ambiguity remains, ask one consolidated question for all ready Bugs; then transition, comment, and read back the result.

Stop a Bug when required details or external actions are unavailable. Never skip from discovery or a local commit to closure, and report local, committed, pushed, deployed, and Meegle states separately.

## Validate and report

When a run-state JSON file is used, validate its structure before claiming closure:

```powershell
node scripts/validate-run-state.mjs <run-state.json>
```

The validator does not replace live Git, test, deployment, or Meegle evidence.

For each Bug, report its ID and title, reproduction or blocker, root cause, changed files and commit SHA, verification results, deployment evidence, Meegle read-back, untouched changes, and untested behavior. Do not call it completed while required evidence is missing.
