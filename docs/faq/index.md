---
title: 常见问题
description: OpenClaw 配置、渠道、Agent、Skills 常见问题与排错
layout: doc
---

# 常见问题

汇集各篇文档中的注意事项、推荐做法及常见故障的快速排查指引。

---

## 配置与安装

### 安装后无法启动 Gateway

- 检查 Node.js 版本：需 ≥ 22（`node --version`）
- 运行 `openclaw doctor` 查看诊断
- 检查 `~/.openclaw/openclaw.json` 是否有效：`openclaw config validate`

### 配置修改后未生效

- 部分配置需**重启 Gateway** 才生效（如渠道 enable/disable、bindings）
- 工作区文件（SOUL.md、AGENTS.md）修改后，建议**新开会话**以加载最新内容

---

## 渠道与 Telegram

### 404 / deleteWebhook 失败

- 多为该账号的 `botToken` 无效或已被撤销
- 在 BotFather 检查并更新 token，或暂时将 `channels.telegram.accounts.<id>.enabled` 设为 `false`
- 参见 [禁用渠道或机器人手册](/lab/config/disable-bots-guide)

### 发消息无回复

1. 检查该账号是否有对应 binding（`openclaw agents bindings`）
2. 检查 `allowFrom` 是否包含你的 user id
3. 确认 Gateway 已重启并成功加载配置（`openclaw gateway status`）
4. 私聊时确认已配对或已在 allowlist 中

### 多机器人时如何只禁用其中一个

在 `channels.telegram.accounts.<accountId>` 下将 `enabled` 设为 `false`，或使用：

```bash
openclaw config set 'channels.telegram.accounts.news.enabled' false --json
```

详见 [禁用渠道或机器人手册](/lab/config/disable-bots-guide)。

---

## Agent 与多智能体

### PM 不能调子 Agent

- 检查 `product_manager.subagents.allowAgents` 是否包含目标 agentId
- 确认目标 Agent 已在 `agents.list` 中

### 消息未路由到预期 Agent

- 检查 `bindings` 是否命中（`openclaw agents bindings`）
- 检查是否被 fallback 到 `default: true` 的 agent
- 多账号时确认 `accountId` 与 binding 的 channel/account 匹配

### 规则被遗忘 / 改文件未生效

- 确认规则已写入 SOUL.md 或 AGENTS.md
- 新开会话以重新加载工作区文件
- 会话过长时，模型可能遗忘早期约束，可尝试缩短上下文或拆分任务

---

## Skills

### Skill 未被激活

1. 检查 `description` 是否足够明确，方便 AI 判断何时使用
2. 检查是否被 Gating 过滤（缺少 `requires.bins`、`requires.env` 等依赖）
3. 是否被更高优先级的同名 Skill 覆盖（工作区 > 本地 > 内置）
4. 重启 Gateway 后重试

---

## 更多资源

- [OpenClaw 完整指南](/guide/)：安装、配置、渠道、模型
- [Lab 实战](/lab/)：AI Dev Team、多机器人、工作区定制
- [openclaw.json 配置说明](/lab/config/reference)
- [官方文档](https://docs.openclaw.ai) 与 [Discord 社区](https://discord.gg/clawd)
