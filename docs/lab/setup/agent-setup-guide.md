---
title: Agent 手动配置实战指南
description: 以 Architect 为例的通用 Agent 配置流程，适合手动配置用户
layout: doc
---

# OpenClaw Agent 手动配置实战指南（以 Architect 为例）

> 本文为通用 Agent 配置流程，以**架构师（Architect）**为例说明。配置其他角色（产品经理、开发工程师、测试工程师等）时，将示例中的 `architect` 替换为对应 `agentId` 即可，流程一致。
>
> 适合「想自己掌控配置」的用户：不走向导，直接手动配置。

---

## 1. 目标说明（以 PM → Architect 为例）

以最常见的协作模式为例，你要实现的是：

- 用户主要和 PM 交流
- PM 收到需求后，把「架构设计」部分派给 Architect
- Architect 产出架构方案、风险清单、接口契约
- PM 汇总并对外回复

一句话流程：

```text
用户 -> PM入口Bot -> PM Agent -> sessions_spawn(architect) -> Architect Agent -> PM汇总 -> 用户
```

若你配置的是其他角色（Dev、QA、Ops 等），只需把 `architect` 换成对应 agentId，流程逻辑相同。

---

## 2. 关键概念（避免一开始配错）

先记住 4 个对象：

- `channels.<channel>.accounts`：机器人入口账号（Bot 身份）
- `agents.list[]`：AI 执行体（带规则、记忆、工具权限）
- `bindings[]`：入口账号到 agent 的路由关系
- `subagents.allowAgents`：谁可以被当前 agent 调度

再记一句：

**Bot 是入口，Model 是思考引擎，Agent 是带规则的执行岗位。**

---

## 3. 手动配置总览（建议顺序）

1. 在 `agents.list` 中新增目标 agent（本文以 `architect` 为例）
2. 给 PM 放开对目标 agent 的调度权限（`subagents.allowAgents`）
3. 选择入口模式：
   - 单入口模式：只有 PM bot（推荐起步）
   - 多入口模式：给目标 agent 单独 bot（按需）
4. 配置 `bindings`
5. 准备 `SOUL.md` / `AGENTS.md` / `skills`（详细定制见 [Agent 工作区引导文件定制指南](/lab/setup/workspace/)）
6. 配置模型分层（PM / Architect / Dev / QA 等）
7. 运行验证与排错

---

## 3.1 先统一命名：`product_manager` 还是 `pm`？

建议在全局保持**同一套命名**，否则后续排错很痛苦。

推荐规则：

- `agentId` 用什么，`workspace` 目录名就尽量跟什么
- `accountId` 也尽量与 `agentId` 保持一致

例如你习惯用 `product_manager`，则统一成：

- `agentId: "product_manager"`
- `workspace: "~/.openclaw/workspace/product_manager"`
- `accountId: "product_manager"`

本文后续示例用 `pm` 作为简写，你可在自己环境里替换为 `product_manager`，效果一致。

---

## 4. 第一步：在 `openclaw.json` 中新增 Agent

配置文件：`~/.openclaw/openclaw.json`  
本文以 Architect 为例，其他角色同理。

最小示例（重点看 `agents.list`）：

```json5
{
  agents: {
    list: [
      {
        id: "product_manager",
        default: true,
        workspace: "~/.openclaw/workspace/product_manager",
        model: "openrouter/arcee-ai/trinity-large-preview:free",
        subagents: {
          allowAgents: ["architect", "dev", "qa"],
        },
      },
      {
        id: "architect",
        workspace: "~/.openclaw/workspace/architect",
        model: "openrouter/arcee-ai/trinity-large-preview:free",
      },
      {
        id: "dev",
        workspace: "~/.openclaw/workspace/dev",
        model: "openrouter/arcee-ai/trinity-large-preview:free",
      },
      {
        id: "qa",
        workspace: "~/.openclaw/workspace/qa",
        model: "openrouter/arcee-ai/trinity-large-preview:free",
      },
    ],
  },
}
```

### 4.1 命令行方式添加 Agent（不用手改 JSON）

1. 新增目标 Agent（以 architect 为例，指定 workspace + 模型）

```bash
openclaw agents add architect \
  --workspace ~/.openclaw/workspace/architect \
  --model openrouter/arcee-ai/trinity-large-preview:free \
  --bind telegram:architect
```

2. 查看是否创建成功

```bash
openclaw agents list
```

3. 给 Telegram 新增目标账号（多入口模式时）

```bash
openclaw channels add
```

在向导中选择 Telegram，按提示填写 bot token。

4. （可选）若第 1 步未带 `--bind`，可单独绑定

```bash
openclaw agents bind --agent architect --bind telegram:architect
```

5. 检查绑定结果

```bash
openclaw agents bindings
openclaw channels status --probe
```

#### `agents add ... --bind` 与 `agents bind ...` 的区别

- `openclaw agents add architect --workspace ... --bind ...`  
  = **创建（或更新）agent，并可选同时绑定**，适合首次接入。
- `openclaw agents bind --agent architect --bind ...`  
  = **只改路由绑定**，不负责创建 agent，适合后续调整。

#### 已有 Agent，如何切换模型？

若 agent 已存在，可直接修改配置中的模型字段：

```bash
openclaw config get agents.list
openclaw config set agents.list.<agent索引>.model openrouter/arcee-ai/trinity-large-preview:free
```

> `agents.list.<agent索引>` 需通过 `openclaw config get agents.list` 确认实际下标。

---

## 5. 第二步：选择入口模式（单入口 vs 多入口）

### 5.1 单入口模式（推荐）

只配置 PM 一个 bot，子 agent 不对外暴露。

优点：用户体验简单、群里不刷屏、协作在内部会话完成。

示例：

```json5
{
  channels: {
    telegram: {
      accounts: {
        product_manager: { botToken: "TELEGRAM_BOT_TOKEN_PM" },
      },
    },
  },
  bindings: [
    {
      agentId: "product_manager",
      match: { channel: "telegram", accountId: "product_manager" },
    },
  ],
}
```

### 5.2 多入口模式（按需启用）

为目标 agent 增加独立 bot（例如架构评审群直接找 Architect）。

```json5
{
  channels: {
    telegram: {
      accounts: {
        product_manager: { botToken: "TELEGRAM_BOT_TOKEN_PM" },
        architect: { botToken: "TELEGRAM_BOT_TOKEN_ARCH" },
      },
    },
  },
  bindings: [
    {
      agentId: "product_manager",
      match: { channel: "telegram", accountId: "product_manager" },
    },
    { agentId: "architect", match: { channel: "telegram", accountId: "architect" } },
  ],
}
```

---

## 6. 第三步：`workspace` 与 `agentDir` 如何配置

- `workspace`：文件工作区（代码、文档、产物）
- `agentDir`：状态目录（认证、会话、配置状态）

实践建议：

- 若希望 PM / Architect / Dev 共享项目文件视图，可让它们指向同一仓库或同仓子目录
- `agentDir` 需保持隔离，避免状态串扰

**可以共享文件视图，不要共享状态目录。**

---

## 7. 第四步：塑造 Agent（SOUL / AGENTS / skills）

SOUL、AGENTS、TOOLS 等内容因角色差异较大，建议参考对应角色的《Agent 工作区引导文件定制指南》：

- [架构师](/lab/setup/workspace/architect)、[产品经理](/lab/setup/workspace/product-manager)、[开发工程师](/lab/setup/workspace/dev)、[测试工程师](/lab/setup/workspace/qa)、[DevOps](/lab/setup/workspace/ops)、[文档工程师](/lab/setup/workspace/docs)、[平台管理员](/lab/setup/workspace/admin) 等

以下为 Architect 的简要示例，便于理解结构：

### 7.1 `SOUL.md`（人格与边界）

建议放在 `~/.openclaw/workspace/architect/SOUL.md`。

```markdown
# SOUL.md

你是资深系统架构师，偏工程落地，不追求炫技。

决策原则：
1. 先满足可靠性和可维护性，再谈花哨设计。
2. 任何方案必须包含权衡（收益/成本/风险/回滚）。
3. 不确定时明确假设，不虚构事实。

输出要求：
- 先给结论（推荐方案）
- 再给备选方案对比
- 最后给分阶段落地计划（M1/M2/M3）
```

### 7.2 `AGENTS.md`（执行规则）

建议放在 `~/.openclaw/workspace/architect/AGENTS.md`，把流程写成固定 SOP（具体步骤见架构师工作区引导指南）。

### 7.3 `skills/`（高复用能力包）

适合做成 skill 的情形：

- 每周会重复做的事
- 输出格式相对固定
- 需跨多个 agent 复用

Architect 可做：`arch-review`、`api-contract`、`migration-plan` 等；其他角色按需参考对应工作区引导。

---

## 8. 第五步：PM 如何安排子 Agent 工作

两种方式：

- 聊天里用 `/subagents spawn architect <task>`
- 让 PM 在对话中自动调用 `sessions_spawn` 到目标 agent

任务提示词示例（以 Architect 为例）：

```text
请把「支付系统重构」拆成架构任务，派给 architect，并要求输出：
1) 目标架构与模块边界
2) 方案对比（至少2套）
3) 风险清单与回滚方案
4) 两周内可落地的实施计划
```

派给 Dev、QA 等时，替换 agentId 和任务描述即可。

---

## 9. 第六步：模型推荐（按角色分层）

模型榜单（如 [PinchBench](https://pinchbench.com/)）适合做初筛，最终建议按自己任务集做回归测试。

### 9.1 角色-模型建议（实战版）

- PM（协调/拆解）：优先高质量模型
- Architect（架构权衡/长期演进）：优先高推理稳定模型
- Dev（实现）：日常开发用均衡模型
- QA（用例生成/回归检查）：偏性价比模型
- Ops（脚本与排障）：均衡或偏快，关键变更再切高质量

### 9.2 低成本策略

- PM 和 Architect 用高质量
- 子任务执行 agent 按任务复杂度用中低成本模型
- 到「架构 Gate / 上线 Gate」再切回高质量做最终审查

### 9.3 收费与免费

- **通常收费**：主流云模型按 token 或套餐计费。
- **可能不额外花钱**：平台免费额度、带 `:free` 的路由模型、本地自托管。
- **建议**：关键决策不用全免费模型；重复劳动可优先免费模型。

### 9.4 按月预算反推（3 档示例）

| 档位 | 预算 | 适用 |
|------|------|------|
| A | ~100 元/月 | 个人学习、小项目、低并发 |
| B | ~500 元/月 | 个人长期项目、2~5 人小团队 |
| C | ~1000 元/月+ | 多项目并行、对稳定性要求高 |

策略原则：先固定「角色-模型」默认路由，再按需临时提档。

---

## 10. 第七步：验证清单

1. 查看 agent 列表：`openclaw agents list`
2. 查看绑定关系：`openclaw agents bindings`
3. 查看渠道状态：`openclaw channels status --probe`
4. 让 PM 派一次任务：`/subagents spawn architect 设计用户权限系统的分层架构，并给出迁移方案`
5. 确认回到 PM 会话并完成汇总

---

## 11. 常见故障与修复

- PM 不能调子 agent：检查 `product_manager.subagents.allowAgents` 是否包含目标 agentId
- 消息未路由到预期 agent：检查 `bindings` 是否命中，是否被 fallback 到 `default: true` agent
- 多个 default 导致回退异常：只保留一个 `default: true`
- 群里 bot 互 @ 无反应：优先用内部 `sessions_spawn` / `sessions_send`，而非 bot 互聊

---

## 12. 什么时候不单独加子 Agent

若遇以下情况，可先不拆分：

- 小需求、一次性脚本、低风险改动
- 实现路径非常明确，无需架构权衡
- 团队规模小，拆分带来的沟通成本高于收益

可先 PM → Dev 直连，等复杂度上来再拆 Architect 或其他子 agent。

---

## 13. 结语

建议先用「**单入口 PM + 内部子 agent 调度**」跑通，再决定是否给子 agent 单独 bot。这样能在不增加太多复杂度的前提下，明显提升协作质量。

---

## 参考链接

- [OpenClaw Multi-agent Routing](https://docs.openclaw.ai/concepts/multi-agent)
- [OpenClaw Sub-agents](https://docs.openclaw.ai/tools/subagents)
- [OpenClaw Skills](https://docs.openclaw.ai/tools/skills)
- [OpenClaw Agent Send](https://docs.openclaw.ai/tools/agent-send)
- [Agent 工作区引导文件定制指南](/lab/setup/workspace/)（架构师、产品经理、开发、测试、DevOps、文档等）
- [新增 Telegram 机器人操作手册](/lab/telegram/bot-add)
- [PinchBench](https://pinchbench.com/)
