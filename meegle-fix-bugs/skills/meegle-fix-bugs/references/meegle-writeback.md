# Meegle query and write-back contract

Use the current installed Meegle skill or official MCP schema as the authoritative API reference. The rules below define required behavior, not permanent tool names or IDs.

## Query contract

1. Let the first required business call establish authentication. Reuse the authenticated session and resolved current user within an uninterrupted run; do not call account/project lookup again as an OAuth smoke test unless the task resumed, the connector reconnected, the account/project changed, or a call returned an authentication error.
2. Decode Meegle URLs with the official decoder.
3. Resolve the decoded space name to an authoritative project key.
4. Resolve the authenticated user automatically for “me.”
5. Inspect work-item type, field, role, and status metadata before interpreting values.
6. Query only necessary fields and follow pagination to completion.
7. Confirm assignment using the current operator role or equivalent current-status operator field.

## State-transition contract

1. Reread every ready work item, current legal transitions, required fields, and live options before asking anything.
2. Reuse a current valid field value. Use a value already stated by the user or Bug evidence when it maps exactly to one live option. Use a target state or missing field without asking only when one legal choice satisfies the requested outcome.
3. If ambiguity remains, ask one consolidated question covering the proposed target state and every unresolved required field for all ready Bugs. Show labels, not raw IDs, and include a recommended choice when evidence supports one.
4. Treat that answer as confirmation for the listed Bugs and values. Do not ask another field-by-field or per-Bug question for the same transition attempt.
5. Convert resolved values using the current field protocol, update them, and attempt the transition.
6. If the service reveals a previously undiscoverable required value that cannot be resolved by the rules above, stop and report it instead of starting another question loop. Retry only schema or format corrections that do not change the confirmed business meaning, at most twice.

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
