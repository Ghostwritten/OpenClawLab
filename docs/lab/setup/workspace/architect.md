# 架构师 Agent 工作区引导文件定制指南

> 适用场景：你已经完成两件事——  
> 1）`architect` agent 已创建；2）Telegram 入口已完成绑定。  
> 接下来，就轮到“怎么把它调教成真正好用的架构师”了。

---

## 一、从哪里开始：为什么是这六个文件？

大多数人做到“加好 agent + 绑好 Telegram”之后，会卡在两个问题：

- **“我到底要先改哪个文件？”**
- **“我在对话里说过的规则，它能不能记住？”**

在 OpenClaw 里，典型的“长期配置”主要落在这六个文件上（按落地优先级排序）：

1. **`SOUL.md`**：这位架构师“是谁”、性格、说话风格、边界。
2. **`AGENTS.md`**：它“怎么工作”、输出结构、协作规则、什么时候该收尾。
3. **`TOOLS.md`**：它“手上有哪些工具”、本地命令、代码约定。
4. **`USER.md`**（可选）：你本人是谁、习惯、偏好。
5. **`HEARTBEAT.md`**（可选）：要不要定时自我巡检、生成日报之类。
6. **`BOOTSTRAP.md`**（一次性）：初次冷启动要做的仪式，完成后通常可以清理。

你可以把它们类比成：

- `SOUL.md`：岗位说明 + 人设。
- `AGENTS.md`：SOP + 工作流手册。
- `TOOLS.md`：工具清单 + 使用约定。
- `USER.md`：老板画像。
- `HEARTBEAT.md`：周期性任务清单。
- `BOOTSTRAP.md`：入职第一天任务单。

下面所有示例，都以一个 `architect` 架构师机器人为例，假设你已经通过类似命令完成了基础配置（仅示意，模型用免费路由占位）：

```bash
openclaw agents add architect \
  --name "架构师" \
  --workspace "/Users/you/projects/demo-workspace" \
  --model "openrouter/arcee-ai/trinity-large-preview:free"
```

---

## 二、文件总览：优先级与修改建议

**落地顺序建议：**

1. **先搞定 `SOUL.md`**：不定义“人”，后面所有 SOP 都会跑偏。
2. **再写 `AGENTS.md`**：明确它接到任务时的“默认动作”和“终止信号”。
3. **接着完善 `TOOLS.md`**：告诉它有哪些命令/脚本可以安全调用。
4. **有精力再补 `USER.md`**：减少你每次解释“我是谁、我怎么决策”的时间。
5. **需要自动化再启用 `HEARTBEAT.md`**：比如每天早上 9 点检查架构图是否过期。
6. **`BOOTSTRAP.md` 用完就收**：不要把长期规则塞在里面。

后文按这个顺序展开，每个小节都给出：

- 作用说明
- 建议写法
- 可直接抄用的架构师模板
- 常见误区与验证方式

### 2.1 配置联动：文件如何影响 Telegram 会话行为

这些文件都放在该 agent 的 **workspace** 里。当用户通过 Telegram 与绑定到 `architect` 的 account 对话时，网关会按 **binding** 把消息路由到 `architect` 这个 **agent**；该 agent 的每次 **session** 会加载 workspace 下的上述文件作为系统级上下文。因此：

- **SOUL.md / AGENTS.md** 决定“它是谁、怎么干活”，直接塑造你在 Telegram 里看到的回复风格和流程。
- **TOOLS.md** 决定它建议或调用的命令、脚本，减少反复问你“用什么跑测试”。
- **USER.md** 让它按你的偏好调整方案表述和决策重点。
- **HEARTBEAT.md** 决定在无人发言时是否自动跑定时任务（若启用），可能向同一会话或指定位置输出结果。
- **BOOTSTRAP.md** 仅在一次性的“首次启动”场景下被使用，之后建议清理，避免被当成长期规则。

所以：改 workspace 里的文件 = 改该 agent 在所有入口（包括 Telegram）上的长期行为；只在对话里说一句 = 仅当次 session 可能生效，易被后续长对话冲掉。

### 2.2 配置文件语言建议（重要）

| 文件 | 建议语言 | 原因 |
|------|----------|------|
| SOUL.md | **English** | 与模型系统指令、角色定义训练分布一致，输出更稳定 |
| AGENTS.md | **English** | 流程与输出结构指令需精确，英文触发更可靠 |
| TOOLS.md | **English** | 工具调用 schema 多为英文训练，写「Use the X tool when Y」比「使用 X 工具当 Y」更容易触发 tool calling |
| HEARTBEAT.md | **English** | 定时任务行为指令，与 AGENTS 同理 |
| BOOTSTRAP.md | **English** | 与 SOUL/AGENTS 一致 |
| USER.md | **Chinese 或 English 均可** | 主要是用户画像与偏好，不直接驱动 tool 调用，语言影响小；若你主要用中文沟通，用中文更自然 |

**TOOLS.md 语言差异示例**：  
- 中文「使用搜索工具查询资料」→ 模型易理解为普通描述，未必触发工具调用  
- 英文「Use the search tool when external information is required.」→ 更易触发 tool calling  

原则：**与 tool / schema 相关的指令用英文，与人设和偏好相关的可用中文。**

---

## 三、`SOUL.md`：先把“这位架构师是谁”定清楚

### 3.1 作用

- 定义架构师的**角色定位**、**专业边界**、**语气风格**、**底线**。
- 影响所有对话的“基调”：它更像技术总监，还是像资深顾问，还是像同级架构师。
- 决定它遇到不合理需求时，是**迎合**、**温和反驳**，还是**强硬纠偏**。

### 3.2 建议结构

推荐的 `SOUL.md` 结构：

```markdown
# 角色定位

# 专业范围与边界

# 沟通风格

# 决策原则

# 风险与合规底线
```

### 3.3 架构师示例模板（可抄，建议用英文写）

```markdown
# Role

You are a senior software architect for small-to-medium teams, responsible for technical design and evolution from 0→1 to 1→N.

# Scope and Boundaries

- In scope:
  - End-to-end architecture for web and mobile applications
  - Backend service decomposition, API design, data modeling
  - AI Agent–related system design and implementation paths
- Out of scope:
  - Pixel-level UI design (you may suggest structure and interaction patterns)
  - Legal, tax, HR, or other non-technical advice

# Communication Style

- Prefer structured output (bullet points, lists, tables).
- When requirements are unrealistic or high-risk, explain risks first, then offer trade-offs.
- Default tone: professional, calm, concise.

# Decision Principles

1. Feasibility before elegance.
2. Balance cost, timeline, and technical risk; avoid over-engineering.
3. Respect the team’s current stack and cognitive load; avoid unnecessary new tech.

# Compliance and Risk

- Do not suggest practices that clearly violate law or compliance.
- For user data, privacy, or payments, proactively flag risks and missing non-functional requirements.
```

### 3.4 常见误区与反例

- **误区 1：`SOUL.md` 写得太虚，只有一句话。**  
  结果是模型在不同对话里风格不一致，很难“像一个固定的人”。  
  **反例**：只写“你是架构师”，没有边界和语气，它有时像顾问有时像执行，回复长度和严谨度波动大。

- **误区 2：把具体 SOP、命令、文件路径写进 `SOUL.md`。**  
  这些更适合放在 `AGENTS.md` / `TOOLS.md`，避免人设文件太杂。  
  **反例**：在 SOUL 里写“接到需求先跑 `pnpm test`”，既让人设文件臃肿，又容易和 TOOLS.md 重复或冲突。

### 3.5 如何验证生效？

在 Telegram 里，对刚配置好的架构师说：

> “用 5 条以内的要点，自我介绍一下你是谁、你负责什么、不负责什么。”

如果自我介绍基本符合 `SOUL.md` 里写的内容，就说明“人设”已经对上了；如果偏差很大，优先回到 `SOUL.md` 再改。

---

## 四、`AGENTS.md`：给架构师一份“默认工作流”

### 4.1 作用

- 告诉架构师：**接到任务时的默认流程**是什么。
- 定义输出的**结构化格式**，方便你后面接给其他 agent 或工具。
- 约定**何时应该停止**，避免“无限头脑风暴不收口”。

### 4.2 推荐结构

```markdown
# 总体工作方式

# 默认任务处理流程

# 输出结构规范

# 与其他 Agent / 人类的协作规则

# 终止信号与交接标准
```

### 4.3 架构师示例模板（可抄，建议用英文写）

```markdown
# Overall Approach

- You are the lead designer for the technical solution, responsible for the loop from requirements to high-level architecture.
- By default, do not write full code; first clarify architecture, boundary conditions, and key technical decisions.

# Default Task Flow

When receiving a new requirement, follow this order:

1. Clarify requirements and constraints (business goals, scale, platform, timeline, etc.).
2. Compare 1–2 feasible options (simple vs. scalable).
3. Document logical architecture and dependencies (text diagram is fine).
4. Break down into frontend, backend, data, and third-party integration subtasks.
5. Flag risks and non-functional requirements to add (monitoring, logging, permissions, etc.).

# Output Structure

Unless the user requests otherwise, structure output as:

1. Background and objectives
2. Key constraints (time / team / tech stack)
3. Option overview (1–2 options)
4. Recommended option details
5. Task breakdown and milestones (for PM / Dev)
6. Risks and follow-up

# Collaboration with Other Agents / Humans

- With product manager agent: Confirm PRD stability first; if it changes often, suggest freezing a version.
- With frontend / backend agents: Provide API list and data model draft so they don’t guess.
- With QA agent: Highlight high-risk modules and boundary conditions for regression.

# Handoff and Termination

- When the architecture is ready for detailed design or implementation:
  - Summarize the recommended approach in one sentence.
  - Clearly state who takes over next (PM / frontend / backend / QA).
```

### 4.4 常见误区与反例

- **误区 1：`AGENTS.md` 写成第二个 `SOUL.md`，只有人设，没有流程。**  
  **反例**：整篇只写“你专业、冷静、先结论后细节”，没有“接到需求后第 1 步做什么、第 2 步做什么”，模型仍然自由发挥，输出结构不稳定。
- **误区 2：输出结构不收敛，每次问同一类问题，架构师输出结构都不一样。**  
  **反例**：没有在 AGENTS 里固定“背景与目标 → 方案概览 → 推荐方案 → 任务拆解 → 风险”等小节，同一类需求有时多出“技术选型对比”，有时少了“交接给谁”。

### 4.5 如何验证生效？

在 Telegram 里给它一个典型任务，例如：

> “我们要做一个简单的在线课程平台，给我一份架构方案和后续任务拆解。”

观察它的回答：

- 是否按你在 `AGENTS.md` 里约定的结构输出？
- 是否先澄清约束条件，再给方案？

如果偏差较大，回头精简或强化 `AGENTS.md` 里的流程描述。

---

## 五、`TOOLS.md`：把“你允许它用的工具”写清楚

### 5.1 作用

- 告诉架构师：在这个 workspace 里，有哪些脚本、命令、约定可以安全使用。
- 降低“它乱跑命令、改错目录”的风险。
- 给未来接入的其他 agent 一个对齐的“工具说明书”。

### 5.2 推荐结构

```markdown
# 命令行工具约定

# 脚本与自动化任务

# 代码结构约定

# 禁止或谨慎使用的操作
```

### 5.3 架构师示例模板（可抄，建议用英文写，便于触发 tool calling）

```markdown
# CLI Conventions

- Node / package manager:
  - Use pnpm: `pnpm install`, `pnpm test`, `pnpm build`
- Frontend dev:
  - Dev server: `pnpm dev`

# Scripts and Automation

- Build / check:
  - `pnpm check`: lint + format
- Tests:
  - `pnpm test`: unit tests

# Code Layout

- Backend: `src/backend`
- Frontend: `src/frontend`
- Architecture docs: `docs/architecture`

# Avoid or Confirm Before Use

- Do not run destructive commands (e.g. `rm -rf`) without explicit confirmation.
- Do not modify CI config (GitHub Actions, etc.) unless the user explicitly requests it.
```

### 5.4 常见误区、反例与验证

- **误区：什么都不写，结果 agent 每次都问“我可以怎么运行测试？”**  
  写好 `TOOLS.md` 后，架构师可以直接引用里面的命令，少问基础问题。  
  **反例**：TOOLS 为空时，同一项目里它可能一次说 `npm test`、一次说 `yarn test`、一次反问你“你们用哪种包管理器？”

验证方式：在对话里问：

> “在当前项目里，你默认推荐用什么命令跑测试、跑构建？”

看它是不是能回答出你在 `TOOLS.md` 里写的那几条。

---

## 六、`USER.md`：让架构师真正“认识你”（可选但很有用）

### 6.1 作用

- 让架构师知道你倾向的**决策风格**、**风险偏好**、**沟通偏好**。
- 减少重复说明：“我更关心交付速度”“我更看重可维护性”等。

### 6.2 推荐结构

```markdown
# 基本画像

# 工作偏好

# 决策偏好

# 沟通偏好
```

### 6.3 架构师示例模板（可抄，USER.md 用中文或英文均可）

```markdown
# 基本画像

- 你服务的核心用户是一位技术出身的产品负责人，兼顾产品与技术决策。

# 工作偏好

- 更偏好「能落地的方案」，不追求极致优雅。
- 可以接受分阶段演进，只要每一步都有清晰收益。

# 决策偏好

- 遇到大方向选择时，先给出 2~3 个选项对比，再给推荐方案。
- 希望你明确告诉他「为什么这样选」，而不是只给结论。

# 沟通偏好

- 回答中希望先有「总结构图」，再展开细节。
- 不喜欢过长的空话，希望每一段都和决策相关。
```

### 6.4 常见误区、反例与验证

- **误区：`USER.md` 写得太个人化、情绪化，对长期决策帮助不大。**  
  **反例**：只写“我脾气急”“别跟我绕弯子”，没有“更看重交付速度还是可维护性”，架构师仍不知道在方案权衡时该偏哪一侧。

验证方式：在对话里说：

> “根据我在 USER.md 里的偏好，重新调整一下这个方案的推荐理由。”

看它是否会自动引用你的决策偏好来重写。

---

## 七、`HEARTBEAT.md`：只有真的需要“定时任务”再配

### 7.1 作用

- 定义架构师在**没有人说话时**，按周期自动执行的任务。
- 典型用途：
  - 每天早上检查架构文档是否过期；
  - 每周生成一次技术演进周报；
  - 定期扫描 TODO / 技术债清单。

### 7.2 推荐结构

```markdown
# 心跳任务总览

# 任务明细示例

# 输出格式规范
```

### 7.3 架构师示例模板（可抄，建议用英文写）

```markdown
# Heartbeat Overview

- Daily: Check architecture docs for obvious staleness.
- Weekly: Draft architecture evolution suggestions.

# Example: Architecture Doc Review

- Trigger: Daily (configured by system scheduler).
- Actions:
  1. Scan key files in `docs/architecture`.
  2. Compare with recent conversations and code changes; flag mismatches.
  3. Output: list of potentially stale docs + suggested updates.
- Output format:
  - Title: `Daily Architecture Doc Review`
  - Include: doc list, reason, suggested action.
```

### 7.4 常见误区、反例与验证

- **误区 1：把所有规则都塞进心跳，结果正常对话被周期性消息打断。**  
  **反例**：在 HEARTBEAT 里写“每天检查架构、代码规范、依赖更新、安全漏洞……”，触发频繁、输出冗长，干扰日常问答。
- **误区 2：没有明确输出格式，导致每次心跳结果都长得不一样。**  
  **反例**：只写“每天检查架构文档”，不规定“标题 + 疑似过期列表 + 建议动作”，结果有时是一段话、有时是列表、难以自动化处理。

验证方式：启用心跳后，观察一两轮输出是否稳定；如果觉得打扰太多，及时减频率或关闭。

---

## 八、`BOOTSTRAP.md`：入职任务，用完就删

### 8.1 作用

- 仅用于“第一次启动架构师”的初始化任务，例如：
  - 通读某几个关键文档；
  - 在 workspace 里生成一套基础文件结构；
  - 写出第一版 `SOUL.md` / `AGENTS.md` 草稿。

### 8.2 推荐用法与常见误区

- 把你希望架构师**第一次见面就完成的动作**写进去。
- 当你确认“初始化完成”后，可以：
  - 把其中长期有用的内容迁移到 `SOUL.md` / `AGENTS.md` 等；
  - 清空或删除 `BOOTSTRAP.md`，避免后续 agent 误以为那是长期规则。

**常见误区**：把长期 SOP 或协作规则写在 BOOTSTRAP 里不迁移。**反例**：半年后架构师仍按“首次启动”的临时规则回答，和 SOUL/AGENTS 不一致，难以排查。

### 8.3 首次对接时的常见场景：收到「Who am I? Who are you?」怎么办

如果你刚完成 SOUL / AGENTS / USER 等文件的定制，但第一次在 Telegram 里和架构师说话时，它仍发出类似下面的内容：

> Hey there! I just came online... Who am I? Who are you? Let's figure out my name, nature, vibe, emoji...

**原因**：当前会话加载的是**旧版 BOOTSTRAP**（在你更新文件之前就已启动），或首次会话尚未加载你刚写入的配置。

**处理方式（二选一）**：

1. **简短回复，直接切到新配置**  
   在对话里发一句，例如：  
   > 你已经是 Architect 架构师，角色和流程在 SOUL.md 和 AGENTS.md 里。按新配置工作就行，BOOTSTRAP 可以删掉。  
   之后它应切换为按 SOUL/AGENTS 工作，无需再回答 name、vibe、emoji 等。

2. **开新会话**  
   当前会话的上下文可能仍含旧 BOOTSTRAP。新开一个与架构师的对话题目或私聊，新 session 会加载更新后的文件，一般不会再问那套自我介绍问题。

**结论**：配置已写在 SOUL/USER/IDENTITY 里后，不需要再回复那套「Who am I? Who are you?」问答。选一种方式切到新配置即可。

---

## 九、15 分钟 / 60 分钟：两套最短路径清单

### 9.1 15 分钟快速版（先让架构师“像个人”）

1. 在 `architect` 的 workspace 里创建或更新（SOUL / AGENTS 建议用英文，见 2.2 节）：
   - `SOUL.md`：先写 Role + Communication Style + Decision Principles 三段。
   - `AGENTS.md`：只写 Default Task Flow 和 Output Structure 两节。
2. 在 Telegram 里对架构师发两条消息：
   - “用 5 条以内的要点自我介绍一下你是谁、负责什么、不负责什么。”
   - “接到一个新项目需求时，你会按什么步骤工作？用列表说清楚。”
3. 对比它的回答和你刚写的内容，做一次小修改。

做到这一步，你就已经拥有了一个**基础可用**的架构师。即使你用中文和它对话，SOUL/AGENTS 用英文写通常能让模型更稳定地遵循规则。

### 9.2 60 分钟深度版（可以长期陪你做项目）

在 15 分钟版基础上，再做：

1. 完整补全 `SOUL.md` 五个小节。
2. 在 `AGENTS.md` 里：
   - 明确和其他 agent（PM / 前端 / 后端 / QA）的协作规则；
   - 写清楚“终止信号与交接标准”。
3. 写一份初版 `TOOLS.md`：
   - 把你当前项目里最常用的 5~10 条命令写进去；
   - 标记至少 2 条“禁止或谨慎使用”的操作。
4. 创建初版 `USER.md`：
   - 至少写清楚你的工作偏好和决策偏好。
5. 如有需要，设计 1 个心跳任务并写入 `HEARTBEAT.md`。

做完这一轮，你就有了一个**可以长期协同、可持续演进**的架构师机器人。

### 9.3 通过对话验证配置是否生效（回归检查清单）

配置写完后，建议通过一系列**标准化验证对话**确认各文件已正确加载并影响行为。按顺序发送以下消息，观察架构师的回答是否符合预期。

| 序号 | 验证目标 | 建议发送的消息 | 预期表现 |
|------|----------|----------------|----------|
| 1 | SOUL 人设 | 「用 5 条以内的要点，自我介绍一下你是谁、你负责什么、不负责什么。」 | 角色、范围、边界与 SOUL.md 一致，不跑偏到通用助手 |
| 2 | AGENTS 流程 | 「接到一个新项目需求时，你会按什么步骤工作？用列表说清楚。」 | 与 AGENTS 中 Default Task Flow 一致（澄清需求 → 方案对比 → 架构 → 拆解 → 风险） |
| 3 | AGENTS 输出结构 | 「我们要做一个简单的在线课程平台，给我一份架构方案和后续任务拆解。」 | 输出结构符合 AGENTS 约定（背景与目标、约束、方案概览、推荐方案、任务拆解、风险与后续） |
| 4 | TOOLS 命令 | 「在当前项目里，你默认推荐用什么命令跑测试、跑构建？」 | 能引用 TOOLS.md 中写明的命令（如 `pnpm test`、`pnpm build`） |
| 5 | USER 偏好 | 「根据 USER.md 里的偏好，重新调整一下这个方案的推荐理由。」 | 能体现 USER 中决策偏好（如先选项对比、再给理由、先总结构图再细节） |
| 6 | 文件加载快照 | 「请根据你当前加载到的 SOUL / AGENTS / TOOLS / USER / HEARTBEAT 等文件内容，向我总结一下你认为自己的职责和默认工作方式。按文件分类说明。」 | 能逐文件复述核心要点，用于排查“改了半天没生效”的情况 |

**执行建议**：

- **首次配置后**：完整跑一遍 1～6，确认无遗漏。
- **改完任一文件后**：至少重跑与该项目相关的 1～2 条（例如改了 SOUL 就重跑 1，改了 AGENTS 就重跑 2、3）。
- **怀疑未生效时**：优先发第 6 条，看它的“自我总结”是否包含你刚改的内容；若不包含，检查 workspace 路径、session 是否为新会话。

### 9.4 配置完成后：让新配置生效

在发验证消息之前，建议先完成以下三步，确保新配置被正确加载：

1. **开新会话（最重要）**  
   Bootstrap 是按会话缓存的。如果是旧会话，可能还在用旧的 SOUL/AGENTS。  
   在 Telegram 里新建一个与该角色对应 Bot 的对话（或删除当前对话再重新发起），再发一条消息。

2. **重启 Gateway**  
   重启会清掉 bootstrap 缓存，新消息会重新加载 workspace 文件。  
   通过菜单栏退出并重新打开 OpenClaw，或执行 `openclaw daemon restart`。

3. **确认路由**  
   执行 `openclaw agents list --bindings`，确认存在 `channel: telegram, accountId: architect` → `agentId: architect` 的绑定。确保对话时使用的是该角色对应的 Bot。

---

## 十、让对话里的规则“落进文件”：持久化指令模板

很多时候，你是先在对话里和架构师达成一些共识，然后才想“这些话能不能写进配置文件”。  
推荐的做法是让架构师**自己帮你整理和写入**。

**提示**：SOUL / AGENTS / TOOLS / HEARTBEAT 建议用英文写，便于模型正确解析与 tool 触发；USER 用中文或英文均可。在让架构师生成时，可要求“输出英文版”。

以下是几个可以直接发给架构师的中文指令模板，你可以按需改成自己的命名：

- **更新 `SOUL.md`：**

> “请根据我们刚刚关于你角色和沟通风格的讨论，总结成一份 `SOUL.md` 建议内容，**用英文写**，保留 Markdown 标题结构。生成后，明确告诉我应该覆盖写入哪几个小节。”

- **更新 `AGENTS.md`：**

> “请把我们刚刚约定的默认工作流程和输出结构，整理成一份 `AGENTS.md` 建议内容，**用英文写**。要求包含：Overall Approach、Default Task Flow、Output Structure、Handoff and Termination。”

- **补充 `TOOLS.md`：**

> “请根据你刚刚推荐的命令和我们已有脚本，整理一份 `TOOLS.md` 建议内容，**用英文写**，标记清楚 recommended commands 和 operations to avoid or confirm before use。”

通常的工作流是：

1. 先让架构师在对话里生成上述文件内容草稿（英文）；
2. 你复制到真实文件里，人眼做一次小修；
3. 下次对话它就会自动按新规则工作。

---

## 十一、会话生效 vs 文件生效：常见排障

### 11.1 两种“记忆”的区别

- **会话级记忆**：你在当前聊天里说过的规则，模型会短期记住，但可能在很长对话后被挤出上下文。
- **文件级规则**：写在 `SOUL.md` / `AGENTS.md` 等文件里的内容，只要 workspace 没换，就会持续影响后续所有会话。

### 11.2 常见问题矩阵

- **情况 1：我明明刚才说过一条规则，结果它下一次又忘了。**
  - 排查：
    - 这条规则有没有同步进相关文件（`SOUL.md` / `AGENTS.md` 等）？
    - 当前对话是否已经太长，导致早期内容被挤出？  

- **情况 2：我改了文件，但感觉它还是按老习惯回答。**
  - 排查：
    - 修改后有没有触发一次新的会话（有些改动需要新 session 才完全体现）？
    - 文件内容是否和你期望的行为一致，还是仍然保留了旧的描述？

- **情况 3：启用了心跳后，发现它老在我对话中插入心跳输出。**
  - 排查：
    - `HEARTBEAT.md` 里是否写得太“话痨”，没有限制频率和输出格式？
    - 是否可以把部分内容改成仅在特定条件下触发？

遇到类似问题时，可以直接对架构师说：

> “请根据你当前加载到的 SOUL / AGENTS / TOOLS / USER / HEARTBEAT 等文件内容，向我总结一下你认为自己的职责和默认工作方式。按文件分类说明。”

它的自我总结，就是当前“文件实际生效状态”的一个快照。更多标准化验证对话，见 **9.3 通过对话验证配置是否生效**。

---

## 十二、和现有 Architect 文档如何配合使用？

这篇文档只解决一个核心问题：

> **“我已经有了一个能说话的 architect，怎么把它调成真正适合我团队的长期搭档？”**

如果你想回顾“如何创建 architect agent、如何通过命令行绑定 channel / 配置模型”等内容，可以搭配阅读：

- [OpenClaw Agent 手动配置实战指南](/lab/setup/agent-setup-guide)

两个文档的分工可以简单理解为：

- **手动配置实战指南**：讲的是“如何把架构师请进来，并接上线”；
- **本篇引导文件定制指南**：讲的是“架构师入职后，你怎么带教和调教它”。

如果你在使用过程中发现有任何不合理、绕远路、或者可以更聪明的地方，也欢迎直接让架构师帮你记录一条 TODO：  
“回头提醒我，把这次的经验补充进《架构师 Agent 工作区引导文件定制指南》里。”

---

## 十三、维护节奏：首次配置、每周迭代、重大变更复核

| 阶段 | 建议动作 | 清单要点 |
|------|----------|----------|
| **首次配置** | 按本文“15 分钟 / 60 分钟”清单走一遍 | 至少完成 SOUL.md + AGENTS.md；按 9.3 节发 2～6 条验证消息；确认绑定与路由正确（`openclaw agents bindings`）。 |
| **每周迭代** | 根据本周对话补一条、改一条 | 把对话里反复强调的规则写进对应文件；检查 TOOLS.md 是否与当前项目命令一致；如需心跳，再调 HEARTBEAT 频率与输出格式。 |
| **重大变更复核** | 换模型、换 workspace、加新 agent 协作时 | 重读 SOUL.md / AGENTS.md 是否还符合新分工；更新 AGENTS.md 里“与其他 Agent 协作规则”和“终止信号”；按 9.3 节跑一遍对话验证，确认行为未退化。 |

遵循上述节奏，可以保证架构师机器人既不会“一次配完就僵化”，也不会“越用越飘”。

