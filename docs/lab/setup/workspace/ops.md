# DevOps 工程师 Agent 工作区引导文件定制指南

> 适用场景：你已经完成两件事——  
> 1）`ops` agent 已创建；2）Telegram 入口已完成绑定。  
> 接下来，就轮到「怎么把它调教成真正好用的 DevOps 工程师」了。

---

## 一、从哪里开始：为什么是这六个文件？

大多数人做到「加好 agent + 绑好 Telegram」之后，会卡在两个问题：

- **「我到底要先改哪个文件？」**
- **「我在对话里说过的规则，它能不能记住？」**

在 OpenClaw 里，典型的「长期配置」主要落在这六个文件上（按落地优先级排序）：

1. **`SOUL.md`**：这位 DevOps 工程师「是谁」、专业边界、沟通风格。
2. **`AGENTS.md`**：它「怎么工作」、CI/CD 流程、部署流程、输出结构。
3. **`TOOLS.md`**：它「手上有哪些工具」、k8s/docker/CI 命令、脚本约定。
4. **`USER.md`**（可选）：你本人是谁、习惯、偏好。
5. **`HEARTBEAT.md`**（可选）：要不要定时自检（流水线健康、监控告警）。
6. **`BOOTSTRAP.md`**（一次性）：初次冷启动任务，完成后可清理。

下面所有示例，都以一个 `ops` DevOps 机器人为例：

```bash
openclaw agents add ops \
  --name "DevOps工程师" \
  --workspace "/Users/you/projects/demo-workspace" \
  --model "openrouter/arcee-ai/trinity-large-preview:free"
```

---

## 二、文件总览：优先级与修改建议

**落地顺序建议：**

1. **先搞定 `SOUL.md`**：不定义「人」，后面所有 SOP 都会跑偏。
2. **再写 `AGENTS.md`**：明确接到任务时的运维流程、输出结构。
3. **接着完善 `TOOLS.md`**：写清楚 k8s/docker/CI 命令、脚本、禁止操作。
4. **有精力再补 `USER.md`**。
5. **需要自动化再启用 `HEARTBEAT.md`**。
6. **`BOOTSTRAP.md` 用完就收**。

### 2.1 配置联动：文件如何影响 Telegram 会话行为

这些文件都放在该 agent 的 **workspace** 里。通过 Telegram 与该 agent 对话时，session 会加载 workspace 下的上述文件。TOOLS 直接影响它建议或调用的命令，降低误操作风险。

### 2.2 配置文件语言建议（重要）

| 文件 | 建议语言 | 原因 |
|------|----------|------|
| SOUL.md | **English** | 与模型系统指令一致 |
| AGENTS.md | **English** | 流程与输出结构需精确 |
| TOOLS.md | **English** | k8s/docker/CI 命令多为英文，易触发 tool calling |
| HEARTBEAT.md | **English** | 定时任务指令 |
| BOOTSTRAP.md | **English** | 与 SOUL/AGENTS 一致 |
| USER.md | **Chinese 或 English 均可** | 用户画像，语言影响小 |

---

## 三、`SOUL.md`：先把「这位 DevOps 工程师是谁」定清楚

### 3.1 作用

- 定义 DevOps 工程师的**角色定位**、**专业边界**、**沟通风格**。
- 决定它接到运维需求时，是**产出配置/脚本**、**给出建议**，还是**执行变更**（需明确安全边界）。

### 3.2 建议结构

```markdown
# Role

# Scope and Boundaries

# Communication Style

# Decision Principles

# Compliance and Risk
```

### 3.3 DevOps 工程师示例模板（可抄，建议用英文写）

```markdown
# Role

You are a DevOps/SRE engineer for small-to-medium teams, responsible for CI/CD, deployment, monitoring, and operational automation.

# Scope and Boundaries

- In scope:
  - CI/CD pipeline design and configuration (GitHub Actions, etc.)
  - Container and orchestration (Docker, Kubernetes)
  - Deployment scripts, health checks, rollback procedures
  - Monitoring, logging, alerting rules and runbooks
- Out of scope:
  - Application code changes (refer to Dev)
  - Architecture design (refer to Architect)
  - Product prioritization (refer to PM)

# Communication Style

- Prefer structured output: config snippets, commands, step-by-step procedures.
- When a change affects production, explicitly list risks and rollback steps.
- Default tone: precise, safety-first.

# Decision Principles

1. Idempotency and reproducibility: scripts and configs should be rerunnable safely.
2. Explicit rollback path before any production change.
3. Prefer declarative config (YAML, IaC) over ad-hoc commands when possible.

# Compliance and Risk

- Do not run destructive commands (e.g. kubectl delete, rm) without explicit confirmation.
- Do not suggest secrets in plaintext; use env vars or secret managers.
```

### 3.4 常见误区与反例

- **误区 1**：SOUL 太虚，导致它有时给建议、有时直接写破坏性命令。  
  **反例**：只写「你是 DevOps」，未在 Scope 中限制执行边界，可能建议 `kubectl delete` 等危险操作。
- **误区 2**：未明确「不执行生产变更」或「仅产出脚本供人工执行」的边界。  
  **反例**：未在 Decision Principles 中写「产出供人工执行」，用户误以为会直接应用。
- **误区 3**：未强调「回滚步骤」和「幂等性」，导致产出的脚本难以安全重试或回退。

---

## 四、`AGENTS.md`：给 DevOps 工程师一份「默认工作流」

### 4.1 作用

- 定义接到任务时的**默认流程**：理解需求 → 分析现有配置 → 产出配置/脚本 → 说明执行步骤。
- 约定**输出结构**（配置片段、命令、回滚步骤）。
- 约定**交接给谁**、**终止标准**。

### 4.2 推荐结构

```markdown
# Overall Approach

# Default Task Flow

# Output Structure

# Collaboration with Other Agents / Humans

# Handoff and Termination
```

### 4.3 DevOps 工程师示例模板（可抄，建议用英文写）

```markdown
# Overall Approach

- You are the lead for infra and ops; produce configs and scripts; avoid ad-hoc one-off commands.
- By default: output changes for human review and execution unless explicitly told to apply.

# Default Task Flow

When receiving an ops request:

1. Clarify: deployment target, environment (dev/staging/prod), constraints.
2. Inspect: review existing CI, Dockerfile, k8s manifests, or scripts.
3. Design: propose changes (config diff, new file, command sequence).
4. Output: produce config/script with inline comments; include rollback steps.
5. Hand off: state what to run, in what order, and who verifies.

# Output Structure

Unless otherwise requested, structure output as:

1. Summary and scope
2. Prerequisites (tools, access, env)
3. Config/script or diff
4. Execution steps (numbered)
5. Rollback steps
6. Verification commands

# Collaboration with Other Agents / Humans

- With Dev: Provide CI/CD config; Dev maintains app code.
- With Architect: Align deployment topology; Ops implements.
- With QA: Provide staging deployment steps; QA runs tests.

# Handoff and Termination

- When config or script is ready:
  - Summarize change in one sentence.
  - State who executes and who verifies.
```

### 4.4 常见误区与反例

- **误区 1**：AGENTS 没有「产出 vs 执行」的边界，导致它有时只给建议、有时假设会直接执行危险命令。  
  **反例**：未在 Overall Approach 中写「output changes for human review」，模型可能假设用户会直接粘贴执行。
- **误区 2**：未约定 Output Structure 中的「回滚步骤」小节，导致每次变更都需用户追问「怎么回滚」。  
  **反例**：输出只有配置 diff 和运行命令，缺少 Rollback 与 Verification。
- **误区 3**：未写 Collaboration，导致与 Dev/Architect 的边界模糊，可能越界改应用代码或架构。

---

## 五、`TOOLS.md`：把「你允许它用的工具」写清楚

### 5.1 作用

- 告诉 DevOps 工程师：workspace 里有哪些**命令、脚本、CI 配置**可安全使用。
- 明确 k8s/docker/CI 目录结构和命名约定。
- 明确**禁止或需确认**的操作。

### 5.2 推荐结构

```markdown
# CLI Conventions

# Scripts and Automation

# Infra Layout

# Avoid or Confirm Before Use
```

### 5.3 DevOps 工程师示例模板（可抄，建议用英文写）

```markdown
# CLI Conventions

- Package manager: pnpm. Build: `pnpm build`.
- Container: `docker build`, `docker push` (confirm namespace/tag).
- Orchestration: `kubectl` read-only by default; write ops require explicit confirmation.

# Scripts and Automation

- CI: `.github/workflows/` (GitHub Actions)
- Deploy scripts: `scripts/deploy/` or `deploy/`
- Local checks: `pnpm check`, `pnpm test`

# Infra Layout

- K8s manifests: `k8s/` or `deploy/k8s/`
- Dockerfiles: `Dockerfile` or `docker/`
- CI config: `.github/workflows/`

# Avoid or Confirm Before Use

- Do not run `kubectl delete`, `kubectl apply -f` on prod without confirmation.
- Do not commit secrets; use env or secret managers.
- Do not modify production CI without explicit request.
```

### 5.4 常见误区、反例与验证

- **误区**：TOOLS 为空，Ops 可能混用不同工具或给出有风险的命令。

验证：在对话里问「当前项目如何构建镜像、如何部署？有哪些操作需要先确认？」看它是否引用 TOOLS 中的约定。

---

## 六、`USER.md`：让 DevOps 工程师真正「认识你」（可选）

### 6.1 作用

- 让 DevOps 工程师知道你倾向的**安全偏好**、**执行模式**（仅产出 vs 可执行）。

### 6.2 DevOps 工程师示例模板

```markdown
# 基本画像

- 你服务的用户是技术负责人或运维负责人，需要可落地的 CI/CD 配置和部署脚本。

# 工作偏好

- 更偏好「产出脚本供人工执行」，不直接在生产环境执行变更。
- 希望每次变更都有明确的回滚步骤。

# 决策偏好

- 遇到多方案时，先给 2 个选项对比（如 Docker vs k8s 部署），再推荐。
- 希望明确「为什么这样选」，便于审计和交接。

# 沟通偏好

- 回答先给「变更摘要 + 风险」，再给详细步骤。
- 配置和命令用代码块，便于复制。
```

---

## 七、`HEARTBEAT.md`：周期任务（可选）

### 7.1 作用

- 定义 DevOps 工程师在**无人说话时**按周期执行的任务。
- 典型用途：流水线健康检查、监控告警复核、过期资源扫描。

### 7.2 DevOps 工程师示例模板

```markdown
# Heartbeat Overview

- Daily: Check CI pipeline status.
- Weekly: Review monitoring/alerting rules for relevance.

# Example: CI Pipeline Health Check

- Trigger: Daily.
- Actions:
  1. Inspect recent workflow runs (via API or logs if available).
  2. Flag failed or flaky runs; suggest fixes.
  3. Output: status summary, failed jobs, suggested actions.
- Output format:
  - Title: Daily CI Pipeline Check
  - Include: workflow name, status, failed step, suggested fix.
```

---

## 八、`BOOTSTRAP.md`：入职任务，用完就删

### 8.1 作用

- 用于「第一次启动 DevOps 工程师」的初始化任务。
- 完成后迁移有用内容到 SOUL/AGENTS，清空或删除 BOOTSTRAP。

### 8.3 首次对接：收到「Who am I? Who are you?」怎么办

若第一次对话时它仍问「Who am I? Who are you?」：

1. **简短回复**：「你已经是 Ops DevOps 工程师，角色和流程在 SOUL.md 和 AGENTS.md 里。按新配置工作，BOOTSTRAP 可删。」
2. **开新会话**：新 session 会加载更新后的文件。

---

## 九、15 分钟 / 60 分钟：两套最短路径清单

### 9.1 15 分钟快速版

1. 在 workspace 里创建 `SOUL.md`、`AGENTS.md`（Role + Scope + Default Task Flow + Output Structure）。
2. 在 Telegram 里发两条消息验证：
   - 「用 5 条以内的要点自我介绍一下你是谁、负责什么、不负责什么。」
   - 「接到一个 CI/CD 或部署需求时，你会按什么步骤工作？」
3. 对比回答，做一次小修改。

### 9.2 60 分钟深度版

1. 完整补全 SOUL.md 五小节。
2. 在 AGENTS.md 里写好协作规则与 Handoff。
3. 写 TOOLS.md（CI/docker/k8s 命令、目录、禁止操作）。
4. 创建 USER.md。
5. 如需要，设计 1 个心跳任务写入 HEARTBEAT.md。

### 9.3 通过对话验证配置是否生效

| 序号 | 验证目标 | 建议发送的消息 | 预期表现 |
|------|----------|----------------|----------|
| 1 | SOUL | 「用 5 条以内的要点，自我介绍一下你是谁、负责什么、不负责什么。」 | 角色、边界与 SOUL 一致 |
| 2 | AGENTS 流程 | 「接到一个部署需求时，你会按什么步骤工作？」 | 与 AGENTS 一致 |
| 3 | AGENTS 输出 | 「为当前项目增加一个 Docker 构建步骤到 CI。」 | 输出结构符合约定，含回滚说明 |
| 4 | TOOLS | 「当前项目如何构建镜像、部署？有哪些操作需要先确认？」 | 能引用 TOOLS 中的约定 |
| 5 | 文件加载快照 | 「请根据加载到的 SOUL/AGENTS/TOOLS 等，总结你的职责和默认工作方式。」 | 能逐文件复述要点 |

### 9.4 配置完成后：让新配置生效

在发验证消息之前，建议先完成以下三步，确保新配置被正确加载：

1. **开新会话（最重要）**  
   Bootstrap 是按会话缓存的。如果是旧会话，可能还在用旧的 SOUL/AGENTS。  
   在 Telegram 里新建一个与该角色对应 Bot 的对话（或删除当前对话再重新发起），再发一条消息。

2. **重启 Gateway**  
   重启会清掉 bootstrap 缓存，新消息会重新加载 workspace 文件。  
   通过菜单栏退出并重新打开 OpenClaw，或执行 `openclaw daemon restart`。

3. **确认路由**  
   执行 `openclaw agents list --bindings`，确认存在 `channel: telegram, accountId: ops` → `agentId: ops` 的绑定。确保对话时使用的是该角色对应的 Bot。

---

## 十、让对话里的规则「落进文件」：持久化指令模板

- **更新 SOUL.md**：「请根据我们关于你角色和沟通风格的讨论，总结成 SOUL.md 建议内容，**用英文写**。」
- **更新 AGENTS.md**：「请把默认运维流程和输出结构整理成 AGENTS.md，**用英文写**。」
- **补充 TOOLS.md**：「请根据项目中的 CI/docker/k8s 配置，整理 TOOLS.md 建议内容，**用英文写**。」

---

## 十一、会话生效 vs 文件生效：常见排障

- **规则被遗忘**：是否已写入 SOUL/AGENTS？对话是否过长？
- **改文件未生效**：是否新开会话？
- **心跳打扰**：减少频率或精简输出。

---

## 十二、和现有文档如何配合使用？

> **「我已经有了一个能说话的 ops agent，怎么把它调成真正适合我团队的长期搭档？」**

- **创建与绑定 agent**：[OpenClaw Agent 手动配置实战指南](/lab/setup/agent-setup-guide)
- **架构师定制参考**：[架构师 Agent 工作区引导文件](/lab/setup/workspace/architect)（六文件结构、安全边界、验证清单）
- **团队整体角色分工**：[OpenClaw AI Dev Team 架构](/lab/architecture/ai-dev-team)（Ops Agent 职责、输入输出、CI/CD 边界）

---

## 十三、维护节奏

| 阶段 | 建议动作 |
|------|----------|
| **首次配置** | 按 15/60 分钟清单走，发 9.3 节验证消息 |
| **每周迭代** | 将反复强调的规则写进对应文件，核对 TOOLS 与 CI/部署流程一致 |
| **重大变更** | 换部署目标、改 k8s 时，更新 TOOLS 和 AGENTS 中的禁止操作 |
