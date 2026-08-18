# Safety gates and failure policy

## Authorization matrix

| Action | Required authority |
|---|---|
| Query projects, Bugs, metadata, comments, and status | Read request |
| Add a missing-detail comment | Explicit Bug-processing or comment request |
| Edit workspace files and run tests | Fix/repair request |
| Create a Git commit | Explicit commit request |
| Push a branch | Explicit push/publish request |
| Configure deployment read scope | Required project-scope confirmation |
| Trigger a deployment job | Target-specific deployment approval |
| Set classification, resolution, state, person, or date | Explicit business-value confirmation |

Do not combine these authorities. For example, deployment approval does not approve Meegle classification, and a repair request does not approve a push.

## Shared-state safeguards

- Never expose credentials, tokens, secrets, or credential-bearing URLs.
- Resolve exact projects, work items, branches, SHAs, pipelines, jobs, and environments before a write.
- Preserve unrelated worktree changes and independently owned submodules.
- Do not rewrite history, replace tags, reset broad paths, or use destructive cleanup as part of this workflow.
- Use current tool inspection/schema when a command or parameter is uncertain.

## Stop conditions

Stop the affected Bug when:

- the report cannot be reproduced from available evidence;
- the workspace contains an unresolved conflict with user changes;
- tests or build fail for an unexplained reason;
- the expected commit is not the deployment SHA;
- the deployment job fails or remains non-terminal;
- required business values are unconfirmed;
- a required field cannot be written through the available API;
- a Meegle write cannot be verified by read-back;
- backend or another component remains unfixed.

## Failure outcomes

| Failure | Required result |
|---|---|
| Missing details | `NEEDS_DETAIL`; optionally comment; no code change |
| Cannot reproduce | Keep current state; report evidence and uncertainty |
| Local verification failure | No push, deploy, or closure |
| Push failure | Local commit may exist; no deployment claim |
| Deployment failure | Keep Bug unfinished; report exact job result |
| Partial component repair | Keep or move to a user-confirmed unfinished state |
| Meegle write failure | Report code/deployment separately; do not claim closure |
| Empty write response | Read back; treat unchanged data as failure |

For repeated Meegle errors, apply targeted format/schema corrections at most twice. Stop after three equivalent failures instead of blindly retrying.
