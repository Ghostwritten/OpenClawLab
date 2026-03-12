---
title: 配置多个 Telegram 机器人完整指南
description: 在单一 Gateway 中配置多 Telegram 机器人，实现职责分离与多智能体路由
layout: doc
---

# OpenClaw 配置多个 Telegram 机器人完整指南

> 本文深入讲解如何在单一 OpenClaw Gateway 实例中配置并管理多个 Telegram 机器人，实现职责分离、多智能体路由与自动化场景落地。

---

## 一、为什么需要多个 Telegram 机器人？

### 1.1 典型场景

- **职责隔离**：产品负责人机器人、资讯推送机器人、客服机器人分别使用独立的会话与知识库。
- **定时推送**：资讯摘要、日报、提醒等由专用机器人发送，不污染主对话上下文。
- **多租户 / 多项目**：不同团队或项目使用不同机器人，各自绑定独立 agent。
- **合规与安全**：不同用途使用不同 token，便于权限控制和审计。

### 1.2 核心概念速览

| 概念　　　　　| 含义　　　　　　　　　　　　　　　　　　　　　　　　　　　 |
| ---------------| ------------------------------------------------------------|
| **accountId** | 渠道侧的账号标识，每个 Telegram 机器人对应一个 accountId。 |
| **agentId**　 | 智能体标识，拥有独立 workspace、会话与模型配置。　　　　　 |
| **binding**　 | 将 `(channel, accountId)` 映射到 `agentId` 的路由规则。　　|

一个 Gateway 可以同时运行多个 Telegram 账号，每个账号可绑定到不同 agent，实现「一机器人一用途一智能体」的架构。

---

## 二、架构与数据流

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    OpenClaw Gateway                               │
├─────────────────────────────────────────────────────────────────┤
│  channels.telegram.accounts                                      │
│  ┌──────────┐ ┌──────────────┐ ┌──────────┐                     │
│  │ default  │ │product_manager│ │  news    │  ← 每个 accountId    │
│  │ botToken │ │   botToken   │ │ botToken │    对应一个 Bot       │
│  └────┬─────┘ └──────┬───────┘ └────┬─────┘                     │
│       │              │              │                             │
│       ▼              ▼              ▼                             │
│  bindings:  main ← default   main ← product_manager  news ← news │
│       │              │              │                             │
│       ▼              ▼              ▼                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                         │
│  │ agent    │ │ agent    │ │ agent    │                         │
│  │ main     │ │ main     │ │ news     │  ← 可复用或独立 agent     │
│  └──────────┘ └──────────┘ └──────────┘                         │
└─────────────────────────────────────────────────────────────────┘
         ▲              ▲              ▲
         │              │              │
    Bot A          Bot B          Bot C (Telegram 侧)
```

### 2.2 路由决策顺序

OpenClaw 按以下优先级选择 agent（详见 [Channel Routing](https://docs.openclaw.ai/channels/channel-routing)）：

1. 精确对端匹配（`peer.kind` + `peer.id`）
2. 父级对端继承（如线程）
3. 渠道内 `accountId` 匹配
4. 渠道级通配（`accountId: "*"`）
5. 默认 agent

因此，每个 Telegram 机器人（accountId）必须至少有一条 binding，否则消息无法路由到任何 agent。

---

## 三、前置准备

### 3.1 在 BotFather 中创建机器人

1. 在 Telegram 中搜索 **@BotFather**（确认是官方账号）。
2. 对每个机器人执行 `/newbot`，按提示完成名称与用户名设置。
3. 保存 BotFather 返回的 **HTTP API Token**，形如：`1234567890:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`。

建议规范命名：

- `OpenClaw_产品负责人_bot` → product_manager
- `OpenClaw_资讯_bot` → news

### 3.2 获取 Telegram 用户 ID

若使用 `dmPolicy: "allowlist"`，需要配置 `allowFrom`（Telegram 用户 ID 列表）：

- 给机器人发一条消息，在 `openclaw logs --follow` 中查看 `from.id`。
- 或使用 `@userinfobot`（需注意隐私）。

---

## 四、配置文件结构

配置文件默认路径：`~/.openclaw/openclaw.json`（或通过 `OPENCLAW_CONFIG_PATH` 指定）。

### 4.1 基本结构

```json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "dmPolicy": "allowlist",
      "groupPolicy": "allowlist",
      "streaming": "off",
      "proxy": "http://proxy-host:port",
      "accounts": {
        "product_manager": {
          "enabled": true,
          "dmPolicy": "allowlist",
          "botToken": "<BotFather 返回的 token>",
          "allowFrom": [123456789],
          "groupPolicy": "allowlist",
          "streaming": "off",
          "proxy": "http://proxy-host:7890"
        },
        "news": {
          "enabled": true,
          "dmPolicy": "allowlist",
          "botToken": "<另一个 bot 的 token>",
          "allowFrom": [123456789],
          "groupPolicy": "allowlist",
          "streaming": "off",
          "proxy": "http://proxy-host:7890"
        }
      }
    }
  },
  "bindings": [
    {
      "agentId": "main",
      "match": { "channel": "telegram", "accountId": "product_manager" }
    },
    {
      "agentId": "news",
      "match": { "channel": "telegram", "accountId": "news" }
    }
  ]
}
```

### 4.2 字段说明

| 路径 | 说明 |
|------|------|
| `channels.telegram.accounts.<accountId>.botToken` | 该机器人的 Telegram Bot Token，必填。 |
| `channels.telegram.accounts.<accountId>.allowFrom` | `dmPolicy: "allowlist"` 时允许的 Telegram 用户 ID 列表。 |
| `channels.telegram.accounts.<accountId>.proxy` | 可选，该账号专用代理 URL。 |
| `channels.telegram.accounts.<accountId>.streaming` | `on` / `off`，控制是否流式输出（Telegram 通常建议 `off`）。 |
| `channels.telegram.defaultAccount` | 多账号时指定默认 accountId，省略时使用 `accounts.default` 或首个配置的账号。 |

**重要**：多账号场景下建议显式配置 `accounts.default` 或将 `defaultAccount` 设为实际使用的账号，避免路由回退到意外账号。

---

## 五、Bindings 与 Agent 配置

### 5.1 绑定规则

每条 binding 将「渠道 + 账号」映射到「智能体」：

```json
{
  "agentId": "news",
  "match": {
    "channel": "telegram",
    "accountId": "news"
  }
}
```

- 发往 `news` 机器人的消息 → 路由到 `news` agent。
- 发往 `product_manager` 机器人的消息 → 路由到 `main` agent（若如上例绑定）。

### 5.2 多 agent 与独立 workspace

若希望每个机器人使用独立 agent：

1. 创建 agent：

```bash
openclaw agents add product_manager
openclaw agents add news
```

2. 配置 `agents.list` 与 bindings：

```json
{
  "agents": {
    "list": [
      { "id": "main", "name": "主智能体", "workspace": "~/.openclaw/workspace" },
      { "id": "product_manager", "name": "产品负责人", "workspace": "~/.openclaw/workspace-pm" },
      { "id": "news", "name": "资讯推送", "workspace": "~/.openclaw/workspace-news" }
    ]
  },
  "bindings": [
    { "agentId": "main", "match": { "channel": "telegram", "accountId": "default" } },
    { "agentId": "product_manager", "match": { "channel": "telegram", "accountId": "product_manager" } },
    { "agentId": "news", "match": { "channel": "telegram", "accountId": "news" } }
  ]
}
```

每个 agent 拥有独立 workspace、会话和模型配置，互不干扰。

---

## 六、命名规范建议

| 层级 | 建议 | 示例 |
|------|------|------|
| accountId | 与用途一致，小写 + 下划线 | `news`, `product_manager` |
| agentId | 与 accountId 对应，便于理解 | `news` ↔ `news` |
| 机器人用户名 | 在 BotFather 中便于识别 | `OpenClaw_News_bot` |

保持 `accountId` 与 `agentId` 对应（如均为 `news`），可降低配置心智负担。

---

## 七、常见问题与排查

### 7.1 404 Not Found（deleteWebhook / setMyCommands）

**现象**：

```
telegram deleteWebhook failed: Call to 'deleteWebhook' failed! (404: Not Found)
telegram setMyCommands failed: Call to 'setMyCommands' failed! (404: Not Found)
```

**原因**：Bot Token 无效或已失效。常见情况包括：

- 配置中仍是占位符（如 `"原来的机器人Token"`）。
- 在 BotFather 中已撤销 / 重新生成 token，旧 token 失效。

**处理**：在 BotFather 中确认 token，更新 `channels.telegram.accounts.<accountId>.botToken`，或暂时将该账号设为 `"enabled": false`。

### 7.2 消息无回复（对话未成功）

**可能原因**：

1. **缺少 binding**：该 accountId 未出现在任何 binding 的 `match.accountId` 中。
2. **agent 未定义**：binding 指向的 `agentId` 在 `agents.list` 中不存在，或使用默认 agent 时配置不完整。

**处理**：为该 accountId 添加 binding，并确保对应 agent 已正确配置。

### 7.3 多账号时 default 账号报错

若配置了 `accounts.default` 但 token 无效，会导致该账号反复启动失败。可：

- 填入正确的 token，或
- 将 `accounts.default` 设为 `"enabled": false`，并在 `defaultAccount` 中指定其他账号。

### 7.4 代理与网络

若需代理访问 Telegram API，在 `channels.telegram.proxy` 或各 `accounts.<id>.proxy` 中配置：

```json
"proxy": "http://proxy-host:7890"
```

---

## 八、验证与运维

### 8.1 配置验证

```bash
openclaw channels status --probe
```

输出中应能看到各 Telegram 账号及其状态，例如：

```
- Telegram product_manager: enabled, configured, mode:polling, token:config
- Telegram news: enabled, configured, mode:polling, token:config
```

### 8.2 查看 bindings

```bash
openclaw agents list --bindings
```

确认每个 Telegram accountId 都有对应的 binding。

### 8.3 重启 Gateway

配置修改后需重启 Gateway 才能生效：

- 若由 OpenClaw 菜单栏应用托管：退出应用后重新打开。
- 若由 daemon 管理：`openclaw daemon restart`。

---

## 九、进阶：定时资讯推送

若 `news` 机器人用于定时推送，可结合 [Cron Jobs](https://docs.openclaw.ai/automation/cron-jobs) 或 [Heartbeat](https://docs.openclaw.ai/automation/heartbeat) 实现：

```bash
openclaw cron add \
  --name "早报" \
  --cron "0 8 * * *" \
  --tz "Asia/Shanghai" \
  --session isolated \
  --message "汇总昨日重要资讯并推送。" \
  --announce \
  --channel telegram \
  --account news \
  --to "123456789"
```

确保 `--account news` 与配置中的 accountId 一致，`--to` 为目标 Telegram 用户或群组 ID。

---

## 十、参考资源

- [OpenClaw 官方文档 - Telegram](https://docs.openclaw.ai/channels/telegram)
- [Multi-Agent Routing](https://docs.openclaw.ai/concepts/multi-agent)
- [Channel Routing](https://docs.openclaw.ai/channels/channel-routing)
- [Cron Jobs](https://docs.openclaw.ai/automation/cron-jobs)

---

*本文基于 OpenClaw 2026.2.x 及以上版本撰写。*
