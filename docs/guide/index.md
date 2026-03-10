---
layout: doc
---
# OpenClaw 🦞 — 完整指南

## 一、OpenClaw 是什么？

OpenClaw 是一个**自托管的个人 AI 助手网关**。你在自己的机器上运行一个 Gateway 进程，它就会成为你所有聊天应用和 AI 之间的桥梁。

**核心理念**：
- 数据在你自己手里，不依赖第三方托管
- 一个 Gateway 连接所有聊天平台
- 通过 Skills 扩展能力，通过 Cron/Hooks 实现自动化
- 开源项目，社区活跃

**适合人群**：开发者、效率控、隐私优先用户、自托管爱好者

---

## 二、系统要求

- **Node.js** ≥ 22（使用 `node --version` 检查）
- **操作系统**：macOS / Linux / Windows（通过 WSL2，强烈推荐）
- **网络**：需要访问 AI 模型提供商的 API

---

## 三、安装方式

### 方式一：一键安装脚本（推荐）

macOS / Linux：
```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Windows PowerShell：
```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

### 方式二：npm 全局安装
```bash
npm install -g openclaw@latest
# 或
pnpm add -g openclaw@latest
```

### 方式三：macOS 应用
从官网下载 macOS 应用，支持 Apple Silicon 和 Intel 芯片。

### 方式四：Docker 部署
支持容器化部署，详见官方文档 Docker 章节。

### 方式五：从源码构建
```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm ui:build
pnpm build
```

---

## 四、初始化配置（Onboarding Wizard）

安装完成后，运行引导向导：
```bash
openclaw onboard --install-daemon
```

向导提供两种模式：

**QuickStart（快速模式）**：使用默认配置，适合大多数用户
- 本地 Gateway（loopback）
- 默认工作区
- 端口 18789
- 自动生成 Token 认证
- Telegram + WhatsApp 默认使用 allowlist

**Advanced（高级模式）**：完全自定义每一步配置

### 向导配置的 7 个步骤：

**1. 模型/认证（Model/Auth）**
选择 AI 模型提供商和认证方式：
- 支持 API Key、OAuth、Setup Token
- 支持 Custom Provider（OpenAI 兼容、Anthropic 兼容、自动检测）
- 建议选择最强的最新一代模型以确保安全性
- 支持非交互模式：`--secret-input-mode ref` 使用环境变量存储凭证

**2. 工作区（Workspace）**
设置 Agent 文件目录（默认 `~/.openclaw/workspace`）：
- 包含 SOUL.md（人格定义）、USER.md（用户信息）、MEMORY.md（长期记忆）
- 初始化引导文件

**3. Gateway 配置**
端口、绑定地址、认证模式、Tailscale 暴露：
- 默认端口 18789
- 支持 Token 和 Password 认证
- 支持通过 Tailscale 安全暴露到外网
- 可选 SecretRef 管理 Token

**4. 渠道（Channels）**
连接聊天平台，可同时配置多个：
- 最快配置：Telegram（只需 Bot Token）
- WhatsApp 需要 QR 扫码配对
- 支持：Discord、Signal、Slack、iMessage、飞书等

**5. 守护进程（Daemon）**
安装后台服务，确保重启后自动运行：
- macOS：安装 LaunchAgent
- Linux/WSL2：安装 systemd user unit

**6. 健康检查**
启动 Gateway 并验证运行状态

**7. Skills 安装**
安装推荐技能和可选依赖

### 常用配置命令：
```bash
openclaw configure          # 重新配置
openclaw doctor             # 诊断问题
openclaw gateway status     # 检查 Gateway 状态
openclaw dashboard          # 打开浏览器控制面板
```

---

## 五、支持的聊天渠道（22+ 平台）

### 核心渠道（内置支持）
- **WhatsApp** — 最受欢迎，使用 Baileys 库，需 QR 配对
- **Telegram** — 最快配置，Bot API + grammY，支持群组
- **Discord** — Bot API + Gateway，支持服务器/频道/DM
- **Signal** — 基于 signal-cli，隐私优先
- **BlueBubbles** — iMessage 推荐方案，全功能支持（编辑/撤回/特效/表情）
- **Slack** — Bolt SDK，企业级集成
- **IRC** — 经典 IRC 协议，频道 + DM
- **WebChat** — 浏览器内聊天，WebSocket 连接

### 插件渠道（需单独安装）
- **飞书（Feishu）** — WebSocket 连接
- **Google Chat** — HTTP webhook
- **Microsoft Teams** — Bot Framework
- **Matrix** — 去中心化协议
- **Mattermost** — 开源团队协作
- **LINE** — 日本/东南亚主流
- **Zalo / Zalo Personal** — 越南主流
- **Nextcloud Talk** — 自托管聊天
- **Nostr** — 去中心化 DM（NIP-04）
- **Synology Chat** — 群晖 NAS
- **Tlon** — Urbit 去中心化通讯
- **Twitch** — 直播聊天

### 渠道特性
- 多渠道可同时运行，按聊天自动路由
- DM 配对和 allowlist 安全机制
- 文本所有平台通用，媒体和表情因平台而异

---

## 六、模型配置详解

### 支持的模型提供商
- **OpenAI** — GPT 系列、Codex（支持 OAuth 订阅）
- **Google** — Gemini 系列
- **Anthropic** — Claude 系列（支持 Setup Token）
- **自定义端点** — 所有 OpenAI 兼容 / Anthropic 兼容的 API

### 模型选择优先级
1. 主模型（Primary Model）
2. 备选模型（Fallbacks），按顺序尝试
3. 同一提供商内的认证故障自动切换（Auth Failover）

### 模型配置文件结构
- `agents.defaults.model.primary` — 主模型
- `agents.defaults.model.fallbacks` — 备选列表
- `agents.defaults.models` — 允许使用的模型白名单
- `agents.defaults.imageModel` — 图片处理专用模型

### 常用模型 CLI 命令
```bash
openclaw models status              # 当前模型状态
openclaw models list --all           # 列出所有模型
openclaw models set openai/gpt-4o    # 设置主模型
openclaw models set-image <model>    # 设置图片模型
openclaw models fallbacks list       # 查看备选模型
openclaw models fallbacks add <m>    # 添加备选
openclaw models aliases add 别名 模型 # 添加别名
```

### 在聊天中切换模型
```
/model                        # 打开模型选择器
/model list                   # 列出可用模型
/model 3                      # 按编号选择
/model openai/gpt-4o          # 直接指定
/model status                 # 查看详细状态
```

### OpenRouter 免费模型扫描
```bash
openclaw models scan              # 扫描并探测免费模型
openclaw models scan --no-probe   # 仅列出元数据
openclaw models scan --set-default  # 自动设为默认
```

### 安全建议
- 使用最新一代最强模型处理工具调用和不可信输入
- 较弱/较旧的模型更容易被提示注入攻击
- OAuth 认证到期前 24 小时自动警告

---

## 七、Skills 技能系统

Skills 是 OpenClaw 的能力扩展机制，每个 Skill 是一个独立的 SKILL.md 文件，定义了特定任务的专业指令和工具使用方式。

### 获取 Skills
- **ClawHub**（https://clawhub.ai）— 官方技能市场
- 社区贡献的第三方 Skills
- 安装前需通过 Skill Vetter 安全审查

### 技能分类

**学术与研究**
- AMiner 学术搜索 — 论文/学者/机构/期刊/专利查询
- AutoGLM Deep Research — 深度调研报告生成
- Research Paper Writer — IEEE/ACM 格式学术论文写作

**开发工具**
- Code — 编码工作流（规划/实现/验证/测试）
- Architecture Designer — 系统架构设计与评审
- Security Auditor — OWASP Top 10 安全审计
- Git Essentials — 版本控制与协作
- Frontend Design — 高质量前端界面
- UI/UX Pro Max — UI/UX 设计与实现
- Supabase PostgreSQL — 数据库优化

**内容创作**
- Blog Writer — 博客文章写作
- SEO Content Writer — SEO 优化内容
- Copywriting — 营销文案（AIDA/PAS/FAB）
- Social Content — 社交媒体内容（LinkedIn/Twitter/Instagram）
- Market Research — 市场规模与竞品分析

**自动化与效率**
- Automation Workflows — 工作流自动化设计
- Feishu Cron Reminder — 飞书定时提醒
- FFmpeg Video Editor — 视频编辑命令生成

**工具类**
- Weather — 天气查询（wttr.in / Open-Meteo）
- 1Password — 密码管理与凭证注入
- Memory — 无限分类记忆存储
- Session Logs — 会话日志搜索与分析
- Video Frames — 视频帧提取

### Skills 安全机制
- 安装前强制审查：检测恶意代码、凭证窃取、破坏性命令
- 权限范围评估：检查读写文件、网络访问、命令执行
- 只有所有者确认后才安装

---

## 八、自动化能力

### Cron 定时任务
```bash
openclaw cron add "任务名称" --schedule "0 9 * * *"
openclaw cron list
openclaw cron remove <id>
```
适合精确时间触发的任务。

### Heartbeat 心跳检查
- 周期性检查（约 30 分钟一次）
- 在 HEARTBEAT.md 中配置检查项
- 适合批量检查多个项目

### Webhooks
- 外部事件触发 Agent 动作

### Hooks
- 消息收发时的自定义处理逻辑

---

## 九、记忆系统

三层记忆架构：
1. **MEMORY.md** — 精选长期记忆
2. **每日日志** — `memory/YYYY-MM-DD.md` 原始事件记录
3. **会话历史** — 短期对话记录

---

## 十、安全特性

- 本地运行，数据不出机器
- 提示词注入防护
- 凭证 SecretRef 管理
- DM 配对 / Allowlist
- Skill 安装安全审查
- 破坏性操作确认

---

## 十一、多 Agent

```bash
openclaw agents add <name>
```
每个 Agent 独立工作区、模型、人格配置。

---

## 十二、资源链接

- 官网：https://openclaw.ai
- 文档：https://docs.openclaw.ai
- GitHub：https://github.com/openclaw/openclaw
- 技能市场：https://clawhub.ai
- 社区：https://discord.gg/clawd

*"EXFOLIATE! EXFOLIATE!"* — 🦞
