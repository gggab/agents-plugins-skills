# Standard Smart Office Plugins

Standard Smart Office 团队维护的 Codex 插件仓库。仓库通过 Marketplace 向团队成员分发插件。

## 可用插件

| 插件 | 用途 |
| --- | --- |
| [meegle-fix-bugs](./meegle-fix-bugs/README.md) | 从飞书项目 Bug 查询、复现和修复，到受控提交、部署与状态回写 |

## 安装

需要安装 Codex CLI，并拥有本仓库的读取权限。以下命令可在 Windows PowerShell、macOS zsh 和 Linux bash 中执行：

```text
codex plugin marketplace add "git@gitlab.sz.sensetime.com:ksa/standard-smart-office/framework/standard-smartoffice-plugins.git" --ref master
codex plugin add meegle-fix-bugs@standard-smart-office
```

安装完成后，重启 ChatGPT/Codex 桌面端或新建 Codex CLI 会话。也可以在 Codex CLI 中输入 `/plugins` 查看、启用或停用插件。

## 更新 Marketplace

```text
codex plugin marketplace upgrade standard-smart-office
```

如果插件没有出现在列表中，先确认 Git 仓库访问权限，再检查 Marketplace：

```text
codex plugin marketplace list
```

Marketplace 配置位于 [`.agents/plugins/marketplace.json`](./.agents/plugins/marketplace.json)。插件的依赖和具体用法请查看各插件目录中的 README。

完整的安装、OAuth/Token 鉴权配置和使用流程：[`中文`](./meegle-fix-bugs/USAGE.md) | [`English`](./meegle-fix-bugs/USAGE.en.md)。
