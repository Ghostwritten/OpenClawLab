---
title: 新增 Telegram 机器人操作手册
description: 按 AI Dev Team 架构规范新增 Telegram 机器人的完整操作步骤
layout: doc
---

# 新增 Telegram 机器人操作手册

> 本文为「按 [OpenClaw AI Dev Team 架构](/lab/architecture/ai-dev-team) 规范新增一个 Telegram 机器人」的完整操作步骤，以 **系统架构师** 机器人（OpenClaw_Zong_Arch_bot）为例，从 BotFather 创建到配置生效、验证全流程说明。

---

## 一、与架构规范的对应关系

架构文档约定：

- **一机器人一角色**：每个 Telegram Bot 对应一个 `accountId`，并绑定到同名的 `agentId`（如 `architect`）。
- **Workspace**：每个 Agent 使用独立目录，建议 `~/.openclaw/workspace/<agentId>`（如 `.../workspace/architect`）。
- **Bindings**：`channel: telegram` + `accountId` → `agentId`，一一对应。
- **agents.list**：每个 agentId 在列表中有一项，含 `id`、`name`、`workspace`。

本手册按上述规范编写，新增任意角色机器人时，只需将示例中的 `architect` 替换为对应 `agentId`（如 `pm`、`dev`、`qa`、`ops`、`news`、`docs`）。

---

## 二、前置：在 BotFather 中创建机器人

1. 在 Telegram 中打开 **@BotFather**（请认准官方账号）。
2. 发送 `/newbot`，按提示操作：
   - **Bot 名称**（显示名）：如 `AI机器人-系统架构师`。
   - **Bot 用户名**（唯一）：如 `OpenClaw_Zong_Arch_bot`，须以 `_bot` 结尾。
3. 创建成功后，BotFather 会返回 **HTTP API Token**，形如：
   ```text
   1234567890:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. **妥善保存该 Token**，后续将填入 OpenClaw 配置；勿泄露或提交到公开仓库。

若需代理访问 Telegram API，请确保本机或 OpenClaw 配置了相应 `proxy`（见下文）。

---

## 三、确定 accountId 与 agentId

按 [OpenClaw AI Dev Team 架构](/lab/architecture/ai-dev-team) 中的角色表：

| 角色         | accountId   | agentId   | 说明     |
| ----------- | ----------- | --------- | -------- |
| 系统架构师   | architect   | architect | 本示例   |
| 产品经理     | pm          | pm        | 其他角色 |
| 软件工程师   | dev         | dev       | …        |
| 测试工程师   | qa          | qa        | …        |
| 运维/DevOps | ops         | ops       | …        |
| 技术情报官   | news        | news      | …        |
| 技术文档工程师 | docs        | docs      | …        |
| 平台管理员   | admin       | admin     | …        |

本手册以 **系统架构师** 为例，故使用 **accountId = agentId = `architect`**。新增其他角色时，选用上表中对应 id 即可。

---

## 四、修改 OpenClaw 配置

配置文件路径：**`~/.openclaw/openclaw.json`**（或你通过 `OPENCLAW_CONFIG_PATH` 指定的路径）。建议修改前备份一份。

### 4.1 新增 `channels.telegram.accounts.<accountId>`

在 `channels.telegram.accounts` 中增加一项，键名为 `architect`（与 accountId 一致）。若已有顶层 `proxy` 等，可继承或按账号覆盖。

示例（插入到 `accounts` 对象内）：

```json
"architect": {
  "enabled": true,
  "dmPolicy": "allowlist",
  "botToken": "<BotFather 返回的 token>",
  "allowFrom": [123456789],
  "groupPolicy": "allowlist",
  "streaming": "off",
  "proxy": "http://proxy-host:7890"
}
```

说明：

- **botToken**：替换为你在 BotFather 中获得的 Token。
- **allowFrom**：允许发起对话的 Telegram 用户 ID 列表（数字）；可先填你的 user id，多用户再追加。获取方式：给该 bot 发一条消息，在 `openclaw logs --follow` 中查看 `from.id`，或使用 @userinfobot（注意隐私）。
- **proxy**：若本机需代理才能访问 Telegram，填写 HTTP 代理 URL；否则可删或与顶层一致。

### 4.2 新增一条 binding

在顶层 **`bindings`** 数组中增加一条，将 Telegram 的 `architect` 账号绑定到 agentId `architect`：

```json
{
  "agentId": "architect",
  "match": {
    "channel": "telegram",
    "accountId": "architect"
  }
}
```

这样，发往 OpenClaw_Zong_Arch_bot 的消息会路由到 `architect` Agent。

### 4.3 在 agents.list 中新增该 Agent（若尚未存在）

若当前配置中还没有 `architect` 这一 Agent，需在 **`agents.list`** 中增加一项，并指定独立 workspace，以符合架构规范：

```json
{
  "id": "architect",
  "name": "系统架构师",
  "workspace": "~/.openclaw/workspace/architect"
}
```

- **workspace**：建议使用 `~/.openclaw/workspace/<agentId>` 形式；将 `~` 替换为你的实际 home 路径（如 `/Users/yourname`）即可。
- 若已有 `agents.defaults.workspace`，该项会继承默认模型等配置；如需该角色使用不同模型，可在此条中增加 `model` 等字段。

若你已有 `agents.list` 数组，将上述对象追加到数组中即可；若尚无 `agents.list`，需先有 `agents.defaults`，再建 `agents.list` 并加入该项。

---

## 五、创建 Workspace 目录（推荐）

为便于 Agent 读写文件、放置 SOUL/AGENTS 等，建议预先创建对应 workspace 目录：

```bash
mkdir -p ~/.openclaw/workspace/architect
```

可选：在该目录下放置 `SOUL.md`、`AGENTS.md` 等，用于定义系统架构师的角色与能力边界（参考架构文档中「Architect Agent」的职责说明）。

---

## 六、重启 Gateway 并使配置生效

- 若 OpenClaw 由 **菜单栏应用** 托管：退出应用后重新打开。
- 若由 **daemon** 管理：执行 `openclaw daemon restart`（需等待进程完全重启）。

重启后，新账号与 binding 才会被加载。

---

## 七、验证

1. **查看配置是否被识别**  
   执行：
   ```bash
   openclaw channels status --probe
   ```
   输出中应出现 Telegram 下 `architect` 账号，且状态为 enabled、configured、token:config 等。若 Gateway 未启动，会提示 gateway 不可达，但配置层面的账号列表仍会显示。

2. **实际对话测试**  
   在 Telegram 中向 **OpenClaw_Zong_Arch_bot** 发送一条消息（需你的 user id 在 `allowFrom` 中）。若绑定与 Gateway 均正常，应由 `architect` Agent 回复。

3. **查看 bindings**  
   ```bash
   openclaw agents list --bindings
   ```
   确认存在 `channel: telegram, accountId: architect` → `agentId: architect` 的绑定。

---

## 八、常见问题

- **404 / deleteWebhook 失败**：多为该账号的 `botToken` 无效或已被撤销，请在 BotFather 检查并更新 token，或暂时将该项设为 `"enabled": false`。
- **发消息无回复**：检查 (1) 该账号是否有对应 binding；(2) `allowFrom` 是否包含你的 user id；(3) Gateway 是否已重启并成功加载配置。
- **多账号时希望默认账号明确**：在 `agents.list` 中为某一项设置 `"default": true`，或在 `channels.telegram` 中设置 `defaultAccount`，避免回退到非预期账号。

---

## 九、参考

- [OpenClaw AI Dev Team 架构](/lab/architecture/ai-dev-team)
- [配置多个 Telegram 机器人完整指南](/lab/telegram/multi-bots)
- [Channel Routing](https://docs.openclaw.ai/channels/channel-routing)
