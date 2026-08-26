# Meegle Bug Fix 使用文档

本文面向第一次使用 `meegle-fix-bugs` 的同事，覆盖安装、连接鉴权、首次验证，以及从查询 Bug 到修复、部署和飞书项目回写的完整流程。

## 1. 插件能做什么

`meegle-fix-bugs` 用于把一次 Bug 处理串成可核验的流程：

1. 从飞书项目（Meegle）查询分配给当前用户的未完成 Bug。
2. 读取 Bug 描述、评论、附件和验收条件，并沿真实路径复现。
3. 在对应的本地代码仓库中进行最小修改和测试。
4. 按授权范围创建提交、推送，并查询或执行 GitLab 部署。
5. 部署成功后，按当前 Meegle 元数据更新状态、字段和修复评论，并读取确认。

插件不会因为用户说“继续”“自动完成”或“全部完成”就默认提交、推送、部署或修改飞书项目。

## 2. 前置条件

使用前请确认：

- 已安装 Codex CLI，或正在使用支持 Codex 插件的 ChatGPT/Codex 桌面端。
- 能访问本仓库：
  `git@gitlab.sz.sensetime.com:ksa/standard-smart-office/framework/standard-smartoffice-plugins.git`。
- 使用 Meegle 时，当前账号有目标飞书项目和 Bug 的读取/编辑权限。
- 使用 GitLab 查询或部署时，当前网络可以访问 GitLab Deployment MCP；部署还需要对应项目和环境权限。
- 已准备要修复的业务代码仓库，并从该代码仓库启动 Codex 任务。

## 3. 安装插件

### 3.1 添加团队 Marketplace

在 Windows PowerShell、macOS Terminal 或 Linux Shell 中执行：

```text
codex plugin marketplace add "git@gitlab.sz.sensetime.com:ksa/standard-smart-office/framework/standard-smartoffice-plugins.git" --ref master
```

确认 Marketplace 已登记：

```text
codex plugin marketplace list
```

### 3.2 安装插件

```text
codex plugin add meegle-fix-bugs@standard-smart-office
```

安装完成后：

- 重启 ChatGPT/Codex 桌面端，或新建一个 Codex CLI 会话，使新插件和 MCP 连接被加载。
- 在 Codex CLI 中输入 `/plugins`，确认 `meegle-fix-bugs` 已启用。

### 3.3 更新插件

当团队发布新版本时，先更新 Marketplace，再重新打开任务：

```text
codex plugin marketplace upgrade standard-smart-office
```

如果插件仍未出现，检查 Marketplace 列表、Git 仓库读取权限，以及当前会话是否已重启。

## 4. 配置连接和鉴权

插件自带两个 MCP 连接：

| 连接 | 用途 | 鉴权方式 | 何时必须 |
| --- | --- | --- | --- |
| `meegle` | 查询/读取/回写飞书项目 Bug | 首次业务调用时使用个人账号 OAuth | 查询、诊断、回写都需要 |
| `gitlab_deployment` | 查询 Pipeline/Job 和执行部署 | 本机环境变量 `GITLAB_MCP_ACCESS_TOKEN` | 本地修复可不配；查询部署或部署时需要 |

连接配置由插件包中的 `.mcp.json` 和插件 manifest 自动加载。一般不需要手工复制 MCP URL，也不要同时配置一份旧的同名全局连接；否则可能出现重复工具或使用错误的连接。

### 4.1 Meegle OAuth 鉴权

1. 安装插件并重启 Codex 会话。
2. 在目标代码仓库目录启动 Codex。
3. 首次执行需要读取飞书项目的请求，例如：

   ```text
   使用 $meegle-fix-bugs 查询飞书项目中分配给我的所有未完成 Bug。
   只读查询，不修改任何数据。
   ```

4. 按 Codex/Meegle 弹出的浏览器 OAuth 页面登录自己的飞书账号并授权。
5. 回到 Codex，确认能返回当前账号可见的 Bug 列表。

OAuth 应由每位使用者使用自己的账号完成。不要在聊天、命令行参数、配置文件或 Issue 评论中粘贴 App Secret、Token、密码或带凭证的 URL。

同一连续任务中，插件会复用已建立的 Meegle 会话和已解析的项目/字段信息。只有任务恢复、连接重建、账号或项目发生变化，或调用返回认证错误时，才需要重新鉴权或重新解析。

### 4.2 GitLab Deployment 鉴权

GitLab Deployment MCP 使用 GitLab Personal Access Token（PAT）。插件通过本机环境变量 `GITLAB_MCP_ACCESS_TOKEN` 读取 Token，不会把 Token 保存到插件仓库。

#### 1. 在 GitLab 创建 Token

进入 GitLab：`头像 → Edit profile → Access → Personal access tokens`，创建一个 Personal Access Token：

- Token name：例如 `codex-gitlab-mcp`；
- 设置过期时间；
- Scope 勾选 `api`。

Token 只能在创建后查看一次，请立即保存。Token 本身不会增加项目权限，创建 Token 的账号仍需要拥有目标项目、Pipeline/Job 和部署环境权限。

#### 2. Windows 配置

Windows PowerShell（持久化到当前用户环境）：

```powershell
[Environment]::SetEnvironmentVariable('GITLAB_MCP_ACCESS_TOKEN', '<你的 GitLab Token>', 'User')
```

设置后关闭并重新打开 Codex/终端，使新进程读取到环境变量。

#### 3. macOS 配置

在连接公司内网或 VPN 后，打开 macOS Terminal，执行服务器提供的接入脚本：

```bash
curl -fsSL 'http://10.164.19.166/join-personal-token-macos.sh' | bash
```

执行时按提示输入刚刚创建的 GitLab Token，输入内容不会显示。脚本会：

- 将 Token 保存到当前 macOS 用户的 Keychain；
- 创建登录时加载 `GITLAB_MCP_ACCESS_TOKEN` 的 LaunchAgent；
- 配置 Codex、Cursor 和 Kimi Code 使用 `http://10.164.19.166/mcp/gitlab-deployment`；
- 如果本机安装了 Claude Code，同时更新其用户级 MCP 配置。

Token 不会直接写入 `~/.codex/config.toml`、`~/.cursor/mcp.json` 或 `~/.kimi-code/mcp.json`；这些文件只保存 MCP 地址和环境变量引用。执行完成后，完全退出并重新打开 Codex、Cursor 或 Kimi Code。

不要使用 GitLab 的 `blob` 页面或需要登录的私有 Raw 地址执行脚本。该 MCP 地址是 HTTP 内网地址，只能在可信的公司内网或 VPN 中使用。不要把真实 Token 写入仓库、`.env`、脚本、截图或聊天记录。

GitLab Token 未配置或连接不可用时，仍可以执行 Meegle 查询、问题复现和本地修复；但不能据此宣称已查询或完成部署，也不能完成部署后的闭环回写。

### 4.3 连接检查

先做只读验证：

```text
使用 $meegle-fix-bugs 检查当前可用的 Meegle Bug 数据，只读，不修改任何数据。
```

如果需要验证部署侧：

```text
检查这个提交是否已经部署到 jv26，只查询，不触发部署：<commit SHA>
```

常见现象与处理方式：

| 现象 | 处理 |
| --- | --- |
| 找不到 `$meegle-fix-bugs` | 重启会话，并用 `/plugins` 检查插件是否启用 |
| Meegle 要求登录 | 完成当前账号 OAuth；不要提供 Token 给助手 |
| Meegle 无项目或 Bug | 检查飞书账号、项目权限和网络 |
| GitLab 部署工具不可用 | 检查 `GITLAB_MCP_ACCESS_TOKEN`、VPN/内网和会话重启；本地修复不受影响 |
| 工具重复出现 | 关闭用户级配置中旧的同名 MCP，仅保留插件加载的连接 |

## 5. 推荐使用流程

### 第一步：只读查询待办 Bug

```text
使用 $meegle-fix-bugs 查询飞书项目中分配给我的所有未完成 Bug。
只列出 ID、优先级、状态和标题，不修改任何数据。
```

如果提供的是 Meegle URL，直接把 URL 交给助手，由插件使用官方 URL 解码流程解析，不要手工拆 URL 获取项目或视图 ID。

### 第二步：读取证据并复现

选择一个 Bug 后，先只诊断：

```text
使用 $meegle-fix-bugs 处理 Bug ABC-123。
读取描述、评论、附件和验收条件，并在本地真实路径复现问题。
只诊断，不修改代码。
```

助手应先说明：

- 已确认的事实；
- 当前推断的根因；
- 复现步骤、实际结果和预期结果；
- 缺少的环境、账号权限或测试信息。

如果无法根据现有证据复现，应停在诊断阶段，不要直接修改代码。

### 第三步：授权本地修复和验证

确认诊断后，明确授权本地改动：

```text
修复 Bug ABC-123。允许修改本地代码并运行相关测试，
但不要提交、推送、部署或更新飞书项目。
```

完成后应检查变更范围，并分别报告：根因、修改文件、测试结果、构建结果，以及未测试的行为。无关的工作区改动必须保留。

### 第四步：按需提交和推送

提交和推送是独立授权的：

```text
提交 Bug ABC-123 的改动，一个 Bug 一个 commit，不要推送。
```

```text
推送 Bug ABC-123 的提交，但不要部署。
```

一个 Bug 只对应一个提交，不要混入其他 Bug 或无关文件。

### 第五步：查询部署信息

部署前可先只读查询：

```text
检查 Bug ABC-123 对应提交是否可以部署到 jv26，
只查询，不触发部署。
```

部署前必须能明确对应的项目、分支/ref、Pipeline、完整 commit SHA、目标 Job 和环境。成功的整体 Pipeline 不等于目标环境已经部署成功。

### 第六步：批准并执行部署

需要部署时，一次性明确目标：

```text
展示项目、Pipeline、完整 SHA、Job 和目标环境，
等我确认后部署到 jv26。只部署这个目标，不触发其他 Job。
```

助手展示准确目标后，只需对该目标做一次批准。部署任务必须轮询到最终状态；Job 失败、SHA 不一致或状态未结束时，都不能宣称部署完成。

### 第七步：部署成功后回写 Meegle

如果需要闭环，可以在部署授权中一并列出回写范围：

```text
部署成功后更新 Bug ABC-123 的状态和必填字段，
添加简洁的中英文双语修复评论，并读取确认；不要再次询问。
```

回写前插件会重新读取 Bug 当前状态、合法流转、必填字段和当前有效选项。状态、分类、解决结果、负责人等业务值不能凭记忆猜测。

回写后必须读取确认：

- 最终状态；
- 解决结果和问题分类；
- 负责人/处理人（如果发生变化）；
- 修复评论的实际内容。

只有代码、部署和 Meegle 状态都获得对应证据，才能称为完整闭环。Meegle 写入失败时，应分别报告代码和部署结果，不得声称 Bug 已关闭。

## 6. 一次性执行完整闭环的示例

适合已经明确 Bug 范围和授权边界时使用：

```text
使用 $meegle-fix-bugs 处理 Bug ABC-123：
先读取描述、评论、附件和验收条件并复现问题；
确认根因后修改本地代码，运行相关测试和生产构建；
每个 Bug 一个 commit 并推送。

准备部署到 jv26 时，展示准确的项目、分支、Pipeline、完整 commit SHA、
目标 Job、环境，以及部署成功后拟更新的 Meegle 状态、字段和中英文评论，
等我一次确认。部署成功后按已确认方案回写 Meegle，并读取确认结果。
```

若用户没有明确授权其中某一阶段，流程应停在该阶段，不要自动扩大权限范围。

## 7. 安全和授权规则

| 操作 | 默认权限 |
| --- | --- |
| 查询项目、Bug、评论、字段和状态 | 只读请求即可 |
| 读取代码、复现和本地诊断 | 诊断请求 |
| 修改本地代码并运行测试 | 修复请求 |
| 创建 commit | 明确的提交请求 |
| 推送分支 | 明确的推送请求 |
| 查询部署状态 | 只读请求 |
| 触发部署 | 展示准确目标后的单次目标批准 |
| 修改 Meegle 状态、字段、负责人或评论 | 明确的回写授权和有效业务值 |

以下情况必须停止当前 Bug 的闭环：无法复现、必要信息不足、测试/构建失败、部署 SHA 不一致、部署 Job 失败或未结束、Meegle 必填值无法确认，或回写无法读取验证。

## 8. 版本和源码位置

- Marketplace 配置：[`../.agents/plugins/marketplace.json`](../.agents/plugins/marketplace.json)
- 插件 manifest：[`./.codex-plugin/plugin.json`](./.codex-plugin/plugin.json)
- MCP 连接配置：[`./.mcp.json`](./.mcp.json)
- 核心技能规则：[`./skills/meegle-fix-bugs/SKILL.md`](./skills/meegle-fix-bugs/SKILL.md)
- 安全授权规则：[`./skills/meegle-fix-bugs/references/safety-gates.md`](./skills/meegle-fix-bugs/references/safety-gates.md)
- Meegle 回写规则：[`./skills/meegle-fix-bugs/references/meegle-writeback.md`](./skills/meegle-fix-bugs/references/meegle-writeback.md)
