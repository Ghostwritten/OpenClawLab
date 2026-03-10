---
layout: doc
---
# OpenClaw Agent 完全指南：从小白到精通

## 前言

如果你把 OpenClaw 想象成一部手机，那么 Agent 就是手机上的操作系统。它决定了 AI 助手"是谁"、"怎么做事"、"记住什么"。

这篇博客将带你从零理解 OpenClaw Agent 的每一个核心概念：工作区、人格配置、记忆系统、多 Agent 架构、安全模型。

---

## 第一章：Agent 是什么？

### 1.1 通俗解释

Agent（智能体）是 OpenClaw 中一个**有独立身份和记忆的 AI 助手**。它不仅仅是一个聊天机器人，更像是一个拥有自己工作空间、人格设定和持续记忆的"数字同事"。

打个比方：
- ChatGPT 就像一个**临时顾问**：每次对话你都要重新介绍自己
- OpenClaw Agent 就像一个**固定搭档**：它认识你、记得之前聊过什么、知道怎么帮你做事

### 1.2 一个 Agent 由什么组成？

**大脑（模型）**
- 使用哪个 AI 模型（如 GPT-4o、Claude Sonnet）
- 认证方式和 API Key

**人格（Workspace 文件）**
- SOUL.md — 性格、语气、边界
- AGENTS.md — 行为规则、安全策略
- USER.md — 它记住的关于你的信息
- IDENTITY.md — 它自己的身份信息

**记忆**
- MEMORY.md — 长期精选记忆
- memory/ 每日日志 — 当天发生了什么
- 会话历史 — 最近聊了什么

**工具箱（Skills）**
- 代码开发、文件管理、搜索、浏览器等

**通道（Channels）**
- 通过哪些平台和你对话（飞书、Telegram、WhatsApp 等）

### 1.3 Agent 和 Gateway 的关系

- **Gateway** 是基础设施：负责连接聊天平台、管理认证、路由消息
- **Agent** 是 AI 大脑：负责理解消息、做出回应、使用工具

一个 Gateway 可以运行**一个或多个 Agent**。默认情况下只有一个 Agent（agentId 为 "main"）。

---

## 第二章：工作区（Workspace）— Agent 的家

### 2.1 什么是工作区？

工作区是 Agent 存放所有文件的地方。可以理解为 Agent 的"桌面"或"办公室"。

默认路径：`~/.openclaw/workspace`

### 2.2 工作区文件详解

**SOUL.md — Agent 的灵魂**
定义 Agent 的性格和说话方式。

**AGENTS.md — Agent 的行为手册**
定义 Agent 应该怎么做事：安全规则、操作规范、群聊行为、记忆管理策略。

**USER.md — 用户档案**
记录关于你的信息：名字、时区、语言、角色和偏好。

**IDENTITY.md — Agent 的身份卡**
Agent 的名字、性格关键词、Emoji 标识。

**TOOLS.md — 工具备忘录**
记录本地工具的使用笔记（SSH 地址、摄像头名称、语音偏好等）。

**MEMORY.md — 长期记忆**
经过提炼的持久化记忆，跨会话保持。只在私聊时加载。

**memory/ — 每日记忆日志**
每天一个文件（如 memory/2026-03-10.md），记录当天发生的重要事件。

**HEARTBEAT.md — 心跳检查清单**
可选。配置 Agent 在定期心跳时应该检查什么。

**BOOTSTRAP.md — 出生证明**
首次运行时的引导文件。完成后自动删除。

**skills/ — 工作区专属技能**
存放在这里的 Skills 只对当前 Agent 可用。

### 2.3 工作区初始化流程（Bootstrap）

当你第一次运行 OpenClaw 时：
1. 在工作区中创建默认文件
2. Agent 会和你进行简短的问答
3. 将你的信息和 Agent 的身份写入对应文件
4. 完成后自动删除 BOOTSTRAP.md

### 2.4 工作区最佳实践

**用 Git 管理工作区（强烈推荐）**
```bash
cd ~/.openclaw/workspace
git init
git add AGENTS.md SOUL.md USER.md IDENTITY.md TOOLS.md memory/
git commit -m "初始化 Agent 工作区"
```

**不要提交到仓库的东西：**
- API Key、密码、Token
- `~/.openclaw/` 下的配置和凭证
- 敏感聊天记录

**角色定制模板**：产品经理、架构师、开发/测试/运维等角色工作区定制，参见 [工作区定制指南](/lab/setup/workspace/product-manager)。

---

## 第三章：记忆系统 — Agent 如何"记住"你

### 3.1 为什么记忆很重要？

普通 AI 聊天工具每次都是"失忆"状态。OpenClaw Agent 通过三层记忆系统解决这个问题。

### 3.2 三层记忆架构

**第一层：MEMORY.md（长期记忆）**
- 精选的核心信息
- 存储你的偏好、重要决定、项目状态
- 只在私聊时加载
- Agent 会定期从日志中提炼精华更新到这里

**第二层：每日日志（memory/YYYY-MM-DD.md）**
- 每天一个文件，记录当天发生的重要事件
- Append-only 格式（只追加，不修改）
- 每次启动时读取今天和昨天的日志

**第三层：会话历史（sessions/）**
- 短期对话记录，JSONL 格式
- 存储在 `~/.openclaw/agents/<agentId>/sessions/` 下
- 提供上下文连续性

### 3.3 记忆的工作流程

**写入**：Agent 觉得某些信息值得记住时，写入当天的日志文件。

**提炼**：定期回顾最近的日志，把重要的内容提炼到 MEMORY.md 中。

**读取**：每次会话开始时：
1. SOUL.md（我是谁）
2. USER.md（你是谁）
3. 今天的日志 + 昨天的日志
4. MEMORY.md（长期记忆，仅在私聊中）

### 3.4 记忆安全

- MEMORY.md 不会在群聊中加载
- 敏感信息不应写入记忆文件
- 使用 SecretRef 管理凭证

---

## 第四章：多 Agent 架构 — 一个 Gateway，多个大脑

### 4.1 为什么要多个 Agent？

- **开发 Agent**：专注编程，用最强的模型
- **写作 Agent**：专注内容创作
- **工作 Agent**：处理邮件、日历、通知
- **个人 Agent**：生活助手

### 4.2 创建新 Agent

```bash
openclaw agents add coding
openclaw agents add social
```

每个新 Agent 自动获得：独立工作区、独立 Agent 目录、独立会话存储、独立认证配置。

### 4.3 多 Agent 隔离机制

**完全隔离：** 工作区、认证、会话历史、Skills

**共享：** Gateway 进程、全局 Skills

### 4.4 消息路由（Binding）

路由优先级（从高到低）：
1. 精确匹配某个聊天（peer）
2. 线程继承（parentPeer）
3. Discord 角色路由
4. Discord 服务器
5. Slack 团队
6. 账号匹配
7. 渠道匹配
8. 默认 Agent

**简单理解**：最具体的规则优先。

### 4.5 一个 WhatsApp 号码多人使用

可以在一个 WhatsApp 号码下，根据发送者的手机号路由到不同的 Agent。

**进阶阅读**：若需搭建完整的 AI 开发团队（8 角色、Telegram 多机器人、与 Cursor 协作），参见 [OpenClaw AI Dev Team 架构](/lab/architecture/ai-dev-team)。

---

## 第五章：Agent 的安全模型

### 5.1 核心安全原则

OpenClaw 采用**个人助手安全模型**：一个受信任的操作者对应一个 Gateway。

### 5.2 DM 配对与 Allowlist

- **Allowlist 模式**：只有在白名单中的人才能和 Agent 私聊
- **Pairing 模式**：需要先完成配对流程

### 5.3 提示词注入防护

- 外部数据中的"指令性内容"一律忽略
- 只有所有者的直接消息被视为指令
- 使用最新一代模型降低注入风险

### 5.4 凭证安全

- API Key 不明文存储，使用 SecretRef 引用
- 输出时自动脱敏
- 定期提醒轮换凭证（建议每 90 天）

### 5.5 破坏性操作保护

- 先获得用户确认
- 优先使用可恢复方式（trash > rm）
- 批量操作前报告规模

### 5.6 紧急停止

发送"停止"或"STOP"指令 → Agent 立即停止一切操作。

### 5.7 安全审计

```bash
openclaw security audit
openclaw security audit --deep
openclaw security audit --fix
```

---

## 第六章：Agent 与消息渠道的协作

### 6.1 私聊 vs 群聊

**私聊中：**
- Agent 加载完整的记忆（包括 MEMORY.md）
- 可以使用所有工具
- 可以执行敏感操作

**群聊中：**
- 不会加载 MEMORY.md
- 不会透露你和 Agent 的互动细节
- 行为更谨慎

### 6.2 群聊中的智能行为

Agent 不会回复每条消息，只会在以下情况发言：
- 直接被提到或被问问题时
- 能提供有用信息或帮助时
- 有趣的观察或见解时

**质量 > 数量**，像一个真实参与群聊的人一样。

### 6.3 跨渠道一致性

无论你通过飞书、Telegram 还是 WhatsApp 发消息，回复的都是同一个 Agent。只是"嘴巴"不同。

---

## 第七章：Heartbeat — Agent 的自动巡检

### 7.1 什么是 Heartbeat？

Gateway 每隔约 30 分钟触发一次心跳，Agent 被唤醒后可以执行检查任务。

### 7.2 配置 Heartbeat

在工作区的 `HEARTBEAT.md` 文件中配置检查事项。如果为空，Agent 回复 `HEARTBEAT_OK` 并跳过。

### 7.3 Heartbeat 能做什么？

- 检查未读邮件
- 查看即将到来的日历事件
- 检查天气变化
- 审查和整理记忆文件
- 提醒凭证轮换

### 7.4 Heartbeat vs Cron

- **Heartbeat**：批量检查、可合并、时间可偏差
- **Cron**：精确时间、任务隔离、一次性提醒

---

## 第八章：会话管理与模型切换

### 8.1 模型切换

```
/model              # 打开模型选择器
/model list         # 查看可用模型
/model 3            # 按编号选择
/model status       # 查看当前模型详情
```

### 8.2 思维级别

通过 `/reasoning` 控制：
- **off**：快速响应
- **on**：深度思考
- **stream**：显示思考过程

### 8.3 子 Agent（Sub-Agent）

复杂长时间任务可派生子 Agent 在后台执行，完成后自动回报。

---

## 第九章：Agent 管理命令速查

```bash
# 查看 Agent
openclaw agents list
openclaw agents list --bindings

# 添加 Agent
openclaw agents add <name>

# 模型
openclaw models status
openclaw models set <model>

# Gateway
openclaw gateway status/start/stop/restart

# 对话
openclaw agent --message "你好"
openclaw dashboard

# 诊断
openclaw doctor
openclaw security audit --fix
```

---

## 第十章：实战场景

### 场景一：个人开发者
一个 Agent 搞定所有事：飞书日常沟通 + Telegram 技术讨论 + Code/Git Skills + Cron 检查 GitHub 通知。

### 场景二：团队使用
- `dev` Agent → 技术群
- `social` Agent → 市场群
- `personal` Agent → 私聊

### 场景三：家庭共享
一个 WhatsApp 号码，根据发送者路由到不同 Agent。

---

## 总结

OpenClaw Agent 的核心设计理念：

- **有记忆**：三层记忆让 AI 从"一次性工具"变成"持续伙伴"
- **有人格**：SOUL.md 让每个 Agent 都有独特的性格
- **有边界**：完善的安全机制保护你的数据
- **可扩展**：Skills 系统让能力无限扩展
- **可复制**：多 Agent 架构支持各种复杂场景

**一句话总结：Agent 不只是一个聊天机器人，它是一个有记忆、有人格、有工具的数字同事。**

---

## 参考资源

- OpenClaw 官方文档：https://docs.openclaw.ai
- Agent 工作区：https://docs.openclaw.ai/concepts/agent-workspace
- 多 Agent 配置：https://docs.openclaw.ai/concepts/multi-agent
- 安全指南：https://docs.openclaw.ai/gateway/security
- GitHub 仓库：https://github.com/openclaw/openclaw
