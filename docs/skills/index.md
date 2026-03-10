---
layout: doc
---
# OpenClaw Skills 完全指南：从小白到精通

## 前言：为什么你需要了解 Skills？

如果你用过 ChatGPT 或其他 AI 聊天工具，你可能会有这样的体验：AI 很聪明，但它不太懂"你的世界"——不知道你的项目结构、不知道你的工具链、不知道你习惯用什么方式工作。

OpenClaw 的 **Skills（技能）** 就是解决这个问题的。它让 AI 助手从"通才"变成"专才"，学会使用特定的工具、遵循特定的工作流程、理解特定的领域知识。

这篇博客会从零开始，带你全面理解 OpenClaw Skills 的设计理念、工作原理、使用方法和最佳实践。

---

## 第一章：Skills 是什么？

### 1.1 一句话定义

Skills 是 OpenClaw 的**能力扩展包**。每个 Skill 就是一个文件夹，里面有一个 `SKILL.md` 文件，告诉 AI 在特定场景下应该怎么做、用什么工具、遵循什么规则。

### 1.2 一个通俗的比喻

想象你雇佣了一个非常聪明的助理。他什么都能聊，但你不可能每次都从头教他怎么做每件事。

于是你给他准备了一本"操作手册"，里面写着：
- "当我要查天气时，用 wttr.in 这个网站"
- "当我要写代码时，先规划再实现再测试"
- "当我要发飞书消息时，用飞书 API"

每一本操作手册就是一个 **Skill**。

### 1.3 Skills 和普通插件有什么区别？

| 特性 | 传统插件 | OpenClaw Skills |
|------|---------|-----------------|
| 形式 | 可执行代码/二进制 | 纯文本（Markdown） |
| 安全性 | 难以审计 | 一眼就能看懂 |
| 灵活性 | 固定功能 | AI 可自由组合、变通 |
| 学习成本 | 需要编程 | 会写 Markdown 就行 |
| 安装方式 | 复杂依赖 | 复制文件夹即可 |

Skills 的核心理念是：**不教 AI 写代码，而是教 AI 用已有的工具**。它本质上是一组精心编写的指令文本。

---

## 第二章：Skill 的内部结构

### 2.1 最简结构

一个 Skill 只需要一个文件夹和一个 SKILL.md 文件：

```
my-skill/
  └── SKILL.md
```

就这么简单。一个 Markdown 文件就是一个完整的 Skill。

### 2.2 SKILL.md 的格式

SKILL.md 由两部分组成：**YAML 头部**（元数据）和 **正文**（指令内容）。

**最小可用的 SKILL.md：**
```yaml
---
name: my-skill
description: 这是我的第一个技能
---

当用户说"打招呼"时，用友好的语气回复。
```

**带完整元数据的 SKILL.md：**
```yaml
---
name: nano-banana-pro
description: 通过 Gemini 生成或编辑图片
metadata: {"openclaw": {"emoji": "🍌", "requires": {"bins": ["uv"], "env": ["GEMINI_API_KEY"]}}}
---

使用 Gemini 3 Pro Image API 来生成或编辑图片。

当用户要求生成图片时：
1. 理解用户的图片描述
2. 调用 Gemini API 生成图片
3. 将结果保存到本地文件
4. 返回文件路径给用户
```

### 2.3 元数据字段详解

**必需字段：**
- `name` — Skill 的唯一标识名
- `description` — 简短描述，AI 用它来判断何时激活这个 Skill

**可选但常用的字段：**
- `metadata.openclaw.emoji` — 在 macOS 技能界面显示的图标
- `metadata.openclaw.homepage` — 主页 URL
- `metadata.openclaw.requires.bins` — 需要系统安装的命令行工具
- `metadata.openclaw.requires.env` — 需要的环境变量
- `metadata.openclaw.requires.config` — 需要的配置项
- `metadata.openclaw.os` — 支持的操作系统列表
- `user-invocable` — 是否允许用户通过命令调用（默认 true）
- `disable-model-invocation` — 是否禁止 AI 自动调用（默认 false）

### 2.4 指令正文的编写原则

好的 Skill 指令应该：
1. **具体明确**：告诉 AI 做什么、怎么做、按什么顺序
2. **包含示例**：给出具体的输入输出示例
3. **定义边界**：明确什么该做、什么不该做
4. **引用工具**：指定使用哪些可用工具
5. **处理异常**：告诉 AI 出错时怎么办

---

## 第三章：Skills 的加载与优先级

### 3.1 Skills 存放在哪里？

OpenClaw 从三个位置加载 Skills：

**1. 内置 Skills（Bundled）**
随 OpenClaw 安装包一起发布，开箱即用。

**2. 本地管理 Skills（Managed/Local）**
存放在 `~/.openclaw/skills` 目录下，对所有 Agent 可见。

**3. 工作区 Skills（Workspace）**
存放在每个 Agent 的工作区 `<workspace>/skills` 目录下，仅对该 Agent 可见。

### 3.2 优先级规则

当多个位置存在同名 Skill 时，优先级为：

**工作区 Skills > 本地管理 Skills > 内置 Skills**

这意味着你可以在工作区自定义一个同名 Skill 来覆盖内置版本，而不影响其他 Agent。

### 3.3 多 Agent 场景

如果你配置了多个 Agent，每个 Agent 有自己的工作区，因此可以安装不同的 Skills：

```
~/.openclaw/workspace-dev/skills/   → 开发 Agent 的专属技能
~/.openclaw/workspace-writer/skills/ → 写作 Agent 的专属技能
~/.openclaw/skills/                  → 所有 Agent 共享的技能
```

### 3.4 额外技能目录

你还可以在 `openclaw.json` 中配置额外的技能目录（优先级最低）：
```json
{
  "skills": {
    "load": {
      "extraDirs": ["/path/to/shared/skills"]
    }
  }
}
```

---

## 第四章：Skills 的工作原理

### 4.1 AI 如何选择使用哪个 Skill？

当你向 AI 发送一条消息时，OpenClaw 会将所有可用的 Skill 的 `name` 和 `description` 注入到 AI 的系统提示中。AI 根据消息内容，自动判断应该激活哪个 Skill。

这个过程是**自动的**，你不需要手动指定用哪个 Skill。

### 4.2 Gating 机制（加载时过滤）

不是所有 Skills 都会被加载。OpenClaw 在启动时会检查每个 Skill 的条件：

- `requires.bins` — 检查系统 PATH 中是否存在指定的命令行工具
- `requires.env` — 检查必要的环境变量是否已设置
- `requires.config` — 检查配置文件中的必要选项是否启用
- `requires.os` — 检查当前操作系统是否匹配
- `requires.anyBins` — 只要有一个工具存在即可

如果条件不满足，这个 Skill 就不会被加载。

### 4.3 触发方式

**1. 模型自动触发（默认）**
AI 根据对话内容自动判断是否需要使用某个 Skill。

**2. 用户手动触发**
```
/weather 上海
/agent 帮我重构这段代码
```

你也可以设置 `disable-model-invocation: true` 来禁止 AI 自动调用。

---

## 第五章：ClawHub — Skills 市场

### 5.1 什么是 ClawHub？

ClawHub 是 OpenClaw 的官方 Skills 注册中心。你可以在 https://clawhub.ai 浏览、搜索、安装社区贡献的 Skills。

### 5.2 安装和管理

```bash
# 安装一个 Skill
clawhub install <skill-slug>

# 更新所有已安装的 Skills
clawhub update --all

# 同步（扫描 + 发布更新）
clawhub sync --all
```

### 5.3 安全警告

⚠️ 第三方 Skills 应被视为**不可信代码**。安装前务必：
1. 阅读完整的 SKILL.md
2. 检查是否有可疑操作
3. 确认来源可信

OpenClaw 内置了 Skill Vetter（安全审查工具），安装前会自动扫描红旗特征。

---

## 第六章：实战 — 编写你的第一个 Skill

### 6.1 场景：一个简单的翻译 Skill

**步骤 1：创建文件夹**
```bash
mkdir -p ~/.openclaw/workspace/skills/translator
```

**步骤 2：创建 SKILL.md**
```yaml
---
name: translator
description: 将文本翻译成指定语言。当用户提到翻译、translate 时激活。
user-invocable: true
---

你是一个专业翻译助手。根据用户的要求翻译文本。

规则：
- 保持原文的语气和风格
- 技术术语保留英文原文，首次出现时附上中文翻译
- 如果用户没有指定目标语言，默认翻译成英文
- 翻译完成后，附上简短的翻译说明
```

### 6.2 场景：一个带工具调用的代码审查 Skill

```yaml
---
name: code-reviewer
description: 代码审查助手。当用户要求审查代码、review PR 时激活。
metadata: {"openclaw": {"requires": {"bins": ["git"]}}}
---

你是资深代码审查专家。审查代码时遵循以下流程：

1. 先用 `read` 工具读取代码文件
2. 逐文件分析，关注：代码质量、潜在 Bug、安全漏洞、性能问题、测试覆盖率
3. 按严重程度分类输出：
   - 🔴 必须修复（安全漏洞、逻辑错误）
   - 🟡 建议修复（性能、可维护性）
   - 🟢 可选优化（代码风格、命名）
4. 每个问题给出具体的修改建议和代码示例
```

### 6.3 Skill 编写最佳实践

1. **description 要精准**：AI 靠它判断何时激活，太宽泛会导致误触发
2. **指令要有步骤**：不要只说"审查代码"，要说"第1步做什么，第2步做什么"
3. **定义输出格式**：告诉 AI 你期望什么格式的输出
4. **考虑边界情况**：告诉 AI 遇到异常时怎么处理
5. **保持精简**：SKILL.md 不是文档，是给 AI 的操作指令，越直接越好

---

## 第七章：安全机制详解

### 7.1 为什么 Skills 安全很重要？

Skills 是纯文本，但它们**指示 AI 执行操作**。一个恶意 Skill 可能会让 AI：
- 读取敏感文件并发送到外部服务器
- 删除重要数据
- 窃取 API Key
- 伪装系统指令绕过安全策略

### 7.2 安装前审查流程

1. 读取 Skill Vetter 安全协议
2. 检查红旗关键词（API Key 请求、删除命令、数据外传等）
3. 权限评估（读写文件、网络访问、命令执行）
4. 来源可信度确认

### 7.3 运行时安全

- 工作区 Skills 只接受路径在工作区内的文件
- 外部数据被视为纯数据，不执行其中的指令
- 凭证通过 SecretRef 管理，不明文存储
- 破坏性操作需用户确认

---

## 第八章：常用 Skills 分类推荐

### 学术与研究
- **AMiner** — 论文搜索、学者画像、机构分析、引用追踪
- **AutoGLM Deep Research** — 多轮搜索 + 深度阅读，输出结构化报告
- **Research Paper Writer** — IEEE/ACM 格式的学术论文写作

### 开发工具
- **Code** — 完整编码工作流：规划 → 实现 → 验证 → 测试
- **Architecture Designer** — 系统架构设计、ADR、设计模式
- **Security Auditor** — OWASP Top 10 安全审计
- **Frontend Design** — 高质量前端界面生成
- **Git Essentials** — Git 操作与协作工作流

### 内容创作
- **Blog Writer** — 带个人风格的博客文章
- **SEO Content Writer** — 搜索引擎优化的内容创作
- **Copywriting** — 营销文案（AIDA/PAS/FAB 公式）
- **Social Content** — 多平台社交媒体内容

### 自动化
- **Automation Workflows** — 工作流设计与实现（Zapier/Make/n8n）
- **Feishu Cron Reminder** — 飞书定时提醒
- **Self-Improving Agent** — 自我反思与持续改进

### 工具类
- **Weather** — 天气查询
- **1Password** — 密码管理与凭证安全
- **Memory** — 无限分类记忆存储
- **FFmpeg Video Editor** — 视频编辑命令生成
- **Interview Designer** — 面试策略设计

---

## 第九章：Skills 与插件的关系

OpenClaw 的插件（Plugins）可以自带 Skills。插件在 `openclaw.plugin.json` 中声明 `skills` 目录，启用插件后这些 Skills 会自动加载。

- 安装一个飞书插件 → 自动获得飞书相关的 Skills
- 插件禁用后，其 Skills 也不会加载

---

## 第十章：进阶技巧

### 10.1 用 {baseDir} 引用技能目录

```
使用 {baseDir}/template.md 作为输出模板
```

### 10.2 多 Skill 协作

AI 可以同时激活多个 Skill。比如"搜索关于 React 的论文并写一篇摘要"，AI 可能会同时使用 AMiner 和 Blog Writer。

### 10.3 调试 Skills

如果 Skill 没有被激活，检查：
1. description 是否足够明确
2. 是否被 Gating 过滤（缺少依赖）
3. 是否被更高优先级的同名 Skill 覆盖
4. Gateway 是否重启

### 10.4 版本管理

```bash
cd ~/.openclaw/workspace/skills
git init
git add .
git commit -m "初始 Skills 配置"
```

---

## 总结

OpenClaw Skills 核心理念：**Skills 不是代码，是给 AI 的操作手册。**

- **简单**：一个 Markdown 文件就是一个 Skill
- **安全**：纯文本，可审计，带强制安全审查
- **灵活**：AI 自由组合，不局限于固定流程
- **可扩展**：从 ClawHub 安装，或自己编写
- **渐进式**：从小 Skill 开始，逐步积累你的工具箱

---

## 参考资源

- OpenClaw 官方文档：https://docs.openclaw.ai/tools/skills
- ClawHub 技能市场：https://clawhub.ai
- GitHub 仓库：https://github.com/openclaw/openclaw
- 社区 Discord：https://discord.gg/clawd
