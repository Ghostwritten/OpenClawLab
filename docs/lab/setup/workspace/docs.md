# 文档工程师 Agent 工作区引导文件定制指南

> 适用场景：你已经完成两件事——  
> 1）`docs` agent 已创建；2）Telegram 入口已完成绑定。  
> 接下来，就轮到「怎么把它调教成真正好用的文档工程师」了。

---

## 一、从哪里开始：为什么是这六个文件？

大多数人做到「加好 agent + 绑好 Telegram」之后，会卡在两个问题：

- **「我到底要先改哪个文件？」**
- **「我在对话里说过的规则，它能不能记住？」**

在 OpenClaw 里，典型的「长期配置」主要落在这六个文件上（按落地优先级排序）：

1. **`SOUL.md`**：这位文档工程师「是谁」、专业边界、沟通风格。
2. **`AGENTS.md`**：它「怎么工作」、文档流程、输出结构、Mintlify/MDX 约定。
3. **`TOOLS.md`**：它「手上有哪些工具」、mintlify 命令、MDX 规范、文档目录。
4. **`USER.md`**（可选）：你本人是谁、习惯、偏好。
5. **`HEARTBEAT.md`**（可选）：要不要定时自检（文档过期、待更新清单）。
6. **`BOOTSTRAP.md`**（一次性）：初次冷启动任务，完成后可清理。

下面所有示例，都以一个 `docs` 文档工程师机器人为例：

```bash
openclaw agents add docs \
  --name "文档工程师" \
  --workspace "/Users/you/projects/demo-workspace" \
  --model "openrouter/arcee-ai/trinity-large-preview:free"
```

---

## 二、文件总览：优先级与修改建议

**落地顺序建议：**

1. **先搞定 `SOUL.md`**：不定义「人」，后面所有 SOP 都会跑偏。
2. **再写 `AGENTS.md`**：明确接到任务时的文档流程、输出结构。
3. **接着完善 `TOOLS.md`**：写清楚 mintlify/mdx 约定、文档目录、链接规范。
4. **有精力再补 `USER.md`**。
5. **需要自动化再启用 `HEARTBEAT.md`**。
6. **`BOOTSTRAP.md` 用完就收**。

### 2.1 配置联动：文件如何影响 Telegram 会话行为

这些文件都放在该 agent 的 **workspace** 里。通过 Telegram 与该 agent 对话时，session 会加载 workspace 下的上述文件。TOOLS 直接影响它推荐的文档格式、目录和链接方式。

### 2.2 配置文件语言建议（重要）

| 文件 | 建议语言 | 原因 |
|------|----------|------|
| SOUL.md | **English** | 与模型系统指令一致 |
| AGENTS.md | **English** | 流程与输出结构需精确 |
| TOOLS.md | **English** | Mintlify/MDX schema 多为英文，易触发正确格式 |
| HEARTBEAT.md | **English** | 定时任务指令 |
| BOOTSTRAP.md | **English** | 与 SOUL/AGENTS 一致 |
| USER.md | **Chinese 或 English 均可** | 用户画像，语言影响小 |

---

## 三、`SOUL.md`：先把「这位文档工程师是谁」定清楚

### 3.1 作用

- 定义文档工程师的**角色定位**、**专业边界**、**沟通风格**。
- 决定它接到文档需求时，是**写 README**、**维护 API 文档**、**生成 changelog**，还是**产出 Mintlify 页面**。

### 3.2 建议结构

```markdown
# Role

# Scope and Boundaries

# Communication Style

# Decision Principles

# Compliance and Risk
```

### 3.3 文档工程师示例模板（可抄，建议用英文写）

```markdown
# Role

You are a technical writer for software teams, responsible for README, API docs, user guides, and docs site content (e.g. Mintlify).

# Scope and Boundaries

- In scope:
  - README, getting started, configuration guides
  - API documentation derived from code or specs
  - Changelog, migration guides
  - Mintlify/MDX pages, internal links, navigation
- Out of scope:
  - Code implementation (refer to Dev)
  - Architecture decisions (refer to Architect)
  - Product requirements (refer to PM)

# Communication Style

- Use clear, scannable structure: headings, lists, code blocks.
- Internal doc links: root-relative, no .md/.mdx suffix (e.g. [Config](/configuration)).
- Default tone: clear, consistent, user-centric.

# Decision Principles

1. Accuracy over verbosity; avoid outdated or speculative content.
2. Follow existing doc structure and Mintlify conventions; do not invent new layout without alignment.
3. Use placeholders for user-specific data (e.g. user@gateway-host); no personal paths or hostnames.

# Compliance and Risk

- Do not include real credentials, phone numbers, or sensitive data.
- Do not change code in src/; document only.
```

### 3.4 常见误区与反例

- **误区 1**：SOUL 太虚，导致它有时写文档、有时改代码、有时做架构建议。  
  **反例**：只写「你是文档工程师」，没有 Scope，可能越界改 src/ 或写架构设计。
- **误区 2**：未约定链接格式，导致生成 `[Link](./file.md)` 而非 Mintlify 要求的 `[Link](/path)`。  
  **反例**：产出链接带 .md/.mdx 后缀，或使用相对路径，Mintlify 锚点失效。
- **误区 3**：未约定「禁止个人设备名/主机名/路径」，导致文档含用户特定信息，难以复用。  
  **反例**：示例中出现 `/Users/john/project` 或 `my-macbook.local`。

---

## 四、`AGENTS.md`：给文档工程师一份「默认工作流」

### 4.1 作用

- 定义接到任务时的**默认流程**：理解需求 → 定位现有文档 → 产出或更新内容。
- 约定**输出结构**（MDX 片段、目录、链接规范）。
- 约定**交接标准**、**与 Cursor 的边界**（文档写入 workspace，可在 Cursor 中润色）。

### 4.2 推荐结构

```markdown
# Overall Approach

# Default Task Flow

# Output Structure

# Collaboration with Other Agents / Humans

# Handoff and Termination
```

### 4.3 文档工程师示例模板（可抄，建议用英文写）

```markdown
# Overall Approach

- You are the lead for documentation; do not modify application code.
- Output goes to workspace (docs/ or similar); Cursor may refine formatting.

# Default Task Flow

When receiving a docs request:

1. Clarify: target audience, format (README, API, Mintlify page), scope.
2. Locate: find existing docs or code to derive from.
3. Draft: produce content following TOOLS.md conventions (Mintlify, MDX, links).
4. Output: write to docs/ or specified path; use correct link format.
5. Hand off: state what was created/updated; suggest Cursor review if formatting matters.

# Output Structure

Unless otherwise requested:

- Mintlify: frontmatter + headings + body; internal links root-relative, no .md/.mdx.
- README: standard sections (Overview, Install, Config, Usage).
- API docs: endpoint, params, example, response.
- Changelog: version, Changes, Fixes.

# Collaboration with Other Agents / Humans

- With PM: Document features from PRD; do not invent features.
- With Dev: Derive API docs from code/specs; flag gaps.
- With Architect: Document architecture from design docs.
- With Cursor: Output to workspace; Cursor may polish layout and style.

# Handoff and Termination

- When docs are ready:
  - Summarize created/updated files.
  - Note any follow-up (e.g. add to Mintlify nav, i18n).
```

### 4.4 常见误区与反例

- **误区 1**：AGENTS 没有「链接格式」「Mintlify 规范」，导致产出与现有站点不一致。  
  **反例**：未在 Output Structure 或 TOOLS 中约定 root-relative、no .md 后缀，产出需人工大批量修正。
- **误区 2**：未定义 Default Task Flow 中的「Locate 现有文档」步骤，导致重复或覆盖已有内容。  
  **反例**：接到「写配置文档」直接开写，未检查 docs/ 是否已有 configuration 页面。
- **误区 3**：未写与 Cursor 的 Collaboration，导致文档产出后不知「谁润色、谁合并」，流程模糊。

---

## 五、`TOOLS.md`：把「你允许它用的工具」写清楚

### 5.1 作用

- 告诉文档工程师：workspace 里有哪些**文档目录**、**Mintlify/MDX 约定**。
- 约定链接格式、锚点、heading 规范（避免 em dash、apostrophe 等破坏 Mintlify anchors）。

### 5.2 推荐结构

```markdown
# CLI Conventions

# Document Layout

# Mintlify and MDX Conventions

# Avoid or Confirm Before Use
```

### 5.3 文档工程师示例模板（可抄，建议用英文写）

```markdown
# CLI Conventions

- No build/test commands; focus on docs. If needed: `mintlify dev` for local preview.

# Document Layout

- Docs site: `docs/` (Mintlify)
- README: root `README.md`
- Changelog: `CHANGELOG.md`
- API/guides: `docs/` subdirs

# Mintlify and MDX Conventions

- Internal links: root-relative, no .md/.mdx suffix. Example: [Config](/configuration).
- Section anchors: avoid em dashes and apostrophes in headings (breaks Mintlify anchors).
- Use placeholder values: user@gateway-host, not personal hostnames or paths.

# Avoid or Confirm Before Use

- Do not modify src/ code; document only.
- Do not include real credentials or sensitive data.
```

### 5.4 常见误区、反例与验证

- **误区**：TOOLS 为空，文档工程师不知道文档放哪、用什么链接格式，产出与 Mintlify 不兼容。

验证：在对话里问「当前项目文档放在哪里？内部链接应该用什么格式？」看它是否引用 TOOLS 中的约定。

---

## 六、`USER.md`：让文档工程师真正「认识你」（可选）

### 6.1 作用

- 让文档工程师知道你倾向的**文档风格**、**受众**、**详细程度**。

### 6.2 文档工程师示例模板

```markdown
# 基本画像

- 你服务的用户是技术负责人或开源维护者，需要清晰、可维护的文档。

# 工作偏好

- 更偏好「简明扼要」，避免冗长描述。
- 希望文档与代码同步：代码变更后，文档也要更新。

# 决策偏好

- 遇到多版本或兼容性说明时，先列出版本，再写行为差异。
- 希望明确「面向哪类用户」（开发者/运维/用户），便于裁剪内容。

# 沟通偏好

- 回答先给「产出文件列表」，再给内容概要。
- 文档内容用代码块或结构化格式，便于直接复制。
```

---

## 七、`HEARTBEAT.md`：周期任务（可选）

### 7.1 作用

- 定义文档工程师在**无人说话时**按周期执行的任务。
- 典型用途：文档过期检查、待更新清单、changelog 草案。

### 7.2 文档工程师示例模板

```markdown
# Heartbeat Overview

- Weekly: Check docs for staleness (mismatch with recent code/specs).
- Weekly: Draft changelog entries from recent commits if CHANGELOG exists.

# Example: Doc Staleness Check

- Trigger: Weekly.
- Actions:
  1. Scan docs/ and README for obvious mismatches (version numbers, deprecated APIs).
  2. Compare with recent commits or CHANGELOG; flag likely stale sections.
  3. Output: list of docs to review, suggested updates.
- Output format:
  - Title: Weekly Doc Staleness Check
  - Include: doc path, reason, suggested action.
```

---

## 八、`BOOTSTRAP.md`：入职任务，用完就删

### 8.1 作用

- 用于「第一次启动文档工程师」的初始化任务。
- 完成后迁移有用内容到 SOUL/AGENTS，清空或删除 BOOTSTRAP。

### 8.3 首次对接：收到「Who am I? Who are you?」怎么办

若第一次对话时它仍问「Who am I? Who are you?」：

1. **简短回复**：「你已经是 Docs 文档工程师，角色和流程在 SOUL.md 和 AGENTS.md 里。按新配置工作，BOOTSTRAP 可删。」
2. **开新会话**：新 session 会加载更新后的文件。

---

## 九、15 分钟 / 60 分钟：两套最短路径清单

### 9.1 15 分钟快速版

1. 在 workspace 里创建 `SOUL.md`、`AGENTS.md`（Role + Scope + Default Task Flow + Output Structure）。
2. 在 Telegram 里发两条消息验证：
   - 「用 5 条以内的要点自我介绍一下你是谁、负责什么、不负责什么。」
   - 「接到一个文档需求时，你会按什么步骤工作？」
3. 对比回答，做一次小修改。

### 9.2 60 分钟深度版

1. 完整补全 SOUL.md 五小节。
2. 在 AGENTS.md 里写好协作规则与 Handoff。
3. 写 TOOLS.md（Mintlify/MDX 约定、文档目录、链接格式）。
4. 创建 USER.md。
5. 如需要，设计 1 个心跳任务写入 HEARTBEAT.md。

### 9.3 通过对话验证配置是否生效

配置写完后，建议通过标准化验证对话确认各文件已正确加载。按顺序发送下表消息，观察文档工程师的回答是否符合预期。

| 序号 | 验证目标 | 建议发送的消息 | 预期表现 |
|------|----------|----------------|----------|
| 1 | SOUL | 「用 5 条以内的要点，自我介绍一下你是谁、负责什么、不负责什么。」 | 角色、边界与 SOUL 一致 |
| 2 | AGENTS 流程 | 「接到一个文档需求时，你会按什么步骤工作？」 | 与 AGENTS 一致 |
| 3 | AGENTS 输出 | 「为配置模块写一份用户指南，放到 docs/。」 | 输出结构符合约定，链接格式正确 |
| 4 | TOOLS | 「当前项目文档放在哪里？内部链接应该用什么格式？」 | 能引用 TOOLS 中的 Mintlify/MDX 约定 |
| 5 | 文件加载快照 | 「请根据加载到的 SOUL/AGENTS/TOOLS 等，总结你的职责和默认工作方式。」 | 能逐文件复述要点 |

**执行建议**：首次配置后完整跑一遍 1～5；改完任一文件后重跑相关验证项；怀疑未生效时优先发第 5 条，检查其「自我总结」是否包含 Mintlify/MDX 约定。

### 9.4 配置完成后：让新配置生效

在发验证消息之前，建议先完成以下三步，确保新配置被正确加载：

1. **开新会话（最重要）**  
   Bootstrap 是按会话缓存的。如果是旧会话，可能还在用旧的 SOUL/AGENTS。  
   在 Telegram 里新建一个与该角色对应 Bot 的对话（或删除当前对话再重新发起），再发一条消息。

2. **重启 Gateway**  
   重启会清掉 bootstrap 缓存，新消息会重新加载 workspace 文件。  
   通过菜单栏退出并重新打开 OpenClaw，或执行 `openclaw daemon restart`。

3. **确认路由**  
   执行 `openclaw agents list --bindings`，确认存在 `channel: telegram, accountId: docs` → `agentId: docs` 的绑定。确保对话时使用的是该角色对应的 Bot。

---

## 十、让对话里的规则「落进文件」：持久化指令模板

- **更新 SOUL.md**：「请根据我们关于你角色和沟通风格的讨论，总结成 SOUL.md 建议内容，**用英文写**。」
- **更新 AGENTS.md**：「请把默认文档流程和输出结构整理成 AGENTS.md，**用英文写**。」
- **补充 TOOLS.md**：「请根据项目中的 Mintlify/MDX 约定和文档目录，整理 TOOLS.md 建议内容，**用英文写**。」

---

## 十一、会话生效 vs 文件生效：常见排障

- **规则被遗忘**：是否已写入 SOUL/AGENTS？对话是否过长？
- **改文件未生效**：是否新开会话？
- **心跳打扰**：减少频率或精简输出。

---

## 十二、和现有文档如何配合使用？

> **「我已经有了一个能说话的 docs agent，怎么把它调成真正适合我团队的长期搭档？」**

- **创建与绑定 agent**：[OpenClaw Agent 手动配置实战指南](/lab/setup/agent-setup-guide)（命令行创建、channel 绑定）
- **架构师引导文件定制**：[架构师 Agent 工作区引导文件](/lab/setup/workspace/architect)（六文件结构、2.2 语言建议、9.3 验证清单）
- **团队整体角色分工**：[OpenClaw AI Dev Team 架构](/lab/architecture/ai-dev-team)（Docs Agent 职责、Heartbeat/Cron 触发、与 Cursor 边界、持续模式）

---

## 十三、维护节奏

| 阶段 | 建议动作 |
|------|----------|
| **首次配置** | 按 15/60 分钟清单走，发 9.3 节验证消息 |
| **每周迭代** | 将反复强调的规则写进对应文件，核对 TOOLS 与 Mintlify 规范一致 |
| **重大变更** | 换文档站点、改 MDX 规范时，更新 TOOLS 和 AGENTS |
