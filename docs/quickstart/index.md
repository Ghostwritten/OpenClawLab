---
title: 5 分钟上手 OpenClaw
description: 快速入门路径：安装、理解 Agent、选一个 Lab 场景实践
layout: doc
---

# 5 分钟上手 OpenClaw

按以下三步快速体验 OpenClaw：安装运行、理解核心概念、选一个实战场景落地。

---

## 第一步：安装

**推荐方式：一键安装脚本**

macOS / Linux：

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

安装完成后运行引导向导：

```bash
openclaw onboard --install-daemon
```

选择 **QuickStart** 模式可最快完成配置。详细安装选项见 [OpenClaw 完整指南](/guide/)。

---

## 第二步：理解 Agent

Agent 是 OpenClaw 的核心：一个有独立身份和记忆的 AI 助手。

- **工作区**：存放 SOUL.md（人格）、USER.md（用户信息）、MEMORY.md（长期记忆）
- **渠道**：通过 Telegram、飞书、WhatsApp 等与你对话
- **Skills**：扩展能力，如代码、搜索、天气等

更完整的概念见 [Agent 完全指南](/agent/)。

---

## 第三步：选一个 Lab 场景实践

根据你的目标，选择对应实战文档深入：

| 目标 | 推荐阅读 |
|------|----------|
| 搭建 AI 开发团队（多角色、多机器人） | [AI Dev Team 架构](/lab/architecture/ai-dev-team) |
| 配置多个 Telegram 机器人 | [配置多个机器人](/lab/telegram/multi-bots) |
| 分清多 Agent、Sub-agents、Agent-to-Agent | [多智能体协作 Demo](/lab/concepts/multi-agent-demo) |
| 定制某个角色的工作区 | [Lab 总览](/lab/) → 工作区定制 |

---

## 下一步

- 学习 **Skills** 扩展能力：[Skills 完全指南](/skills/)
- 了解更多渠道：飞书、WhatsApp、Slack 等见 [渠道选型](/lab/channels/comparison)
- 遇到问题：运行 `openclaw doctor` 或查阅 [关于本项目](/about/) 中的资源链接
