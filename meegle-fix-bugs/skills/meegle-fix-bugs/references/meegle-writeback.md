# Meegle query and write-back contract

Use the current installed Meegle skill or official MCP schema as the authoritative API reference. The rules below define required behavior, not permanent tool names or IDs.

## Query contract

1. Check authentication before a business operation.
2. Decode Meegle URLs with the official decoder.
3. Resolve the decoded space name to an authoritative project key.
4. Resolve the authenticated user automatically for “me.”
5. Inspect work-item type, field, role, and status metadata before interpreting values.
6. Query only necessary fields and follow pagination to completion.
7. Confirm assignment using the current operator role or equivalent current-status operator field.

## State-transition contract

1. Reread the work item and list current legal transitions.
2. Require the user to choose when multiple targets fit or when the target state is not explicit.
3. Attempt the confirmed transition.
4. If the service reports missing required fields, query outstanding requirements and field metadata.
5. Present all missing business fields and legal options in one confirmation request.
6. Convert confirmed values using the current field protocol, update them, and retry the transition.
7. Stop after two targeted corrections when the same transition still fails.

Never invent enum choices, assignees, dates, classifications, or resolution results. Never reuse historical transition or option IDs without live metadata.

## Field-format rules

- Treat the current schema as authoritative.
- For Meegle STRING protocols, stringify arrays and objects before passing them as `field_value`.
- Write select/radio values using current option IDs, not display labels.
- Write multi-select values in the exact stringified shape required by the current schema.
- Do not update roles through ordinary fields when the API provides a role operation contract.

## Comment contract

Add one independent comment per Bug when requested. Use [../assets/repair-comment.md](../assets/repair-comment.md) and include only verified facts: root cause, fix, commit, tests, build, deployment target, exact deployed SHA, and final status. Do not claim production or deployment success from a local commit.

## Read-back contract

After updates, transitions, or comments, read back:

- final state;
- resolution result;
- problem classification;
- relevant assignee/operator when changed;
- the created comment content.

Treat an empty response or transport-level success as inconclusive until read-back matches the requested values.
