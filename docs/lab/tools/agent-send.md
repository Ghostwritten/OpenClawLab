# Agent Send 使用指南

> 基于 [OpenClaw 官方 Agent Send 文档](https://docs.openclaw.ai/tools/agent-send) 整理，用更贴近实战的方式说明 `openclaw agent` 是什么、典型场景、会话选择、回复投递与配置要点。

---

## 一、一句话理解 Agent Send

**Agent Send = 不依赖聊天消息，直接让智能体跑一轮并把结果发给你（或发到指定渠道）。**

- 不需要有人在 Telegram/WhatsApp 里先发一条消息
- 由脚本、定时任务或你本机 CLI 发起
- 可选把智能体的回复「投递」回某个频道（如 Telegram 群、Slack 频道）

---

## 二、典型使用场景

### 2.1 定时任务 / 脚本触发

例如：每天早 8 点让智能体生成「今日待办摘要」，并发到 Telegram 群。

- 用 `openclaw cron add` 定时执行一条 `openclaw agent --message "今日待办摘要" --deliver --channel telegram --reply-to "-1001234567890"`
- 或用系统 crontab / 其他调度器直接调用 `openclaw agent ...`

### 2.2 状态推送 / 报告生成

例如：CI 跑完后，让智能体根据日志写一段「本次构建小结」并发到 Slack。

```bash
openclaw agent --agent ops --message "根据最近一次构建日志写 3 条小结" --deliver --reply-channel slack --reply-to "#reports"
```

### 2.3 对指定会话「补发」一条回复

例如：某次对话里智能体没来得及回复完，你想用同一会话再跑一次并把结果发回原聊天。

- 用 `--session-id <id>` 指定已有会话（可从 `openclaw sessions` 或日志里拿到）
- 加上 `--deliver`，回复会按该会话的渠道/群组发回去

### 2.4 本地/脚本里「问智能体一句话」只看输出

例如：在终端里快速问一句，不投递到任何渠道，只看 stdout。

```bash
openclaw agent --agent main --message "用三句话介绍 OpenClaw"
```

默认会走 Gateway；Gateway 不可用时 CLI 会回退到本机嵌入式运行。加 `--local` 则强制本机运行（需在本机配置好模型 API 等）。

---

## 三、会话选择：`--to` / `--session-id` / `--agent`

每次 `openclaw agent` 都必须指定「在哪个会话里跑这一轮」。三选一（或与 session 相关的组合）：

| 方式 | 含义 | 典型用法 |
|------|------|----------|
| `--to <dest>` | 按目标推导会话 key | 私聊一般对应 `main`；群组/频道会按目标隔离会话 |
| `--session-id <id>` | 复用已有会话（按 id 查） | 补发、定时任务沿用上次会话 |
| `--agent <id>` | 指定已配置的 agent，用其 main 会话 | 多 agent 时定向到某个 agent（如 `ops`、`work`） |

- **只指定 `--agent`**：会用该 agent 的 main 会话，不再区分是谁发的，适合「按 agent 维度的单会话」场景。
- **只指定 `--to`**：会话由配置里的 `session.scope`（如 per-sender）和 `mainKey` 推导；同一群组里不同人可能对应不同 session key。
- **`--session-id`**：在已有会话上继续，适合「接着上次对话」或定时任务希望上下文连续。

多 agent 时需先在 `openclaw.json` 里配好 `agents.list` 和 bindings，详见 [openclaw.json 配置说明手册](/lab/config/reference)、[配置多个 Telegram 机器人完整指南](/lab/telegram/multi-bots)。

---

## 四、回复投递：`--deliver` 与目标覆盖

不加 `--deliver` 时，智能体的回复**只打印到终端**（或 `--json` 时输出 JSON），不会发到任何渠道。

加上 `--deliver` 后，回复会发到「投递目标」。目标由以下方式决定（优先级从高到低）：

1. **显式覆盖**（只影响投递，不改变会话）  
   - `--reply-channel`：发到哪个渠道（如 `telegram`、`slack`）  
   - `--reply-to`：该渠道下的具体目标（如 Telegram 的 chat id、Slack 的 `#reports`）  
   - `--reply-account`：多账号时指定用哪个账号发  

2. **会话自带的渠道/目标**  
   若本次会话是从某渠道某群/某人来的，且你没写 `--reply-*`，则默认发回该会话所在渠道/群/人。

3. **渠道默认目标**  
   若配置了 `channels.telegram.defaultTo`（或其它渠道的 defaultTo），在未指定 `--reply-to` 时，会用作投递目标（详见 [Telegram 渠道文档](https://docs.openclaw.ai/channels/telegram)）。

**常用组合示例：**

- 发到默认 Telegram 目标（依赖 `defaultTo` 或会话）：  
  `openclaw agent --to +15555550123 --message "状态更新" --deliver`
- 发到指定 Telegram 群：  
  `openclaw agent --agent main --message "日报" --deliver --channel telegram --reply-to "-1001234567890"`
- 发到 Slack 某频道：  
  `openclaw agent --agent ops --message "生成报告" --deliver --reply-channel slack --reply-to "#reports"`

投递目标格式与 `openclaw message --target` 一致（如 Telegram 用 chat id，Slack 用 `channel:id` 或 `#channel` 等）。

---

## 五、常用参数速查

| 参数 | 说明 |
|------|------|
| `--message <text>` | **必填**。本轮的提示/问题。 |
| `--to <dest>` | 会话由目标推导（E.164 号码、群 id、channel:id 等）。 |
| `--session-id <id>` | 复用已有会话 id。 |
| `--agent <id>` | 使用已配置的 agent（其 main 会话）。 |
| `--deliver` | 将回复投递到渠道（否则只输出到终端）。 |
| `--channel <name>` | 投递渠道（whatsapp/telegram/discord/slack/signal/imessage 等），常与 `--deliver` 同用。 |
| `--reply-to <target>` | 投递目标覆盖（不改变会话）。 |
| `--reply-channel` | 投递渠道覆盖。 |
| `--reply-account` | 投递账号 id 覆盖（多账号时）。 |
| `--thinking <level>` | 思考深度（off/minimal/low/medium/high/xhigh），部分模型支持，会写入会话。 |
| `--verbose <on|full|off>` | 详细输出级别，会写入会话。 |
| `--timeout <seconds>` | 本轮超时。 |
| `--json` | 输出结构化 JSON（含 payload 与元数据）。 |
| `--local` | 强制本机嵌入式运行，不走 Gateway（需本机有模型 API 等）。 |

---

## 六、配置要点（与 Agent Send 相关的部分）

- **Gateway**：默认 `openclaw agent` 会通过 Gateway 执行；要本机跑加 `--local`。  
- **多 agent**：在 `openclaw.json` 的 `agents.list` 里添加 agent，并用 `openclaw agents bind` 绑定渠道/账号；`--agent <id>` 才会生效。  
- **投递默认目标**：Telegram 可配 `channels.telegram.defaultTo`，这样 `--deliver` 不写 `--reply-to` 时也有默认发往目标。  
- **会话存储与 scope**：会话由 `session.scope`、`session.store`、`session.mainKey` 等决定；通常用默认即可，无需为 Agent Send 单独改。

更完整的配置说明见 [openclaw.json 配置说明手册](/lab/config/reference)。

---

## 七、完整示例（端到端）

### 示例 1：只跑一轮，结果只打屏

```bash
openclaw agent --agent main --message "用三句话介绍 OpenClaw，并给一个文档链接"
```

### 示例 2：指定会话并投递到 Telegram 群

假设你已有一个 Telegram 群，chat id 为 `-1001234567890`，且已配置好 Telegram 渠道和 agent：

```bash
openclaw agent --agent main --message "今日待办摘要（3 条）" \
  --deliver --channel telegram --reply-to "-1001234567890"
```

若该 agent 已通过 bindings 绑定到该 Telegram 账号，且会话来自该群，也可以只用 `--deliver` 不写 `--reply-to`（会发回原会话或 defaultTo）。

### 示例 3：用已有 session 补发并投递到 Slack

```bash
openclaw agent --session-id abc-def-123 --message "根据上文总结 5 条要点" \
  --deliver --reply-channel slack --reply-to "#reports"
```

### 示例 4：定时任务（cron）里每天发日报

与 `openclaw cron` 配合：先加一条定时任务，命令里调用 agent 并投递。

```bash
openclaw cron add --schedule "0 8 * * *" \
  -- openclaw agent --agent main --message "生成昨日工作日报（5 条）" \
  --deliver --channel telegram --reply-to "-1001234567890"
```

更多 cron 用法见 [Cron 参考](https://docs.openclaw.ai/cli/cron) 与 [Cron jobs](https://docs.openclaw.ai/automation/cron-jobs)。

---

## 八、参考链接

- 官方 Agent Send 文档：<https://docs.openclaw.ai/tools/agent-send>  
- CLI agent 参考：<https://docs.openclaw.ai/cli/agent>  
- 本仓库： [openclaw.json 配置说明手册](/lab/config/reference)、[子代理 Sub-Agents 通俗指南](/lab/concepts/subagents-guide)、[配置多个 Telegram 机器人完整指南](/lab/telegram/multi-bots)
