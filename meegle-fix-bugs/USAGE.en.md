# Meegle Bug Fix User Guide

[中文版](./USAGE.md)

This guide is intended for first-time users of `meegle-fix-bugs`. It covers installation, connection authentication, initial verification, and the complete workflow from querying bugs through fixing, deployment, and Feishu Project updates.

## 1. What the Plugin Does

`meegle-fix-bugs` connects the full bug-fix workflow with verifiable evidence:

1. Query incomplete bugs assigned to the current user in Feishu Project (Meegle).
2. Read bug descriptions, comments, attachments, and acceptance criteria, then reproduce the issue through the real application path.
3. Make the smallest necessary change in the relevant local repository and run appropriate tests.
4. Create commits, push changes, and query or execute GitLab deployments within the authorized scope.
5. After a successful deployment, update the current Meegle status, fields, and fix comment, then read the item back for verification.

The plugin does not automatically commit, push, deploy, or modify Feishu Project data merely because the user says “continue,” “complete automatically,” or “finish everything.”

## 2. Prerequisites

Before using the plugin, confirm that:

- Codex CLI is installed, or you are using a ChatGPT/Codex desktop app that supports Codex plugins.
- You can access this repository:
  `git@gitlab.sz.sensetime.com:ksa/standard-smart-office/framework/standard-smartoffice-plugins.git`.
- Your Feishu account has permission to read or edit the target project and bug.
- Your network can reach GitLab Deployment MCP when querying or executing deployments; deployment also requires access to the target project and environment.
- The business code repository to be fixed is available locally, and the Codex task is started from that repository.

## 3. Install the Plugin

### 3.1 Add the Team Marketplace

Run the following command in Windows PowerShell, macOS Terminal, or a Linux shell:

```text
codex plugin marketplace add "git@gitlab.sz.sensetime.com:ksa/standard-smart-office/framework/standard-smartoffice-plugins.git" --ref master
```

Confirm that the Marketplace is registered:

```text
codex plugin marketplace list
```

### 3.2 Install the Plugin

```text
codex plugin add meegle-fix-bugs@standard-smart-office
```

After installation:

- Restart the ChatGPT/Codex desktop app, or create a new Codex CLI session so the plugin and MCP connections are loaded.
- In Codex CLI, enter `/plugins` and confirm that `meegle-fix-bugs` is enabled.

### 3.3 Update the Plugin

When the team publishes a new version, update the Marketplace and reopen the task:

```text
codex plugin marketplace upgrade standard-smart-office
```

If the plugin still does not appear, check the Marketplace list, your Git repository access, and whether the current session has been restarted.

## 4. Configure Connections and Authentication

The plugin includes two MCP connections:

| Connection | Purpose | Authentication | Required When |
| --- | --- | --- | --- |
| `meegle` | Query, read, and update Feishu Project bugs | Personal account OAuth on the first business request | Required for querying, diagnosis, and updates |
| `gitlab_deployment` | Query pipelines/jobs and execute deployments | Local `GITLAB_MCP_ACCESS_TOKEN` environment variable | Optional for local fixes; required for deployment queries and execution |

The plugin package loads these connections automatically from `.mcp.json` and the plugin manifest. You normally do not need to copy the MCP URL manually. Avoid keeping an older global connection with the same name, because duplicate tools or the wrong connection may be loaded.

### 4.1 Meegle OAuth Authentication

1. Install the plugin and restart the Codex session.
2. Start Codex from the target code repository.
3. Make an initial read-only Feishu Project request, for example:

   ```text
   Use $meegle-fix-bugs to list all incomplete Feishu Project bugs assigned to me.
   Read-only: do not modify any data.
   ```

4. Sign in with your own Feishu account and authorize access in the browser OAuth page opened by Codex/Meegle.
5. Return to Codex and confirm that bugs visible to the current account are returned.

Each user must complete OAuth with their own account. Do not paste an App Secret, token, password, or credential-bearing URL into a chat, command-line argument, configuration file, or issue comment.

Within one continuous task, the plugin reuses the established Meegle session and resolved project and field metadata. Authentication or metadata should be resolved again only when the task is resumed, the connection is rebuilt, the account or project changes, or a request returns an authentication error.

### 4.2 GitLab Deployment Authentication

GitLab Deployment MCP uses a GitLab Personal Access Token (PAT). The plugin reads it from the local `GITLAB_MCP_ACCESS_TOKEN` environment variable and never stores it in the plugin repository.

#### 1. Create a Token in GitLab

In GitLab, open `Avatar → Edit profile → Access → Personal access tokens`, then create a Personal Access Token with:

- Token name: for example, `codex-gitlab-mcp`;
- An expiration date;
- The `api` scope.

The token is displayed only once after creation, so save it immediately. A token does not grant additional project permissions: its owner must already have access to the target project, pipeline/job, and deployment environment.

#### 2. Configure Windows

Run the following command in Windows PowerShell to save the token for the current user:

```powershell
[Environment]::SetEnvironmentVariable('GITLAB_MCP_ACCESS_TOKEN', '<your GitLab token>', 'User')
```

Close and reopen Codex or the terminal so the new process receives the environment variable.

#### 3. Configure macOS

Connect to the company network or VPN, open macOS Terminal, and run the hosted setup script:

```bash
curl -fsSL 'http://10.164.19.166/join-personal-token-macos.sh' | bash
```

Enter the GitLab token when prompted. The input is hidden. The script will:

- Store the token in the current macOS user's Keychain;
- Create a LaunchAgent that loads `GITLAB_MCP_ACCESS_TOKEN` at login;
- Configure Codex, Cursor, and Kimi Code to use `http://10.164.19.166/mcp/gitlab-deployment`;
- Update the user-level MCP configuration if Claude Code is installed.

The token is not written directly to `~/.codex/config.toml`, `~/.cursor/mcp.json`, or `~/.kimi-code/mcp.json`. These files contain only the MCP address and environment-variable reference. After setup, fully quit and reopen Codex, Cursor, or Kimi Code.

Do not execute the GitLab `blob` page or a private Raw URL that requires login. This MCP endpoint uses an internal HTTP address and must only be used on a trusted company network or VPN. Never place the real token in a repository, `.env` file, script, screenshot, or chat message.

Without a valid GitLab token or connection, you can still query Meegle, reproduce the issue, and make a local fix. However, you cannot claim that deployment was queried or completed, and you cannot complete deployment-dependent Meegle closure.

### 4.3 Verify the Connections

Start with a read-only request:

```text
Use $meegle-fix-bugs to check the Meegle bug data currently available to me.
Read-only: do not modify any data.
```

To verify the deployment side:

```text
Check whether this commit has been deployed to jv26. Query only; do not trigger a deployment: <commit SHA>
```

| Symptom | Action |
| --- | --- |
| `$meegle-fix-bugs` is not found | Restart the session and use `/plugins` to confirm that the plugin is enabled |
| Meegle asks you to sign in | Complete OAuth with the current account; do not provide the token to the assistant |
| No project or bug is returned | Check the Feishu account, project permissions, and network |
| GitLab deployment tools are unavailable | Check `GITLAB_MCP_ACCESS_TOKEN`, company network/VPN access, and restart the session; local fixes remain available |
| Tools appear more than once | Disable the older user-level MCP connection with the same name and keep the plugin-provided connection |

## 5. Recommended Workflow

### Step 1: Query Assigned Bugs Read-Only

```text
Use $meegle-fix-bugs to list all incomplete Feishu Project bugs assigned to me.
Show only ID, priority, status, and title. Do not modify any data.
```

If you have a Meegle URL, provide the complete URL to the assistant. The plugin uses the official URL-decoding flow; do not manually extract a project or view ID.

### Step 2: Read Evidence and Reproduce

After selecting a bug, begin with diagnosis only:

```text
Use $meegle-fix-bugs to process bug ABC-123.
Read its description, comments, attachments, and acceptance criteria, then reproduce it through the real local path.
Diagnose only; do not modify code.
```

The assistant should first report:

- Confirmed facts;
- The currently inferred root cause;
- Reproduction steps, actual result, and expected result;
- Missing environment, account permission, or test information.

If the available evidence is insufficient to reproduce the issue, the workflow must stop at diagnosis instead of changing code blindly.

### Step 3: Authorize the Local Fix and Verification

After confirming the diagnosis, explicitly authorize local changes:

```text
Fix bug ABC-123. You may modify local code and run relevant tests,
but do not commit, push, deploy, or update Feishu Project.
```

After the fix, review the change scope and report the root cause, changed files, test results, build result, and any behavior that was not tested. Unrelated working-tree changes must be preserved.

### Step 4: Commit and Push When Needed

Commit and push require separate authorization:

```text
Commit the changes for bug ABC-123. Use one commit for this bug and do not push.
```

```text
Push the commit for bug ABC-123, but do not deploy it.
```

Each bug must have its own commit and must not include unrelated files or another bug's changes.

### Step 5: Query Deployment Information

Before deployment, you can make a read-only query:

```text
Check whether the commit for bug ABC-123 can be deployed to jv26.
Query only; do not trigger deployment.
```

Before deployment, the exact project, branch/ref, pipeline, full commit SHA, target job, and environment must be identified. A successful overall pipeline does not prove that the target environment has been deployed.

### Step 6: Approve and Execute Deployment

When deployment is required, specify the target once:

```text
Show the project, pipeline, full SHA, job, and target environment.
Wait for my confirmation before deploying to jv26. Deploy only this target and do not trigger other jobs.
```

After the assistant presents the exact target, one approval is sufficient for that target. The deployment job must be polled to a terminal state. A failed job, SHA mismatch, or unfinished state must never be reported as a successful deployment.

### Step 7: Update Meegle After Successful Deployment

To close the workflow, the deployment authorization can also define the update scope:

```text
After deployment succeeds, update the status and required fields of bug ABC-123.
Add a concise bilingual Chinese-English fix comment and read the item back for verification. Do not ask again.
```

Before writing, the plugin reloads the bug's current state, valid transitions, required fields, and currently valid options. Business values such as status, category, resolution, and owner must not be guessed from memory.

After writing, the plugin must read back and confirm:

- Final status;
- Resolution and issue category;
- Owner or assignee, if changed;
- The actual fix comment.

The workflow is complete only when code, deployment, and Meegle state are all supported by corresponding evidence. If the Meegle write fails, report code and deployment results separately and do not claim that the bug is closed.

## 6. Complete End-to-End Example

Use this form when the bug scope and authorization boundaries are already clear:

```text
Use $meegle-fix-bugs to process bug ABC-123:
First read the description, comments, attachments, and acceptance criteria, then reproduce the issue.
After confirming the root cause, modify the local code and run relevant tests and the production build.
Use one commit per bug and push the commit.

Before deploying to jv26, show the exact project, branch, pipeline, full commit SHA,
target job, environment, and the proposed Meegle status, fields, and bilingual comment.
Wait for one confirmation. After deployment succeeds, apply the approved Meegle updates and read them back for verification.
```

If the user has not explicitly authorized a stage, the workflow must stop at that stage instead of expanding its authority automatically.

## 7. Safety and Authorization Rules

| Operation | Default Authorization |
| --- | --- |
| Query projects, bugs, comments, fields, and states | Read-only request |
| Read code, reproduce, and diagnose locally | Diagnosis request |
| Modify local code and run tests | Fix request |
| Create a commit | Explicit commit request |
| Push a branch | Explicit push request |
| Query deployment status | Read-only request |
| Trigger deployment | One target-specific approval after the exact target is shown |
| Modify Meegle status, fields, owner, or comments | Explicit write authorization with valid business values |

The workflow for the current bug must stop if the issue cannot be reproduced, required information is missing, tests or builds fail, the deployment SHA does not match, the deployment job fails or remains unfinished, required Meegle values cannot be confirmed, or the write cannot be verified by reading it back.

## 8. Version and Source Locations

- Marketplace configuration: [`../.agents/plugins/marketplace.json`](../.agents/plugins/marketplace.json)
- Plugin manifest: [`./.codex-plugin/plugin.json`](./.codex-plugin/plugin.json)
- MCP connection configuration: [`./.mcp.json`](./.mcp.json)
- Core skill rules: [`./skills/meegle-fix-bugs/SKILL.md`](./skills/meegle-fix-bugs/SKILL.md)
- Safety and authorization rules: [`./skills/meegle-fix-bugs/references/safety-gates.md`](./skills/meegle-fix-bugs/references/safety-gates.md)
- Meegle update rules: [`./skills/meegle-fix-bugs/references/meegle-writeback.md`](./skills/meegle-fix-bugs/references/meegle-writeback.md)
