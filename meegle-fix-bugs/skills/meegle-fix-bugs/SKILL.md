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
| Deploy | Show the project, pipeline, SHA, job, and environment, then require exactly one target-specific approval; never add a scope-confirmation or magic-phrase gate |
| Close or update | Confirm business values, write to Meegle, and read back |

“Automate,” “finish,” and “continue” do not authorize commit, push, deployment, or shared-data updates.

## Load relevant guidance

- Read [references/workflow.md](references/workflow.md) before repairing a Bug.
- Read [references/safety-gates.md](references/safety-gates.md) before any commit, push, deployment, comment, field update, or transition.
- Read [references/meegle-writeback.md](references/meegle-writeback.md) before resolving assignment or writing to Meegle.
- Use [assets/repair-comment.md](assets/repair-comment.md) for every repair comment. Keep it concise and bilingual (Chinese/English); keep Verification to tests/build and deployment environment, SHA, and status only.

Use the declared `meegle` MCP for Bug discovery and write-back, and `gitlab_deployment` for pipeline and deployment operations. If a dependency is missing or unauthenticated, direct the user to the host's installation or login flow; do not install it or change MCP configuration unless asked. Missing Meegle blocks discovery and write-back. Missing GitLab deployment blocks only deployment and closure.

## Follow the repair workflow

1. Resolve “me,” the project, work-item type, fields, roles, and pagination once per uninterrupted run. Reuse them while the account, project, connector session, and schema are unchanged; revalidate only after a resume/reconnect, a relevant change, or an authentication/schema error. Always reread the current Bug state before a write.
2. Reproduce the issue from its description, comments, and attachments before editing. Separate facts from inference. If details are insufficient, request them only when authorized and stop without code changes.
3. Inspect the repository, applicable `AGENTS.md`, branch, remote state, submodules, and dirty worktree. Preserve unrelated changes.
4. Prefer a focused failing check before the fix. Afterward, run focused tests, relevant full tests, the production build, and a diff review as appropriate.
5. Select one project/ref/environment scope and reuse it across all read-only `gitlab_deployment` calls in the current run without asking for approval. For authorized delivery, keep one Bug per commit, obtain only the deployment write approval, and verify that the terminal job used the expected SHA.
6. Before deployment approval, include the proposed post-success Meegle transitions, fields, and repair comments when the user asked for the full repair workflow. Resolve write-back values from current valid values, explicit user input, and unique live options. Ask one consolidated question only when a business value is genuinely ambiguous. After successful deployment, reuse that authorization to transition, comment, and read back without asking the user to say “修改状态” first.

Stop a Bug when required details or external actions are unavailable. Never skip from discovery or a local commit to closure, and report local, committed, pushed, deployed, and Meegle states separately.

## Validate and report

When a run-state JSON file is used, validate its structure before claiming closure:

```powershell
node scripts/validate-run-state.mjs <run-state.json>
```

The validator does not replace live Git, test, deployment, or Meegle evidence.

For each Bug, report its ID and title, reproduction or blocker, root cause, changed files and commit SHA, verification results, deployment evidence, Meegle read-back, untouched changes, and untested behavior. Do not call it completed while required evidence is missing.
