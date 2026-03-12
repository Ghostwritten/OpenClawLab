---
title: 子代理 Sub-Agents 通俗指南
description: 理解子代理的适用场景、使用方式与配置详解
layout: doc
---

# 子代理（Sub-Agents）通俗指南

> 基于 [OpenClaw 官方 Sub-Agents 文档](https://docs.openclaw.ai/tools/subagents) 整理，用更通俗的语言说明什么是子代理、适用场景及如何配置。

---

## 一、一句话理解子代理

**子代理 = 主智能体派出去的「小助手」**：在后台单独执行一个任务，做完后把结果汇报给主智能体，再转给你。

- 主智能体继续和你聊天，不会被长任务卡住
- 子代理有独立会话和上下文，互不干扰
- 适合：研究、汇总、长时间工具调用等耗时任务

---

## 二、典型使用场景

### 2.1 场景一：并行调研

你问：「帮我对比一下 A 和 B 两个方案的优缺点，分别查资料后汇总。」

- 主智能体：把任务拆成两个子代理
- 子代理 1：调研 A 方案
- 子代理 2：调研 B 方案  
两者并行执行，完成后各自汇报，主智能体再综合回复你。

### 2.2 场景二：长时间任务不阻塞

你问：「去这个网站爬取数据并整理成表格。」

- 主智能体：派一个子代理去执行
- 主智能体：先回你「已在后台处理，完成后会通知」
- 子代理：完成爬取和整理后，把结果「汇报」给主智能体，再转给你

你可以在等待期间继续问别的问题。

### 2.3 场景三：多层级分工（编排模式）

你问：「组织三个人分别做市场、技术、竞品分析，最后综合报告。」

- 主智能体：派一个「协调员」子代理
- 协调员：再派三个「执行者」子代理，各自做市场/技术/竞品
- 执行者完成后汇报给协调员，协调员综合后汇报给主智能体，主智能体再给你最终回答

这就是「主 → 协调员 → 执行者」的层级结构（需要开启嵌套子代理）。

---

## 三、两种使用方式

### 3.1 用户命令：`/subagents spawn`

你直接在聊天里发命令，由主智能体之外的逻辑执行：

```
/subagents spawn main 帮我调研一下 OpenClaw 的最新版本特性，整理成 3 条要点
```

- 立即返回一个 run id，表示任务已接受
- 子代理在后台运行
- 完成后会在当前聊天里发一条汇总消息

**参数示例**：

```
/subagents spawn main <任务描述> [--model gpt-4-mini] [--thinking low]
```

- `main`：使用哪个 agent（需在 `subagents.allowAgents` 中）
- `--model`：子代理使用的模型（可选用更便宜的模型省 token）
- `--thinking`：思考深度

### 3.2 主智能体调用：`sessions_spawn` 工具

主智能体在对话中决定「派子代理去做」，通过工具 `sessions_spawn` 发起。

例如你问「帮我查一下某某资料」，主智能体可以调用：

```json
{
  "task": "调研某某资料，整理成 5 条要点",
  "label": "调研任务",
  "model": "gpt-4-mini"
}
```

- 调用是**非阻塞**的：主智能体立刻拿到 `runId`，可以继续和你对话
- 子代理完成后会通过「announce」机制把结果送回主智能体，再转给你

---

## 四、配置详解

### 4.1 基础配置（`agents.defaults.subagents`）

在 `~/.openclaw/openclaw.json` 中：

```json5
{
  "agents": {
    "defaults": {
      "subagents": {
        "model": "openai/gpt-4-mini",        // 子代理默认模型（可省钱）
        "runTimeoutSeconds": 900,            // 超时（秒），0 表示不限
        "archiveAfterMinutes": 60,           // 完成后多久归档会话
        "maxConcurrent": 8                   // 同时运行的子代理上限
      }
    }
  }
}
```

| 字段 | 含义 | 建议 |
|------|------|------|
| `model` | 子代理用的模型 | 用便宜模型可省 token |
| `runTimeoutSeconds` | 超时时间 | 长任务可设 900 或更大 |
| `archiveAfterMinutes` | 归档延迟 | 默认 60 分钟 |
| `maxConcurrent` | 并发上限 | 按机器性能调整，一般 4–8 |

### 4.2 允许派往哪些 agent（`subagents.allowAgents`）

默认子代理只能派给**当前 agent 自己**。若要派给别的 agent：

```json5
{
  "agents": {
    "list": [
      {
        "id": "main",
        "subagents": {
          "allowAgents": ["main", "research"]   // 允许派给 main 和 research
        }
      }
    ]
  }
}
```

- `allowAgents: ["*"]` 表示可以派给任意已配置的 agent
- 不配置时，只能派给当前 agent

### 4.3 子代理能用的工具（`tools.subagents.tools`）

默认子代理**没有**会话类工具（`sessions_list`、`sessions_spawn` 等），只能做「执行类」任务，避免权限过大。

若要限制或放开：

```json5
{
  "tools": {
    "subagents": {
      "tools": {
        "deny": ["gateway", "cron", "browser"],
        // "allow": ["read", "exec", "web_search", "web_fetch"]  // 若设置，则变成白名单
      }
    }
  }
}
```

- `deny`：禁止的工具，优先级最高
- `allow`：若设置，则仅允许列表中的工具（子代理工具集合会变严格）

### 4.4 嵌套子代理（主 → 协调员 → 执行者）

默认子代理**不能再派子代理**。若要实现「协调员 + 多个执行者」：

```json5
{
  "agents": {
    "defaults": {
      "subagents": {
        "maxSpawnDepth": 2,        // 允许再派一层子代理
        "maxChildrenPerAgent": 5,  // 每个协调员最多 5 个执行者
        "maxConcurrent": 8,
        "runTimeoutSeconds": 900
      }
    }
  }
}
```

| 层级 | 角色 | 能否再派子代理 |
|------|------|----------------|
| 0 | 主智能体 | 可以 |
| 1 | 子代理（协调员） | 仅当 `maxSpawnDepth >= 2` 时可以 |
| 2 | 子子代理（执行者） | 不可以 |

结果会自下而上汇报：执行者 → 协调员 → 主智能体 → 你。

---

## 五、常用命令速查

| 命令 | 作用 |
|------|------|
| `/subagents list` | 列出当前会话下的子代理 |
| `/subagents spawn main 任务描述` | 派子代理执行任务 |
| `/subagents info 1` 或 `/subagents info #1` | 查看某个子代理详情 |
| `/subagents log 1` | 查看子代理运行日志 |
| `/subagents kill 1` | 终止指定子代理 |
| `/subagents kill all` | 终止所有子代理 |
| `/subagents steer 1 新指令` | 在运行中给子代理发新指令 |
| `/stop` | 停止当前主会话及所有子代理 |

---

## 六、Discord 线程绑定（可选）

在 Discord 中，可以让子代理**绑定到一个线程**，后续在该线程发的消息都交给这个子代理处理。

1. 使用 `sessions_spawn` 时传 `thread: true`
2. 使用 `/focus`、`/unfocus` 手动绑定或解绑
3. 相关配置：`session.threadBindings`、`channels.discord.threadBindings`

当前仅 Discord 支持线程绑定，Telegram 等渠道暂不支持。

---

## 七、注意事项

1. **Token 消耗**：每个子代理有独立上下文，会额外消耗 token，建议子代理用便宜模型  
2. **非阻塞**：`sessions_spawn` 调用会立刻返回，不会等子代理完成  
3. **结果回传**：子代理通过「announce」把结果传回，主智能体会再整理成面向你的回复  
4. **网关重启**：若在子代理运行中重启，未完成的 announce 可能丢失  
5. **并发上限**：`maxConcurrent` 控制同时运行的子代理数，避免过载  

---

## 八、最小可运行示例

```json5
{
  "agents": {
    "defaults": {
      "subagents": {
        "model": "openai/gpt-4-mini",
        "runTimeoutSeconds": 600
      }
    },
    "list": [{ "id": "main", "default": true }]
  }
}
```

保持默认即可使用子代理。在聊天中发：

```
/subagents spawn main 用 3 句话总结一下 OpenClaw 的用途
```

等子代理完成后，会在当前聊天看到汇总结果。

---

## 九、参考

- [Sub-Agents 官方文档](https://docs.openclaw.ai/tools/subagents)
- [Slash Commands](https://docs.openclaw.ai/tools/slash-commands)
- [配置文件 tools 配置说明](/lab/config/tools)
