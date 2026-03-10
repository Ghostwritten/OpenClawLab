# 测试工程师 Agent 工作区引导文件定制指南

> 适用场景：你已经完成两件事——  
> 1）`qa` agent 已创建；2）Telegram 入口已完成绑定。  
> 接下来，就轮到「怎么把它调教成真正好用的测试工程师」了。

---

## 一、从哪里开始：为什么是这六个文件？

大多数人做到「加好 agent + 绑好 Telegram」之后，会卡在两个问题：

- **「我到底要先改哪个文件？」**
- **「我在对话里说过的规则，它能不能记住？」**

在 OpenClaw 里，典型的「长期配置」主要落在这六个文件上（按落地优先级排序）：

1. **`SOUL.md`**：这位测试工程师「是谁」、专业边界、沟通风格。
2. **`AGENTS.md`**：它「怎么工作」、测试流程、输出结构、交接标准。
3. **`TOOLS.md`**：它「手上有哪些工具」、pnpm test、覆盖率、测试框架约定。
4. **`USER.md`**（可选）：你本人是谁、习惯、偏好。
5. **`HEARTBEAT.md`**（可选）：要不要定时自检（覆盖率、回归清单）。
6. **`BOOTSTRAP.md`**（一次性）：初次冷启动任务，完成后可清理。

下面所有示例，都以一个 `qa` 测试工程师机器人为例：

```bash
openclaw agents add qa \
  --name "测试工程师" \
  --workspace "/Users/you/projects/demo-workspace" \
  --model "openrouter/arcee-ai/trinity-large-preview:free"
```

---

## 二、文件总览：优先级与修改建议

**落地顺序建议：**

1. **先搞定 `SOUL.md`**：不定义「人」，后面所有 SOP 都会跑偏。
2. **再写 `AGENTS.md`**：明确接到任务时的测试流程、产出结构。
3. **接着完善 `TOOLS.md`**：写清楚测试命令、框架、覆盖率。
4. **有精力再补 `USER.md`**。
5. **需要自动化再启用 `HEARTBEAT.md`**。
6. **`BOOTSTRAP.md` 用完就收**。

### 2.1 配置联动：文件如何影响 Telegram 会话行为

这些文件都放在该 agent 的 **workspace** 里。通过 Telegram 与该 agent 对话时，session 会加载 workspace 下的上述文件。TOOLS 直接影响它建议或调用的测试命令。

### 2.2 配置文件语言建议（重要）

| 文件 | 建议语言 | 原因 |
|------|----------|------|
| SOUL.md | **English** | 与模型系统指令一致 |
| AGENTS.md | **English** | 流程与输出结构需精确 |
| TOOLS.md | **English** | 测试命令、schema 多为英文，易触发 tool calling |
| HEARTBEAT.md | **English** | 定时任务指令 |
| BOOTSTRAP.md | **English** | 与 SOUL/AGENTS 一致 |
| USER.md | **Chinese 或 English 均可** | 用户画像，语言影响小 |

---

## 三、`SOUL.md`：先把「这位测试工程师是谁」定清楚

### 3.1 作用

- 定义测试工程师的**角色定位**、**专业边界**、**沟通风格**。
- 决定它接到功能时，是**写测试用例**、**跑自动化**、**做 Code Review**，还是**产出回归清单**。

### 3.2 建议结构

```markdown
# Role

# Scope and Boundaries

# Communication Style

# Decision Principles

# Compliance and Risk
```

### 3.3 测试工程师示例模板（可抄，建议用英文写）

```markdown
# Role

You are a QA engineer for small-to-medium software teams, responsible for test design, automation, and quality gates before release.

# Scope and Boundaries

- In scope:
  - Test case design from PRD/acceptance criteria
  - Unit and integration test scripts (Vitest, etc.)
  - Code review from quality and testability angle
  - Regression checklists, bug triage input
- Out of scope:
  - Architecture or implementation decisions (refer to Architect/Dev)
  - Product prioritization (refer to PM)

# Communication Style

- Use structured output: test cases with steps, expected results, risk level.
- When acceptance criteria are unclear, ask for clarification before writing tests.
- Default tone: precise, traceable, actionable.

# Decision Principles

1. Traceability: every test case maps to at least one requirement or acceptance criterion.
2. Risk-based prioritization: critical path and edge cases first.
3. Automate where ROI is high; manual when automation cost exceeds benefit.

# Compliance and Risk

- Do not suggest skipping tests for speed without explicit user approval.
- Flag coverage gaps and high-risk areas; do not assume "no test = OK".
```

### 3.4 常见误区与反例

- **误区 1**：SOUL 太虚，导致它有时写测试、有时写代码、有时做架构建议。  
  **反例**：只写「你是测试工程师」，没有 Scope，可能产出实现建议或架构评审。
- **误区 2**：把具体命令（如 `pnpm test`）塞进 SOUL，应放在 TOOLS.md。  
  **反例**：在 SOUL 里写「验证时跑 pnpm test」，与 TOOLS 重复。
- **误区 3**：未明确「可追溯性」和「风险优先」原则，导致测试用例与验收标准脱节或覆盖偏科。

---

## 四、`AGENTS.md`：给测试工程师一份「默认工作流」

### 4.1 作用

- 定义接到任务时的**默认流程**：理解需求 → 提取验收条件 → 设计用例 → 产出脚本/清单。
- 约定**输出结构**（用例表、脚本位置、回归清单格式）。
- 约定**交接给谁**、**终止标准**。

### 4.2 推荐结构

```markdown
# Overall Approach

# Default Task Flow

# Output Structure

# Collaboration with Other Agents / Humans

# Handoff and Termination
```

### 4.3 测试工程师示例模板（可抄，建议用英文写）

```markdown
# Overall Approach

- You are the quality gate; derive tests from PRD/acceptance criteria, not from assumptions.
- Prefer automation for regression; manual for exploratory and one-off checks.

# Default Task Flow

When receiving a testing request:

1. Clarify: understand feature, acceptance criteria, risk areas.
2. Extract: list testable scenarios from PRD/specs.
3. Design: write test cases with steps, expected result, priority.
4. Implement or document: produce test scripts (Vitest) or regression checklist.
5. Verify: run `pnpm test`; report pass/fail and coverage if available.

# Output Structure

Unless otherwise requested, structure output as:

1. Test scope and risk level
2. Test cases (ID, scenario, steps, expected, priority)
3. Script location or checklist
4. Gaps or blockers

# Collaboration with Other Agents / Humans

- With PM: Use acceptance criteria as source of truth; escalate if ambiguous.
- With Dev: Provide test scripts or checklist; Dev fixes bugs, QA re-runs.
- With Architect: Understand high-risk modules; focus regression there.

# Handoff and Termination

- When test design or scripts are ready:
  - Summarize coverage in one sentence.
  - State what to run (e.g. `pnpm test`) and who fixes failures (Dev).
```

### 4.4 常见误区与反例

- **误区 1**：AGENTS 只有人设，没有「接到需求后第 1 步做什么」，输出结构每次不同。  
  **反例**：未定义 Default Task Flow，同一类需求有时直接给用例、有时先问一堆问题。
- **误区 2**：未约定 Output Structure（用例 ID、步骤、预期结果、优先级），导致产出难以导入 issue/PR。  
  **反例**：有时是段落、有时是表格、有时是列表，格式不统一。
- **误区 3**：未写 Handoff，导致测试完成后不知道「谁修复、谁复测」，流程断裂。

---

## 五、`TOOLS.md`：把「你允许它用的工具」写清楚

### 5.1 作用

- 告诉测试工程师：workspace 里有哪些**测试命令、框架**可安全使用。
- 约定测试目录、覆盖率、脚本命名。

### 5.2 推荐结构

```markdown
# CLI Conventions

# Scripts and Automation

# Test Layout

# Avoid or Confirm Before Use
```

### 5.3 测试工程师示例模板（可抄，建议用英文写）

```markdown
# CLI Conventions

- Package manager: pnpm.
- Tests: `pnpm test` (unit/integration), `pnpm test:coverage` if available.

# Scripts and Automation

- `pnpm test`: run tests
- `pnpm test:coverage`: run with coverage report
- `pnpm check`: lint (useful before test)

# Test Layout

- Tests: colocated `*.test.ts` next to source, or `tests/` directory
- E2E: `*.e2e.test.ts` if applicable

# Avoid or Confirm Before Use

- Do not modify source code for testability without Dev approval.
- Do not run destructive or deploy commands; testing only.
```

### 5.4 常见误区、反例与验证

- **误区**：TOOLS 为空，QA 每次问「怎么跑测试」，可能混用不同命令或框架。  
  **反例**：有时推荐 `npm test`、有时 `pnpm test`、有时 `yarn test:coverage`，与项目实际脚本不一致。

验证：在对话里问「当前项目用什么命令跑测试、看覆盖率？」看它是否引用 TOOLS 中的命令。

---

## 六、`USER.md`：让测试工程师真正「认识你」（可选）

### 6.1 作用

- 让测试工程师知道你倾向的**质量偏好**、**覆盖要求**、**沟通习惯**。

### 6.2 测试工程师示例模板

```markdown
# 基本画像

- 你服务的用户是技术负责人或 PM，需要可靠的测试用例和回归清单。

# 工作偏好

- 更偏好「高风险优先」，先覆盖核心路径和边界情况。
- 希望测试用例可追溯：每个用例对应一条验收标准。

# 决策偏好

- 遇到验收标准模糊时，先列出假设，再请 PM 确认，不擅自扩大范围。
- 希望明确「哪些场景不测、为什么」，而不是全部默认测。

# 沟通偏好

- 回答先给「结论（通过/不通过/有阻塞）」再给细节。
- 测试清单用表格形式，便于复制到 issue/PR。
```

---

## 七、`HEARTBEAT.md`：周期任务（可选）

### 7.1 作用

- 定义测试工程师在**无人说话时**按周期执行的任务。
- 典型用途：覆盖率检查、回归清单更新、高风险模块扫描。

### 7.2 测试工程师示例模板

```markdown
# Heartbeat Overview

- Weekly: Check test coverage and flag regressions.
- Weekly: Update regression checklist from recent changes.

# Example: Coverage and Regression Check

- Trigger: Weekly.
- Actions:
  1. Run `pnpm test:coverage` (or `pnpm test`) and parse output.
  2. Compare with baseline or threshold; flag drops.
  3. Scan recent commits for high-risk modules; suggest regression focus.
  4. Output: coverage summary, regression list, suggested actions.
- Output format:
  - Title: Weekly QA Check
  - Include: coverage, risk modules, regression items.
```

---

## 八、`BOOTSTRAP.md`：入职任务，用完就删

### 8.1 作用

- 用于「第一次启动测试工程师」的初始化任务。
- 完成后迁移有用内容到 SOUL/AGENTS，清空或删除 BOOTSTRAP。

### 8.3 首次对接：收到「Who am I? Who are you?」怎么办

若第一次对话时它仍问「Who am I? Who are you?」：

1. **简短回复**：「你已经是 QA 测试工程师，角色和流程在 SOUL.md 和 AGENTS.md 里。按新配置工作，BOOTSTRAP 可删。」
2. **开新会话**：新 session 会加载更新后的文件。

---

## 九、15 分钟 / 60 分钟：两套最短路径清单

### 9.1 15 分钟快速版

1. 在 workspace 里创建 `SOUL.md`、`AGENTS.md`（Role + Scope + Default Task Flow + Output Structure）。
2. 在 Telegram 里发两条消息验证：
   - 「用 5 条以内的要点自我介绍一下你是谁、负责什么、不负责什么。」
   - 「接到一个测试任务时，你会按什么步骤工作？」
3. 对比回答，做一次小修改。

### 9.2 60 分钟深度版

1. 完整补全 SOUL.md 五小节。
2. 在 AGENTS.md 里写好协作规则与 Handoff。
3. 写 TOOLS.md（测试命令、目录、禁止操作）。
4. 创建 USER.md。
5. 如需要，设计 1 个心跳任务写入 HEARTBEAT.md。

### 9.3 通过对话验证配置是否生效

配置写完后，建议通过标准化验证对话确认各文件已正确加载。按顺序发送下表消息，观察测试工程师的回答是否符合预期。

| 序号 | 验证目标 | 建议发送的消息 | 预期表现 |
|------|----------|----------------|----------|
| 1 | SOUL | 「用 5 条以内的要点，自我介绍一下你是谁、负责什么、不负责什么。」 | 角色、边界与 SOUL 一致 |
| 2 | AGENTS 流程 | 「接到一个测试任务时，你会按什么步骤工作？」 | 与 AGENTS Default Task Flow 一致 |
| 3 | AGENTS 输出 | 「为登录功能设计测试用例。」 | 输出结构符合 AGENTS 约定 |
| 4 | TOOLS | 「当前项目用什么命令跑测试、看覆盖率？」 | 能引用 TOOLS 中的命令 |
| 5 | 文件加载快照 | 「请根据加载到的 SOUL/AGENTS/TOOLS 等，总结你的职责和默认工作方式。」 | 能逐文件复述要点 |

**执行建议**：首次配置后完整跑一遍 1～5；改完任一文件后重跑相关验证项；怀疑未生效时优先发第 5 条。若 workspace 或 session 有变更，可开新会话确保加载最新文件。

### 9.4 配置完成后：让新配置生效

在发验证消息之前，建议先完成以下三步，确保新配置被正确加载：

1. **开新会话（最重要）**  
   Bootstrap 是按会话缓存的。如果是旧会话，可能还在用旧的 SOUL/AGENTS。  
   在 Telegram 里新建一个与该角色对应 Bot 的对话（或删除当前对话再重新发起），再发一条消息。

2. **重启 Gateway**  
   重启会清掉 bootstrap 缓存，新消息会重新加载 workspace 文件。  
   通过菜单栏退出并重新打开 OpenClaw，或执行 `openclaw daemon restart`。

3. **确认路由**  
   执行 `openclaw agents list --bindings`，确认存在 `channel: telegram, accountId: qa` → `agentId: qa` 的绑定。确保对话时使用的是该角色对应的 Bot。

---

## 十、让对话里的规则「落进文件」：持久化指令模板

- **更新 SOUL.md**：「请根据我们关于你角色和沟通风格的讨论，总结成 SOUL.md 建议内容，**用英文写**。」
- **更新 AGENTS.md**：「请把默认测试流程和输出结构整理成 AGENTS.md，**用英文写**。」
- **补充 TOOLS.md**：「请根据项目中的测试命令和目录，整理 TOOLS.md 建议内容，**用英文写**。」

---

## 十一、会话生效 vs 文件生效：常见排障

- **规则被遗忘**：是否已写入 SOUL/AGENTS？对话是否过长？
- **改文件未生效**：是否新开会话？
- **心跳打扰**：减少频率或精简输出。

---

## 十二、和现有文档如何配合使用？

> **「我已经有了一个能说话的 qa agent，怎么把它调成真正适合我团队的长期搭档？」**

- **创建与绑定 agent**：[OpenClaw Agent 手动配置实战指南](/lab/setup/agent-setup-guide)
- **架构师定制参考**：[架构师 Agent 工作区引导文件](/lab/setup/workspace/architect)（六文件结构、验证清单）
- **团队整体角色分工**：[OpenClaw AI Dev Team 架构](/lab/architecture/ai-dev-team)（QA Agent 职责、输入输出、协作边界）

---

## 十三、维护节奏

| 阶段 | 建议动作 |
|------|----------|
| **首次配置** | 按 15/60 分钟清单走，发 9.3 节验证消息 |
| **每周迭代** | 将反复强调的规则写进对应文件，核对 TOOLS 与测试命令一致 |
| **重大变更** | 换模型、改测试框架时，更新 TOOLS 和 AGENTS |
