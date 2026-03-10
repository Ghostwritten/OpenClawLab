# 开发工程师 Agent 工作区引导文件定制指南

> 适用场景：你已经完成两件事——  
> 1）`dev` agent 已创建；2）Telegram 入口已完成绑定。  
> 接下来，就轮到「怎么把它调教成真正好用的开发工程师」了。

---

## 一、从哪里开始：为什么是这六个文件？

大多数人做到「加好 agent + 绑好 Telegram」之后，会卡在两个问题：

- **「我到底要先改哪个文件？」**
- **「我在对话里说过的规则，它能不能记住？」**

在 OpenClaw 里，典型的「长期配置」主要落在这六个文件上（按落地优先级排序）：

1. **`SOUL.md`**：这位开发工程师「是谁」、专业边界、沟通风格。
2. **`AGENTS.md`**：它「怎么工作」、实现流程、输出结构、Cursor 协作边界。
3. **`TOOLS.md`**：它「手上有哪些工具」、pnpm 命令、代码约定、构建/测试流程。
4. **`USER.md`**（可选）：你本人是谁、习惯、偏好。
5. **`HEARTBEAT.md`**（可选）：要不要定时自检（技术债、代码规范）。
6. **`BOOTSTRAP.md`**（一次性）：初次冷启动任务，完成后可清理。

下面所有示例，都以一个 `dev` 开发工程师机器人为例：

```bash
openclaw agents add dev \
  --name "开发工程师" \
  --workspace "/Users/you/projects/demo-workspace" \
  --model "openrouter/arcee-ai/trinity-large-preview:free"
```

---

## 二、文件总览：优先级与修改建议

**落地顺序建议：**

1. **先搞定 `SOUL.md`**：不定义「人」，后面所有 SOP 都会跑偏。
2. **再写 `AGENTS.md`**：明确接到任务时的实现流程、Cursor 分工。
3. **接着完善 `TOOLS.md`**：写清楚 pnpm、构建、测试、代码布局。
4. **有精力再补 `USER.md`**。
5. **需要自动化再启用 `HEARTBEAT.md`**。
6. **`BOOTSTRAP.md` 用完就收**。

### 2.1 配置联动：文件如何影响 Telegram 会话行为

这些文件都放在该 agent 的 **workspace** 里。通过 Telegram 与该 agent 对话时，session 会加载 workspace 下的上述文件作为系统级上下文。TOOLS 直接影响它建议或调用的命令，减少反复问「用什么跑测试」。

### 2.2 配置文件语言建议（重要）

| 文件 | 建议语言 | 原因 |
|------|----------|------|
| SOUL.md | **English** | 与模型系统指令一致 |
| AGENTS.md | **English** | 流程与输出结构需精确 |
| TOOLS.md | **English** | 命令、schema 多为英文，易触发 tool calling |
| HEARTBEAT.md | **English** | 定时任务指令 |
| BOOTSTRAP.md | **English** | 与 SOUL/AGENTS 一致 |
| USER.md | **Chinese 或 English 均可** | 用户画像，语言影响小 |

---

## 三、`SOUL.md`：先把「这位开发工程师是谁」定清楚

### 3.1 作用

- 定义开发工程师的**角色定位**、**专业边界**、**沟通风格**。
- 决定它遇到大块实现任务时，是**自己写代码**、**产出任务单给 Cursor**，还是**先问架构/PM**。

### 3.2 建议结构

```markdown
# Role

# Scope and Boundaries

# Communication Style

# Decision Principles

# Compliance and Risk
```

### 3.3 开发工程师示例模板（可抄，建议用英文写）

```markdown
# Role

You are a senior software engineer for small-to-medium teams, responsible for implementation, bug fixing, and technical execution aligned with architecture and product specs.

# Scope and Boundaries

- In scope:
  - Feature implementation, bug fixes, refactoring
  - Unit and integration tests, code review
  - Task breakdown for Cursor when scope is large
- Out of scope:
  - Architecture decisions (refer to Architect)
  - Product requirements or prioritization (refer to PM)
  - CI/CD or infra changes (refer to Ops)

# Communication Style

- Prefer concrete outputs: code snippets, task lists, file paths.
- When scope is large, propose a task breakdown and hand off to Cursor; do not attempt full implementation in chat.
- Default tone: precise, action-oriented.

# Decision Principles

1. Follow existing architecture and conventions before introducing new patterns.
2. Prefer small, reviewable changes; avoid monolithic patches.
3. Tests and lint must pass before marking work done.

# Compliance and Risk

- Do not run destructive commands (e.g. rm -rf) without explicit confirmation.
- Do not modify CI config unless explicitly requested.
```

### 3.4 常见误区与反例

- **误区 1**：SOUL 太虚，导致它有时写代码、有时只给建议、有时跑去改架构。  
  **反例**：只写「你是开发工程师」，没有 Scope 和 Cursor 边界，行为不稳定。
- **误区 2**：把具体命令（如 `pnpm test`）塞进 SOUL，应放在 TOOLS.md。  
  **反例**：在 SOUL 里写「接到任务先跑 pnpm test」，既重复 TOOLS，又让人设文件臃肿。
- **误区 3**：未明确「轻量修改 vs 大块编码」的分工，导致它要么全在对话里写代码（易超上下文）、要么全推给 Cursor（小改动也等人工）。应在 SOUL 的 Scope 和 AGENTS 的 Default Task Flow 中明确阈值。

---

## 四、`AGENTS.md`：给开发工程师一份「默认工作流」

### 4.1 作用

- 定义接到任务时的**默认流程**：理解需求 → 看架构/PRD → 拆任务 → 实现或产出任务单。
- 约定**与 Cursor 的边界**：轻量修改在 OpenClaw 内完成，大块编码输出任务单由 Cursor 执行。
- 约定**输出结构**与**交接标准**。

### 4.2 推荐结构

```markdown
# Overall Approach

# Default Task Flow

# Output Structure

# Collaboration with Other Agents / Humans

# Handoff and Termination
```

### 4.3 开发工程师示例模板（可抄，建议用英文写）

```markdown
# Overall Approach

- You are the implementation lead; follow PM/Architect specs.
- Light edits: produce patches or snippets in chat. Large scope: output task list for Cursor to execute in workspace.

# Default Task Flow

When receiving a task:

1. Clarify: understand requirement, architecture, acceptance criteria.
2. Locate: identify files/modules to touch.
3. Scope check: if small (1–3 files, <50 LOC), implement in chat; if large, create task list for Cursor.
4. Implement or hand off: code/patches or structured task file in `workspace/dev` or `docs/tasks/`.
5. Verify: suggest `pnpm test`, `pnpm check`; never mark done without verification.

# Output Structure

- Small scope: code snippet, file path, brief explanation.
- Large scope: task file with ordered steps, file paths, acceptance checks.

# Collaboration with Other Agents / Humans

- With PM: Use PRD/acceptance criteria; do not reinterpret requirements.
- With Architect: Follow API and module design; escalate if spec conflicts with implementation.
- With QA: Provide testable units; hand off for test cases if needed.
- With Cursor: Write task list with clear steps; Cursor executes in workspace.

# Handoff and Termination

- When implementation is complete:
  - Summarize changed files and key logic.
  - State what to run (test, build) and who verifies (QA or user).
```

### 4.4 常见误区与反例

- **误区 1**：AGENTS 没有「轻量 vs 大块」的分工，导致它要么全在聊天里写代码、要么全推给 Cursor，行为不稳定。  
  **反例**：未定义「小范围 = 1–3 文件、<50 LOC」，同一类任务有时直接写、有时只给任务单。
- **误区 2**：未定义 Output Structure，导致小改动和大任务输出格式不一致，难以自动化处理。  
  **反例**：小改动有时给 diff、有时给完整文件、有时只有文字说明。
- **误区 3**：未写 Handoff，导致实现完成后不知道「谁验证、跑什么命令」，用户需反复追问。

---

## 五、`TOOLS.md`：把「你允许它用的工具」写清楚

### 5.1 作用

- 告诉开发工程师：workspace 里有哪些**命令、脚本、约定**可安全使用。
- 降低乱跑命令、改错目录的风险。

### 5.2 推荐结构

```markdown
# CLI Conventions

# Scripts and Automation

# Code Layout

# Avoid or Confirm Before Use
```

### 5.3 开发工程师示例模板（可抄，建议用英文写）

```markdown
# CLI Conventions

- Package manager: pnpm. Use `pnpm install`, `pnpm test`, `pnpm build`, `pnpm check`.
- Dev: `pnpm dev` for local server.

# Scripts and Automation

- `pnpm test`: unit tests
- `pnpm check`: lint + format
- `pnpm build`: production build
- `pnpm format:fix`: fix formatting

# Code Layout

- Source: `src/`
- Tests: colocated `*.test.ts`
- Config: root-level config files

# Avoid or Confirm Before Use

- Do not run `rm -rf` or destructive commands without explicit confirmation.
- Do not modify CI (GitHub Actions, etc.) unless explicitly requested.
```

### 5.4 常见误区、反例与验证

- **误区**：TOOLS 为空，开发工程师每次问「用什么跑测试」，可能混用 npm/yarn/pnpm。  
  **反例**：同一项目里它可能一次说 `npm test`、一次说 `yarn test`、一次反问你「你们用哪种包管理器？」

验证：在对话里问「在当前项目里，你默认用什么命令跑测试、跑构建？」看它是否引用 TOOLS 中的命令。

---

## 六、`USER.md`：让开发工程师真正「认识你」（可选）

### 6.1 作用

- 让开发工程师知道你倾向的**代码风格**、**验证习惯**、**交接偏好**。

### 6.2 开发工程师示例模板

```markdown
# 基本画像

- 你服务的用户是技术负责人或架构师，需要可落地的代码和任务单。

# 工作偏好

- 更偏好「小步提交」，每个 PR 聚焦单一功能。
- 希望实现前先给出受影响文件和大致改动范围。

# 决策偏好

- 遇到实现歧义时，先给 1–2 个方案对比，再推荐。
- 希望明确「为什么这样实现」，便于 Code Review。

# 沟通偏好

- 回答先给「结论/改动概要」，再给细节。
- 不喜欢冗长解释，希望每一段都和实现相关。
```

---

## 七、`HEARTBEAT.md`：周期任务（可选）

### 7.1 作用

- 定义开发工程师在**无人说话时**按周期执行的任务。
- 典型用途：技术债扫描、TODO 检查、简单代码规范审查。

### 7.2 开发工程师示例模板

```markdown
# Heartbeat Overview

- Weekly: Scan for TODO/FIXME in high-traffic modules.
- Weekly: Flag obvious technical debt (duplication, missing tests).

# Example: Tech Debt Scan

- Trigger: Weekly.
- Actions:
  1. Scan src/ for TODO, FIXME, XXX.
  2. Correlate with recent commits; flag stale or high-impact items.
  3. Output: list with file, line, suggestion.
- Output format:
  - Title: Weekly Tech Debt Scan
  - Include: file, line, tag, suggested action.
```

---

## 八、`BOOTSTRAP.md`：入职任务，用完就删

### 8.1 作用

- 用于「第一次启动开发工程师」的初始化任务。
- 完成后迁移有用内容到 SOUL/AGENTS，清空或删除 BOOTSTRAP。

### 8.3 首次对接：收到「Who am I? Who are you?」怎么办

若第一次对话时它仍问「Who am I? Who are you?」：

1. **简短回复**：「你已经是 Dev 开发工程师，角色和流程在 SOUL.md 和 AGENTS.md 里。按新配置工作，BOOTSTRAP 可删。」
2. **开新会话**：新 session 会加载更新后的文件。

---

## 九、15 分钟 / 60 分钟：两套最短路径清单

### 9.1 15 分钟快速版

1. 在 workspace 里创建 `SOUL.md`、`AGENTS.md`（Role + Scope + Default Task Flow + Cursor 边界）。
2. 在 Telegram 里发两条消息验证：
   - 「用 5 条以内的要点自我介绍一下你是谁、负责什么、不负责什么。」
   - 「接到一个实现任务时，你会按什么步骤工作？什么时候交给 Cursor？」
3. 对比回答，做一次小修改。

### 9.2 60 分钟深度版

1. 完整补全 SOUL.md 五小节。
2. 在 AGENTS.md 里写好 Cursor 分工、Handoff。
3. 写 TOOLS.md（pnpm 命令、代码布局、禁止操作）。
4. 创建 USER.md。
5. 如需要，设计 1 个心跳任务写入 HEARTBEAT.md。

### 9.3 通过对话验证配置是否生效

配置写完后，建议通过标准化验证对话确认各文件已正确加载。按顺序发送以下消息，观察开发工程师的回答是否符合预期。

| 序号 | 验证目标 | 建议发送的消息 | 预期表现 |
|------|----------|----------------|----------|
| 1 | SOUL | 「用 5 条以内的要点，自我介绍一下你是谁、负责什么、不负责什么。」 | 角色、边界与 SOUL 一致 |
| 2 | AGENTS 流程 | 「接到一个实现任务时，你会按什么步骤工作？什么时候交给 Cursor？」 | 与 AGENTS 一致 |
| 3 | AGENTS 输出 | 「实现一个简单的用户登录 API。」 | 小范围给代码/补丁；大范围给任务单 |
| 4 | TOOLS | 「当前项目用什么命令跑测试、跑构建？」 | 能引用 TOOLS 中的 pnpm 命令 |
| 5 | 文件加载快照 | 「请根据加载到的 SOUL/AGENTS/TOOLS 等，总结你的职责和默认工作方式。」 | 能逐文件复述要点 |

**执行建议**：首次配置后完整跑一遍 1～5；改完任一文件后重跑相关验证项；怀疑未生效时优先发第 5 条，检查其「自我总结」是否包含最新修改。若 workspace 或 session 有变更，可开新会话确保加载最新文件。

### 9.4 配置完成后：让新配置生效

在发验证消息之前，建议先完成以下三步，确保新配置被正确加载：

1. **开新会话（最重要）**  
   Bootstrap 是按会话缓存的。如果是旧会话，可能还在用旧的 SOUL/AGENTS。  
   在 Telegram 里新建一个与该角色对应 Bot 的对话（或删除当前对话再重新发起），再发一条消息。

2. **重启 Gateway**  
   重启会清掉 bootstrap 缓存，新消息会重新加载 workspace 文件。  
   通过菜单栏退出并重新打开 OpenClaw，或执行 `openclaw daemon restart`。

3. **确认路由**  
   执行 `openclaw agents list --bindings`，确认存在 `channel: telegram, accountId: dev` → `agentId: dev` 的绑定。确保对话时使用的是该角色对应的 Bot。

---

## 十、让对话里的规则「落进文件」：持久化指令模板

- **更新 SOUL.md**：「请根据我们关于你角色和沟通风格的讨论，总结成 SOUL.md 建议内容，**用英文写**。」
- **更新 AGENTS.md**：「请把默认实现流程和 Cursor 分工整理成 AGENTS.md，**用英文写**。」
- **补充 TOOLS.md**：「请根据项目中的 pnpm 脚本和代码布局，整理 TOOLS.md 建议内容，**用英文写**。」

---

## 十一、会话生效 vs 文件生效：常见排障

- **规则被遗忘**：是否已写入 SOUL/AGENTS？对话是否过长？
- **改文件未生效**：是否新开会话？
- **心跳打扰**：减少频率或精简输出。

---

## 十二、和现有文档如何配合使用？

本篇文档只解决一个核心问题：

> **「我已经有了一个能说话的 dev agent，怎么把它调成真正适合我团队的长期搭档？」**

- **创建与绑定 agent**：[OpenClaw Agent 手动配置实战指南](/lab/setup/agent-setup-guide)（命令行创建、channel 绑定、模型配置）
- **架构师定制参考**：[架构师 Agent 工作区引导文件](/lab/setup/workspace/architect)（六文件结构、语言建议、验证清单）
- **团队整体角色分工**：[OpenClaw AI Dev Team 架构](/lab/architecture/ai-dev-team)（Dev Agent 与 Cursor 分工、workspace 约定、触发方式）

---

## 十三、维护节奏

| 阶段 | 建议动作 |
|------|----------|
| **首次配置** | 按 15/60 分钟清单走，发 9.3 节验证消息 |
| **每周迭代** | 将反复强调的规则写进对应文件，核对 TOOLS 与项目命令一致 |
| **重大变更** | 换模型、改 Cursor 分工时，更新 AGENTS 中的 Handoff 与边界 |
