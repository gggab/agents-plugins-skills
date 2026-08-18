# Bug repair workflow

## 1. Preflight

1. Determine the exact actions authorized by the user.
2. Check Meegle authentication before every business operation.
3. Resolve a supplied URL with the official URL decoder; never parse path segments manually.
4. Resolve the authoritative project key, authenticated user, work-item type, field metadata, role metadata, and pagination.
5. Inspect the target workspace and nearest instructions before editing.

Stop on permission denial, ambiguous project matches, or unavailable required tools. Do not substitute remembered IDs or schemas.

## 2. Discover and select Bugs

For “assigned to me,” query the authenticated user through assignment semantics such as the current operator role or `current_status_operator`. Filter unfinished states using current metadata rather than a permanent hard-coded list. Check every page before claiming completeness.

Return a concise `ID | priority | status | title` list. Keep discovery read-only. Ask the user to select the repair scope unless they explicitly requested all returned Bugs.

## 3. Read and reproduce one Bug

Read the description, current status, operator, comments, attachments, operation records, and acceptance criteria. Record:

- confirmed facts;
- current inference;
- missing or unverified information.

Reproduce through the real path relevant to the report: browser/UI state, permission combination, API request and persistence, visual comparison, or a failing automated check.

If reproduction information is insufficient, request environment, account/permissions, steps, expected result, actual result, and evidence. Set `NEEDS_DETAIL`; do not edit, commit, deploy, or close that Bug.

## 4. Protect the repository

1. Identify the owning repository from evidence; do not assume every Bug belongs to the same frontend.
2. Read repository instructions.
3. Inspect branch, worktree, submodules, remote tracking, and existing commits.
4. Preserve unrelated changes and avoid unrelated repositories or submodules.
5. Update from the requested branch before editing when the user requires it; use only safe fast-forward behavior around dirty worktrees.

## 5. Repair and verify

Prefer the smallest root-cause fix that covers the actual path. Reuse existing enums, permission helpers, and project patterns. Do not add speculative abstractions.

Run, in proportion to the change:

1. a focused failing check before the repair when practical;
2. the focused check after the repair;
3. relevant full tests;
4. production build;
5. diff/format validation;
6. a real-page or screenshot check for visual or interaction changes.

Do not describe a silent or non-terminal process as passed.

## 6. Commit one Bug at a time

Commit only when explicitly requested. Stage exact files, inspect the staged diff, and create one commit per Bug. Maintain `Bug ID -> commit SHA -> files -> verification` mapping. Do not include unrelated user files, generated browser artifacts, or another Bug.

## 7. Push and deploy

Push only when explicitly requested. Before deployment, resolve and show the exact project, ref, pipeline, full SHA, manual job, and target environment. Obtain every confirmation required by the deployment tool.

Trigger only the approved job and poll it to a terminal state. A successful overall pipeline is not proof that the target environment was deployed. On failure or SHA mismatch, stop closure and report the deployed state truthfully.

## 8. Update and close Meegle

After successful deployment, revalidate authentication and reread every Bug. Obtain confirmation for target state and required business fields. Follow [meegle-writeback.md](meegle-writeback.md), then add the requested repair comment and read back status, fields, and comment.

When only part of a cross-component repair is complete, retain an unfinished state such as `IN PROGRESS` or `REOPENED` according to the user's confirmed choice. Never close from frontend-only evidence when backend or environment work remains.

## 9. Resume safely

On a resumed run, rediscover live state before acting. Use the last verified state only as a hint. Check whether the commit, push, deployment, comment, or transition already exists to avoid duplicate side effects.
