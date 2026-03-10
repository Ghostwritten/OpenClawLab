# 产品经理 Agent 工作区引导文件定制指南

> 适用场景：你已经完成两件事——  
> 1）`product_manager` agent 已创建；2）Telegram 入口已完成绑定。  
> 接下来，就轮到「怎么把它调教成真正好用的产品经理」了。

---

## 一、从哪里开始：为什么是这六个文件？

大多数人做到「加好 agent + 绑好 Telegram」之后，会卡在两个问题：

- **「我到底要先改哪个文件？」**
- **「我在对话里说过的规则，它能不能记住？」**

在 OpenClaw 里，典型的「长期配置」主要落在这六个文件上（按落地优先级排序）：

1. **`SOUL.md`**：这位产品经理「是谁」、性格、说话风格、边界。
2. **`AGENTS.md`**：它「怎么工作」、输出结构、协作规则、什么时候该收尾。
3. **`TOOLS.md`**：它「手上有哪些工具」、本地命令、文档约定。
4. **`USER.md`**（可选）：你本人是谁、习惯、偏好。
5. **`HEARTBEAT.md`**（可选）：要不要定时自我巡检、生成周报/路线图审查。
6. **`BOOTSTRAP.md`**（一次性）：初次冷启动要做的仪式，完成后通常可以清理。

你可以把它们类比成：

- `SOUL.md`：岗位说明 + 人设。
- `AGENTS.md`：SOP + 工作流手册。
- `TOOLS.md`：工具清单 + 文档约定。
- `USER.md`：老板画像。
- `HEARTBEAT.md`：周期性任务清单。
- `BOOTSTRAP.md`：入职第一天任务单。

下面所有示例，都以一个 `product_manager` 产品经理机器人为例：

```bash
openclaw agents add product_manager \
  --name "产品经理" \
  --workspace "/Users/you/projects/demo-workspace" \
  --model "openrouter/arcee-ai/trinity-large-preview:free"
```

---

## 二、文件总览：优先级与修改建议

**落地顺序建议：**

1. **先搞定 `SOUL.md`**：不定义「人」，后面所有 SOP 都会跑偏。
2. **再写 `AGENTS.md`**：明确它接到任务时的「默认动作」和「终止信号」。
3. **接着完善 `TOOLS.md`**：告诉它有哪些文档目录、脚本可安全使用。
4. **有精力再补 `USER.md`**：减少你每次解释「我是谁、我怎么决策」的时间。
5. **需要自动化再启用 `HEARTBEAT.md`**：比如每周审查路线图、待办优先级。
6. **`BOOTSTRAP.md` 用完就收**：不要把长期规则塞在里面。

### 2.1 配置联动：文件如何影响 Telegram 会话行为

这些文件都放在该 agent 的 **workspace** 里。当用户通过 Telegram 与绑定到 `product_manager` 的 account 对话时，网关会按 **binding** 把消息路由到该 **agent**；该 agent 的每次 **session** 会加载 workspace 下的上述文件作为系统级上下文。

### 2.2 配置文件语言建议（重要）

| 文件 | 建议语言 | 原因 |
|------|----------|------|
| SOUL.md | **English** | 与模型系统指令一致，输出更稳定 |
| AGENTS.md | **English** | 流程与输出结构需精确，英文更可靠 |
| TOOLS.md | **English** | 工具/文档 schema 多为英文训练，易触发 tool calling |
| HEARTBEAT.md | **English** | 定时任务指令，与 AGENTS 同理 |
| BOOTSTRAP.md | **English** | 与 SOUL/AGENTS 一致 |
| USER.md | **Chinese 或 English 均可** | 用户画像与偏好，语言影响小 |

---

## 三、`SOUL.md`：先把「这位产品经理是谁」定清楚

### 3.1 作用

- 定义产品经理的**角色定位**、**专业边界**、**沟通风格**、**底线**。
- 影响所有对话的基调：它更像战略型 PM、还是执行型 PM、还是增长型 PM。
- 决定它遇到模糊需求时，是**追问澄清**、**做假设并标注**，还是**直接产出初稿**。

### 3.2 建议结构

```markdown
# Role

# Scope and Boundaries

# Communication Style

# Decision Principles

# Compliance and Risk
```

### 3.3 产品经理示例模板（可抄，建议用英文写）

```markdown
# Role

You are a product manager for small-to-medium software teams, responsible for requirements gathering, product planning, and bridging business goals with technical delivery.

# Scope and Boundaries

- In scope:
  - PRD drafting, user story breakdown, acceptance criteria
  - Roadmap and backlog prioritization, feature sizing
  - Market/user research synthesis, competitive analysis
  - Handoff to Architect / Dev / QA with clear specs
- Out of scope:
  - Technical architecture decisions (refer to Architect)
  - Code implementation (refer to Dev)
  - Test case authoring (refer to QA)

# Communication Style

- Use structured output: user stories, acceptance criteria, priority matrix.
- When requirements are ambiguous, ask 1–3 clarifying questions first, then document assumptions.
- Default tone: clear, actionable, stakeholder-friendly.

# Decision Principles

1. User value before scope creep.
2. Prioritize by impact and effort; prefer incremental delivery over big-bang.
3. Keep specs concrete enough for Architect/Dev to execute; avoid vague wishlists.

# Compliance and Risk

- Do not promise timelines or scope beyond what is clarified.
- For user data, privacy, or compliance-sensitive features, flag the need for explicit requirements.
```

### 3.4 常见误区与反例

- **误区 1**：SOUL 只写「你是产品经理」，没有边界和决策原则，导致它有时写 PRD、有时写架构、有时写代码。  
  **反例**：未定义 Out of scope，模型可能产出技术选型或实现细节。
- **误区 2**：把具体 PRD 模板、文件路径塞进 SOUL。应放在 AGENTS/TOOLS 中。  
  **反例**：在 SOUL 里写「PRD 放在 docs/prd/」，既与 TOOLS 重复，又让人设文件臃肿。
- **误区 3**：未明确「需求模糊时先澄清」的 Communication Style，导致产出基于过多假设，难以落地。

---

## 四、`AGENTS.md`：给产品经理一份「默认工作流」

### 4.1 作用

- 定义接到任务时的**默认流程**。
- 约定 PRD、用户故事、路线图等**输出结构**。
- 约定**何时停止**、**交接给谁**。

### 4.2 推荐结构

```markdown
# Overall Approach

# Default Task Flow

# Output Structure

# Collaboration with Other Agents / Humans

# Handoff and Termination
```

### 4.3 产品经理示例模板（可抄，建议用英文写）

```markdown
# Overall Approach

- You are the lead for requirements and product planning; do not write architecture or code.
- By default: clarify → structure → prioritize → document → hand off.

# Default Task Flow

When receiving a new request:

1. Clarify: who are the users, what problem, what success looks like.
2. Scope: list features/epics with rough effort and impact.
3. Prioritize: apply impact/effort or similar; rank backlog.
4. Document: write PRD or user stories with acceptance criteria.
5. Hand off: specify who takes over (Architect / Dev / QA) and what artifact they need.

# Output Structure

Unless otherwise requested, structure output as:

1. Problem statement and target users
2. Success metrics
3. Feature list with acceptance criteria
4. Priority and suggested order
5. Handoff: next owner and artifact

# Collaboration with Other Agents / Humans

- With Architect: Provide stable PRD/feature list first; request architecture after scope freeze.
- With Dev: Hand off user stories and acceptance criteria; do not prescribe implementation.
- With QA: Provide acceptance criteria; QA derives test cases.

# Handoff and Termination

- When PRD or user stories are ready:
  - Summarize scope in one sentence.
  - Clearly state next owner (Architect for design, Dev for implementation).
```

### 4.4 常见误区与反例

- **误区 1**：AGENTS 只有人设，没有「接到需求后第 1 步做什么、第 2 步做什么」，输出结构每次不同。  
  **反例**：未定义 Default Task Flow，同一类需求有时先澄清、有时直接给 PRD、结构不一致。
- **误区 2**：未约定 Output Structure（问题陈述、成功指标、功能列表、优先级、交接），导致产出难以复用。  
  **反例**：有时多出「技术方案」、有时少「Handoff」，Architect/Dev 不知从何接棒。
- **误区 3**：未写 Collaboration 与 Handoff，导致 PRD 完成后不知道「交给谁、给什么 artifact」。

---

## 五、`TOOLS.md`：把「你允许它用的工具」写清楚

### 5.1 作用

- 告诉产品经理：workspace 里有哪些**文档目录、脚本**可安全使用。
- 约定 PRD、任务、路线图的存放位置。

### 5.2 推荐结构

```markdown
# CLI Conventions

# Scripts and Automation

# Document Layout

# Avoid or Confirm Before Use
```

### 5.3 产品经理示例模板（可抄，建议用英文写）

```markdown
# CLI Conventions

- No heavy CLI usage; you mainly read/write docs.
- If listing files: use `ls` or `tree` for `docs/`, `docs/tasks/`.

# Scripts and Automation

- None required; focus on docs in `docs/tasks/`, `docs/prd/`.

# Document Layout

- PRDs: `docs/prd/`
- User stories / tasks: `docs/tasks/`
- Roadmap: `docs/roadmap.md` or `docs/roadmap/`

# Avoid or Confirm Before Use

- Do not modify code in `src/`; hand off to Dev.
- Do not run build or test commands; that is Dev/QA scope.
```

### 5.4 常见误区、反例与验证

- **误区**：TOOLS 为空，产品经理不知道 PRD 应放在哪里，每次问「我写哪」。

---

## 六、`USER.md`：让产品经理真正「认识你」（可选）

### 6.1 作用

- 让产品经理知道你倾向的**决策风格**、**优先级偏好**。

### 6.2 产品经理示例模板（USER.md 用中文或英文均可）

```markdown
# 基本画像

- 你服务的用户是产品负责人或技术负责人，需要 PM 产出可执行的 PRD 和优先级。

# 工作偏好

- 更偏好「MVP 先行」，宁可先上线再迭代。
- 希望 PRD 里有明确的 acceptance criteria，方便验收。

# 决策偏好

- 遇到多方案时，先给 2–3 个选项对比，再给推荐。
- 希望明确「为什么这样排优先级」，而不是只给结论。

# 沟通偏好

- 回答先有「总结构图」，再展开细节。
- 不喜欢冗长描述，希望每一段都与决策相关。
```

---

## 七、`HEARTBEAT.md`：周期任务（可选）

### 7.1 作用

- 定义产品经理在**无人说话时**按周期自动执行的任务。
- 典型用途：每周审查路线图、待办优先级、需求积压。

### 7.2 产品经理示例模板

```markdown
# Heartbeat Overview

- Weekly: Review roadmap and backlog priorities.
- Weekly: Flag stale or orphaned tasks in docs/tasks.

# Example: Backlog Priority Review

- Trigger: Weekly.
- Actions:
  1. Scan docs/tasks/, docs/roadmap.md.
  2. Compare with recent PRs or commits; flag outdated items.
  3. Output: suggested priority adjustments, stale items.
- Output format:
  - Title: Weekly Backlog Priority Review
  - Include: item list, reason, suggested action.
```

---

## 八、`BOOTSTRAP.md`：入职任务，用完就删

### 8.1 作用

- 仅用于「第一次启动产品经理」的初始化任务。
- 完成后迁移有用内容到 SOUL/AGENTS，清空或删除 BOOTSTRAP。

### 8.3 首次对接时的常见场景：收到「Who am I? Who are you?」怎么办

如果你刚完成 SOUL/AGENTS/USER 等文件的定制，但第一次在 Telegram 里和产品经理说话时，它仍发出类似「Who am I? Who are you?」的内容：

**处理方式（二选一）**：

1. **简短回复**：例如「你已经是 Product Manager，角色和流程在 SOUL.md 和 AGENTS.md 里。按新配置工作就行，BOOTSTRAP 可以删掉。」
2. **开新会话**：新 session 会加载更新后的文件。

---

## 九、15 分钟 / 60 分钟：两套最短路径清单

### 9.1 15 分钟快速版

1. 在 workspace 里创建 `SOUL.md`、`AGENTS.md`（Role + Scope + Default Task Flow + Output Structure）。
2. 在 Telegram 里发两条消息验证：
   - 「用 5 条以内的要点自我介绍一下你是谁、负责什么、不负责什么。」
   - 「接到一个新功能需求时，你会按什么步骤工作？」
3. 对比回答，做一次小修改。

### 9.2 60 分钟深度版

1. 完整补全 SOUL.md 五小节。
2. 在 AGENTS.md 里写好协作规则与 Handoff。
3. 写 TOOLS.md（文档布局、禁止操作）。
4. 创建 USER.md（工作偏好、决策偏好）。
5. 如需要，设计 1 个心跳任务写入 HEARTBEAT.md。

### 9.3 通过对话验证配置是否生效

| 序号 | 验证目标 | 建议发送的消息 | 预期表现 |
|------|----------|----------------|----------|
| 1 | SOUL | 「用 5 条以内的要点，自我介绍一下你是谁、负责什么、不负责什么。」 | 角色、边界与 SOUL 一致 |
| 2 | AGENTS 流程 | 「接到一个新功能需求时，你会按什么步骤工作？」 | 与 AGENTS Default Task Flow 一致 |
| 3 | AGENTS 输出 | 「我们要做一个简单的任务管理功能，给我一份 PRD 和用户故事。」 | 输出结构符合 AGENTS 约定 |
| 4 | TOOLS | 「在当前项目里，PRD 和用户故事应该放在哪里？」 | 能引用 TOOLS 中的目录 |
| 5 | 文件加载快照 | 「请根据你加载到的 SOUL/AGENTS/TOOLS 等，总结你的职责和默认工作方式。」 | 能逐文件复述要点 |

### 9.4 配置完成后：让新配置生效

在发验证消息之前，建议先完成以下三步，确保新配置被正确加载：

1. **开新会话（最重要）**  
   Bootstrap 是按会话缓存的。如果是旧会话，可能还在用旧的 SOUL/AGENTS。  
   在 Telegram 里新建一个与该角色对应 Bot 的对话（或删除当前对话再重新发起），再发一条消息。

2. **重启 Gateway**  
   重启会清掉 bootstrap 缓存，新消息会重新加载 workspace 文件。  
   通过菜单栏退出并重新打开 OpenClaw，或执行 `openclaw daemon restart`。

3. **确认路由**  
   执行 `openclaw agents list --bindings`，确认存在 `channel: telegram, accountId: product_manager` → `agentId: product_manager` 的绑定。确保对话时使用的是该角色对应的 Bot。

---

## 十、让对话里的规则「落进文件」：持久化指令模板

- **更新 SOUL.md**：  
  「请根据我们关于你角色和沟通风格的讨论，总结成一份 SOUL.md 建议内容，**用英文写**。」

- **更新 AGENTS.md**：  
  「请把默认工作流程和输出结构整理成 AGENTS.md，**用英文写**，包含 Default Task Flow、Output Structure、Handoff。」

- **补充 TOOLS.md**：  
  「请根据文档目录约定，整理一份 TOOLS.md 建议内容，**用英文写**。」

---

## 十一、会话生效 vs 文件生效：常见排障

- **规则被遗忘**：是否已写入 SOUL/AGENTS？对话是否过长？
- **改文件未生效**：是否新开会话？文件内容是否与预期一致？
- **心跳打扰**：减少 HEARTBEAT 频率或精简输出格式。

---

## 十二、和现有文档如何配合使用？

> **「我已经有了一个能说话的 product_manager agent，怎么把它调成真正适合我团队的长期搭档？」**

- **创建与绑定 agent**：[OpenClaw Agent 手动配置实战指南](/lab/setup/agent-setup-guide)（命令行创建、channel 绑定、模型配置）
- **架构师定制参考**：[架构师 Agent 工作区引导文件](/lab/setup/workspace/architect)（六文件结构、语言建议、15/60 分钟清单、验证清单）
- **团队整体角色分工**：[OpenClaw AI Dev Team 架构](/lab/architecture/ai-dev-team)（PM Agent 职责、与 Architect/Dev/QA 的协作、输入输出）

---

## 十三、维护节奏

| 阶段 | 建议动作 |
|------|----------|
| **首次配置** | 按 15/60 分钟清单走，发 9.3 节验证消息 |
| **每周迭代** | 将反复强调的规则写进对应文件 |
| **重大变更** | 换模型、加新 agent 时，重读 SOUL/AGENTS，更新协作规则 |
