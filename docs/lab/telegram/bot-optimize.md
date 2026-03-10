# 现有机器人配置优化指南

> 当你在 OpenClaw 中已经接入了多个 Telegram 机器人（例如「产品负责人」+「资讯」两个 bot），但配置方式与 [OpenClaw AI Dev Team 架构](/lab/architecture/ai-dev-team) 不一致时，可按本指南逐步优化，使命名、workspace、bindings 与 agents 一一对应，便于后续扩展和维护。

---

## 一、为什么要做这次优化？

- **架构规范**：架构文档约定「一机器人一角色一 Agent」，即每个 Telegram 机器人对应一个 `accountId`，并绑定到同名的 `agentId`，且每个 Agent 拥有独立 `workspace` 和 `agents.list` 条目。
- **当前常见情况**：两个（或更多）机器人已配置在 `channels.telegram.accounts` 中，但可能出现：
  - 多个机器人共用一个 Agent（如都绑定到 `main`），导致会话与职责混在一起。
  - 没有 `agents.list`，或只有 `agents.defaults`，无法为每个角色单独配置 workspace、模型等。
  - accountId 与 agentId 不一致（如 accountId 为 `product_manager`，binding 却指向 `main`），不利于后续按角色扩展（如再加架构师、开发等）。

本指南在不影响「现有两个机器人能正常对话」的前提下，把配置收敛到「每个机器人 → 独立 Agent → 独立 workspace」的规范形态。

---

## 二、当前情况 vs 目标状态（概念说明）

### 2.1 当前可能的情况（示例）

- **Telegram 账号**：例如 `product_manager`（产品负责人 bot）、`news`（资讯 bot）；可能还有已禁用的 `default`。
- **Bindings**：`product_manager` 可能绑定到 `main`，`news` 绑定到 `news`；即产品负责人和主助手共用一个 main Agent。
- **agents**：只有 `agents.defaults`，没有 `agents.list`，或 list 里没有 `product_manager`、`news` 等条目，因此也没有为它们单独指定 workspace。

这样带来的问题：产品负责人与「主」助手共用同一会话与上下文；若以后要加「系统架构师」等角色，命名和结构会越来越乱。

### 2.2 目标状态（符合架构规范）

- **每个使用的机器人** 在 `channels.telegram.accounts` 中有一项，`accountId` 与角色含义一致（如 `product_manager`、`news`，或按架构表使用 `pm`、`news`）。
- **每个 accountId** 在 `bindings` 中有且仅有一条「channel: telegram + 该 accountId → 对应 agentId」的绑定，且 **agentId 与 accountId 一致**（如 `product_manager` → `product_manager`，`news` → `news`），这样「一机器人一 Agent」。
- **agents.list** 中为每个用到的 agentId 增加一条，并配置独立 **workspace**（如 `~/.openclaw/workspace/product_manager`、`~/.openclaw/workspace/news`）。
- 可选：在 `agents.list` 中指定一个 **default** agent，用于未匹配到更具体 binding 时的回退。

优化完成后，产品负责人 bot 和资讯 bot 将分别由独立 Agent 处理，会话与工作目录互不干扰，后续新增「系统架构师」等机器人时，只需按 [新增 Telegram 机器人操作手册](/lab/telegram/bot-add) 再增加 account、binding 和 agents.list 条目即可。

---

## 三、优化前需要确认的信息

请先确认这两点（便于下面步骤中替换成你的实际值）：

1. **当前在用的 Telegram accountId**  
   打开 `~/.openclaw/openclaw.json`，看 `channels.telegram.accounts` 下有哪些键；其中 `enabled: true` 的即为当前在用的账号。例如：`product_manager`、`news`。
2. **你的 Telegram 用户 ID**  
   用于 `allowFrom`，若已配置且对话正常可不变；若不确定，可给任意已配置的 bot 发一条消息，在 `openclaw logs --follow` 中查看 `from.id`。

下面步骤以「两个机器人：`product_manager`（产品负责人）、`news`（资讯）」为例；若你的 accountId 不同（例如只有 `news` 和 `architect`），把步骤中的 `product_manager` 换成你的 accountId 即可。

---

## 四、优化步骤（按顺序执行）

### 步骤 1：为每个角色在 agents.list 中增加条目

若当前没有 `agents.list`，需要先有 `agents` 结构；若已有 `agents.defaults` 而无 `list`，则新建 `list` 数组。

在 **`agents.list`** 中为 **product_manager** 和 **news** 各增加一条（若已有则可跳过或只补全 workspace）：

```json
"agents": {
  "defaults": {
    "model": { "primary": "v3-2-api-deepseek-com/deepseek-chat" },
    "workspace": "~/.openclaw/workspace",
    "compaction": { "mode": "safeguard" }
  },
  "list": [
    {
      "id": "product_manager",
      "name": "产品负责人",
      "workspace": "~/.openclaw/workspace/product_manager",
      "default": true
    },
    {
      "id": "news",
      "name": "技术情报官",
      "workspace": "~/.openclaw/workspace/news"
    }
  ]
}
```

说明：

- **id**：必须与后面 binding 里的 `agentId` 一致，这里用 `product_manager`、`news` 与现有 accountId 一致，便于「一机器人一 Agent」。
- **workspace**：建议使用 `~/.openclaw/workspace/<agentId>`，把 `~` 换成你的实际 home 路径（如 `/Users/yourname`）。
- **default**：可指定一个为 `true`（如产品负责人），用于未匹配到任何 binding 时的回退；若你希望默认由 main 处理，可保留原有 main 并在 list 中给 main 设 `default: true`，这里仅示例。

若你已有 `agents.list` 且其中已有 `main` 等，只需在 list 中**追加**上述 `product_manager` 和 `news` 两项，并保证 `id` 与下面 bindings 中的 `agentId` 一致。

### 步骤 2：调整 bindings，使每个账号绑定到对应 Agent

目标：每个 Telegram 账号（accountId）有且仅有一条 binding，且 `agentId` 与该 accountId 一致。

**修改前可能类似：**

- `agentId: "main", match: { channel: "telegram", accountId: "product_manager" }`
- `agentId: "news", match: { channel: "telegram", accountId: "news" }`

**修改后建议：**

- `agentId: "product_manager", match: { channel: "telegram", accountId: "product_manager" }`
- `agentId: "news", match: { channel: "telegram", accountId: "news" }`

即：把原来指向 `main` 的 `product_manager` 账号改为指向 `product_manager` Agent；`news` 保持指向 `news`。

若你还有 `default` 账号且启用，可保留一条 `agentId: "main", match: { channel: "telegram", accountId: "default" }`；若 default 已禁用，可删除该条 binding。

**操作**：在 `~/.openclaw/openclaw.json` 的 `bindings` 数组中，找到 `accountId: "product_manager"` 的那条，将 `agentId` 从 `main` 改为 `product_manager`；其余按上面说明保留或删除。

### 步骤 3：创建 workspace 目录（推荐）

为每个 Agent 创建独立 workspace 目录，与 `agents.list` 中的 `workspace` 一致：

```bash
mkdir -p ~/.openclaw/workspace/product_manager
mkdir -p ~/.openclaw/workspace/news
```

这样 Agent 读写文件、放置 SOUL/AGENTS 等都有明确目录，也便于日后用 Cursor 打开对应目录做开发（参见架构文档中的 Cursor 协作说明）。

### 步骤 4：检查 channels.telegram.accounts

确认每个在用的 accountId 都有正确 `botToken` 和 `allowFrom`：

- **product_manager**：`enabled: true`，`botToken` 为产品负责人 bot 的 Token，`allowFrom` 包含你的 Telegram user id。
- **news**：同上，Token 为资讯 bot 的 Token。

若某账号的 token 已失效（例如日志里出现 404、deleteWebhook 失败），请到 BotFather 重新获取或暂时将该账号设为 `"enabled": false`，避免 Gateway 反复报错。

### 步骤 5：重启 Gateway 并验证

- 若由 **菜单栏应用** 托管：退出应用后重新打开。
- 若由 **daemon** 管理：执行 `openclaw daemon restart`。

然后：

1. 执行 `openclaw channels status --probe`，确认 Telegram 下 `product_manager`、`news` 均显示且状态正常。
2. 执行 `openclaw agents list --bindings`，确认两条 binding：`telegram/product_manager` → `product_manager`，`telegram/news` → `news`。
3. 分别在两个 bot 的对话中发消息，确认产品负责人由 product_manager Agent 回复、资讯由 news Agent 回复，且互不串会话。

---

## 五、可选：与架构文档中 7 角色命名完全统一

若你希望与 [OpenClaw AI Dev Team 架构](/lab/architecture/ai-dev-team) 中的 7 角色表完全一致，可把「产品负责人」的 accountId/agentId 从 `product_manager` 改为 `pm`，并在架构中后续扩展 `architect`、`dev`、`qa`、`ops`、`docs` 等。注意：

- 若改为 `pm`，需同步修改三处：`channels.telegram.accounts.pm`（可把原 `product_manager` 重命名为 `pm`）、`bindings` 中该条为 `accountId: "pm", agentId: "pm"`、`agents.list` 中 `id: "pm"` 且 `workspace: ".../workspace/pm"`。
- 重命名后需重启 Gateway，并确认 Bot 的 Token 仍填在 `accounts.pm.botToken` 中。

本步骤为可选，不重命名也不影响「一机器人一 Agent」的优化效果。

---

## 六、小结

| 项目           | 优化前（示例）              | 优化后                           |
| -------------- | -------------------------- | -------------------------------- |
| product_manager 的 binding | agentId: main              | agentId: product_manager        |
| news 的 binding | agentId: news（已正确）    | 保持不变                         |
| agents.list    | 无或缺少二者               | 含 product_manager、news，各有 workspace |
| workspace      | 可能共用默认目录           | 各用 .../workspace/product_manager、.../news |

按上述步骤操作后，现有两个机器人的配置将符合「一机器人一 Agent、独立 workspace」的架构规范，便于后续按 [新增 Telegram 机器人操作手册](/lab/telegram/bot-add) 继续增加系统架构师等角色。

---

## 七、参考

- [OpenClaw AI Dev Team 架构](/lab/architecture/ai-dev-team)
- [新增 Telegram 机器人操作手册](/lab/telegram/bot-add)
- [配置多个 Telegram 机器人完整指南](/lab/telegram/multi-bots)
