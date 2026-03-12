---
title: openclaw.json 配置说明手册
description: openclaw.json 完整配置参考，顶层结构与各模块说明
layout: doc
---

# OpenClaw 配置文件说明手册

> `~/.openclaw/openclaw.json` 完整配置参考。格式为 JSON5（支持注释与尾逗号）。所有字段可选，未配置时使用默认值。环境变量 `OPENCLAW_CONFIG_PATH` 可指定配置文件路径。

---

## 一、概述

### 1.1 文件位置

| 环境 | 默认路径 |
|------|----------|
| 通用 | `~/.openclaw/openclaw.json` |
| 自定义 | 通过 `OPENCLAW_CONFIG_PATH` 指定 |

### 1.2 配置格式

- **JSON5**：支持注释（`//`、`/* */`）、尾逗号、单引号。
- **严格校验**：配置必须符合 schema，否则 Gateway 拒绝启动。
- **热加载**：Gateway 会监听文件变化并自动应用，部分变更需重启才生效。

### 1.3 配置管理命令

```bash
openclaw config file          # 输出当前配置文件路径
openclaw config get <path>    # 读取字段
openclaw config set <path> <value>   # 设置字段
openclaw config unset <path>  # 删除字段
openclaw config validate      # 校验配置
openclaw onboard              # 向导式配置
```

---

## 二、顶层结构

```
meta          # 内部元数据（版本、时间戳等）
wizard        # 向导运行记录
auth          # 认证配置（OAuth、API Key 等）
models        # 模型提供者与模型列表
agents        # 智能体默认值、列表
bindings      # 渠道/账号 → 智能体 路由
channels      # 渠道配置（Telegram、WhatsApp、Discord 等）
gateway       # 网关端口、认证、Tailscale 等
commands      # 命令注册与权限
session       # 会话隔离、重置、存储
hooks         # 内部钩子
skills        # 技能安装与配置
plugins       # 插件启用与安装
```

---

## 三、meta 与 wizard

通常由工具自动维护，无需手动编辑。

```json5
{
  "meta": {
    "lastTouchedVersion": "2026.3.2",
    "lastTouchedAt": "2026-03-06T08:25:28.434Z"
  },
  "wizard": {
    "lastRunAt": "2026-02-28T10:35:39.233Z",
    "lastRunVersion": "2026.2.26",
    "lastRunCommand": "onboard",
    "lastRunMode": "local"
  }
}
```

---

## 四、auth（认证配置）

存储各提供者的认证方式（OAuth、API Key 等），敏感信息可放在单独的文件或环境变量中。

```json5
{
  "auth": {
    "profiles": {
      "qwen-portal:default": {
        "provider": "qwen-portal",
        "mode": "oauth"
      },
      "openai:default": {
        "provider": "openai",
        "mode": "api_key"
      }
    },
    "order": {
      "anthropic": ["anthropic:me@example.com"],
      "openai": ["openai:default"]
    }
  }
}
```

- `profiles`：各 profile 的 provider 与 mode。
- `order`：同一 provider 下 profile 的优先级顺序。

---

## 五、models（模型提供者）

定义模型提供者（API 地址、密钥）及可用模型列表。密钥可通过环境变量或 1Password 等注入。

```json5
{
  "models": {
    "mode": "merge",
    "providers": {
      "openai": {
        "baseUrl": "https://api.openai.com/v1",
        "apiKey": "sk-...",
        "api": "openai-completions",
        "models": [
          {
            "id": "gpt-4.1",
            "name": "GPT-4.1",
            "reasoning": false,
            "input": ["text"],
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
            "contextWindow": 128000,
            "maxTokens": 8192
          }
        ]
      },
      "anthropic": {
        "baseUrl": "https://api.anthropic.com",
        "apiKey": "${ANTHROPIC_API_KEY}",
        "api": "anthropic-messages",
        "models": [...]
      }
    }
  }
}
```

- `mode`：`merge`（合并）或 `replace`（替换）providers。
- `providers.<id>.baseUrl`：API 基础 URL。
- `providers.<id>.apiKey`：API 密钥（可用 `${VAR}` 引用环境变量）。
- `providers.<id>.api`：协议类型（如 `openai-completions`、`anthropic-messages`）。
- `providers.<id>.models`：该提供者下可用模型的列表。

---

## 六、agents（智能体）

### 6.1 agents.defaults（全局默认）

```json5
{
  "agents": {
    "defaults": {
      "workspace": "~/.openclaw/workspace",
      "model": {
        "primary": "anthropic/claude-sonnet-4-5",
        "fallbacks": ["openai/gpt-5-mini"]
      },
      "models": {
        "anthropic/claude-sonnet-4-5": { "alias": "sonnet" },
        "openai/gpt-5-mini": { "alias": "gpt-mini" }
      },
      "compaction": { "mode": "safeguard" },
      "heartbeat": { "every": "30m" }
    }
  }
}
```

| 字段 | 说明 |
|------|------|
| `workspace` | 默认工作区路径 |
| `model.primary` | 默认主模型（`provider/model`） |
| `model.fallbacks` | 失败时依次尝试的模型 |
| `models` | 模型目录，供 `/model` 与别名使用 |
| `compaction.mode` | 长对话压缩：`default` / `safeguard` |
| `heartbeat.every` | 心跳间隔（如 `30m`），`0m` 表示关闭 |

### 6.2 agents.list（智能体列表）

```json5
{
  "agents": {
    "list": [
      {
        "id": "main",
        "default": true,
        "name": "主智能体",
        "workspace": "~/.openclaw/workspace"
      },
      {
        "id": "news",
        "name": "技术情报官",
        "workspace": "~/.openclaw/workspace-news"
      }
    ]
  }
}
```

| 字段 | 说明 |
|------|------|
| `id` | 稳定标识，在 bindings 中引用 |
| `default` | 是否默认智能体（多 agent 时生效） |
| `name` | 显示名称 |
| `workspace` | 该 agent 的工作区 |

---

## 七、bindings（路由绑定）

将 `(channel, accountId)` 映射到 `agentId`。

```json5
{
  "bindings": [
    { "agentId": "main", "match": { "channel": "telegram", "accountId": "default" } },
    { "agentId": "news", "match": { "channel": "telegram", "accountId": "news" } },
    { "agentId": "main", "match": { "channel": "whatsapp" } }
  ]
}
```

**匹配顺序**（先匹配者生效）：

1. `match.peer`（对端）
2. `match.guildId` / `match.teamId`（Discord/Slack 等）
3. `match.accountId` 精确匹配
4. `match.accountId: "*"` 通配
5. 默认 agent

---

## 八、channels（渠道配置）

### 8.1 通用策略

| DM 策略 | 行为 |
|---------|------|
| `pairing`（默认） | 陌生人需配对码，owner 批准 |
| `allowlist` | 仅 `allowFrom` 中的发送者 |
| `open` | 允许所有（通常需 `allowFrom: ["*"]`） |
| `disabled` | 忽略所有 DM |

| 群组策略 | 行为 |
|----------|------|
| `allowlist`（默认） | 仅配置的群 + 发送者白名单 |
| `open` | 不检查群/发送者白名单，仍可 requireMention |
| `disabled` | 忽略所有群消息 |

### 8.2 Telegram

```json5
{
  "channels": {
    "telegram": {
      "enabled": true,
      "dmPolicy": "pairing",
      "allowFrom": [123456789],
      "groupPolicy": "allowlist",
      "groupAllowFrom": [123456789],
      "streaming": "off",
      "proxy": "http://proxy-host:7890",
      "groups": {
        "*": { "requireMention": true },
        "-1001234567890": {
          "groupPolicy": "open",
          "requireMention": true,
          "allowFrom": [123456789]
        }
      },
      "accounts": {
        "default": {
          "botToken": "123:ABC...",
          "allowFrom": [123456789]
        },
        "news": {
          "enabled": true,
          "botToken": "987:XYZ...",
          "allowFrom": [123456789],
          "groups": { "-1001234567890": { "requireMention": true } }
        }
      }
    }
  }
}
```

| 字段 | 说明 |
|------|------|
| `botToken` | BotFather 提供的 token |
| `tokenFile` | 从文件读取 token |
| `allowFrom` | DM 发送者白名单（数字 user id） |
| `groupAllowFrom` | 群内发送者白名单 |
| `groups` | 群配置：`"*"` 为全局，`-100xxx` 为群 id |
| `groups.<id>.requireMention` | 群内是否必须 @ 才回复 |
| `groups.<id>.groupPolicy` | 该群策略：`open` / `allowlist` / `disabled` |
| `streaming` | 流式：`off` / `partial` / `block` / `progress` |
| `proxy` | 代理 URL（如 `socks5://...`） |
| `accounts` | 多账号，每账号可单独 `botToken`、`groups` 等 |

**多账号注意**：每个 account 需单独配置 `groups`，channel 级 `groups` 不会自动继承到未配置的 account。

### 8.3 WhatsApp

```json5
{
  "channels": {
    "whatsapp": {
      "enabled": true,
      "dmPolicy": "allowlist",
      "allowFrom": ["+1234567890"],
      "groupPolicy": "allowlist",
      "groupAllowFrom": ["+1234567890"],
      "groups": { "*": { "requireMention": true } },
      "mediaMaxMb": 50
    }
  },
  "web": { "enabled": true }
}
```

WhatsApp 通过 web 渠道（Baileys）运行，需 `channels.web.enabled`。`allowFrom` 为 E.164 号码。

### 8.4 Discord

```json5
{
  "channels": {
    "discord": {
      "enabled": true,
      "token": "bot-token",
      "dmPolicy": "pairing",
      "allowFrom": ["123456789012345678"],
      "guilds": {
        "123456789012345678": {
          "requireMention": true,
          "channels": {
            "general": { "allow": true, "requireMention": true }
          }
        }
      }
    }
  }
}
```

### 8.5 Slack

```json5
{
  "channels": {
    "slack": {
      "enabled": true,
      "botToken": "xoxb-...",
      "appToken": "xapp-...",
      "dmPolicy": "pairing",
      "allowFrom": ["U123"],
      "channels": {
        "C123": { "allow": true, "requireMention": true }
      }
    }
  }
}
```

Socket mode 需同时配置 `botToken` 与 `appToken`。

### 8.6 飞书（Feishu）

```json5
{
  "channels": {
    "feishu": {
      "enabled": true,
      "appId": "cli_xxx",
      "appSecret": "...",
      "domain": "feishu",
      "groupPolicy": "open",
      "requireMention": true
    }
  }
}
```

---

## 九、gateway（网关）

```json5
{
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "your-secret-token"
    },
    "tailscale": {
      "mode": "off"
    }
  }
}
```

| 字段 | 说明 |
|------|------|
| `port` | 监听端口 |
| `mode` | `local` / `remote` 等 |
| `bind` | 绑定地址（如 `loopback`、`0.0.0.0`） |
| `auth.mode` | `token` / `none` 等 |
| `auth.token` | 用于 API 调用的 token |

---

## 十、commands（命令）

```json5
{
  "commands": {
    "native": "auto",
    "nativeSkills": "auto",
    "restart": true,
    "text": true,
    "bash": false,
    "config": false,
    "debug": false
  }
}
```

| 字段 | 说明 |
|------|------|
| `native` | 原生命令（Telegram 菜单等）：`auto` / `true` / `false` |
| `nativeSkills` | 技能相关原生命令 |
| `restart` | 是否允许 `/restart` |
| `config` | 是否允许 `/config` |
| `bash` | 是否允许 `!` 执行 shell（需 elevated 权限） |

---

## 十一、session（会话）

```json5
{
  "session": {
    "dmScope": "per-channel-peer",
    "reset": {
      "mode": "daily",
      "atHour": 4,
      "idleMinutes": 60
    }
  }
}
```

| 字段 | 说明 |
|------|------|
| `dmScope` | DM 会话隔离：`main` / `per-peer` / `per-channel-peer` / `per-account-channel-peer` |
| `reset.mode` | `daily` 每日 / `idle` 闲置 |
| `reset.atHour` | 每日重置时间（0–23） |
| `reset.idleMinutes` | 闲置多少分钟后重置 |

---

## 十二、hooks 与 plugins

```json5
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "boot-md": { "enabled": true },
        "session-memory": { "enabled": true }
      }
    }
  },
  "plugins": {
    "entries": {
      "telegram": { "enabled": true },
      "feishu": { "enabled": true }
    },
    "installs": {
      "feishu": {
        "source": "npm",
        "spec": "@openclaw/feishu",
        "version": "2026.3.2"
      }
    }
  }
}
```

---

## 十三、skills

```json5
{
  "skills": {
    "install": {
      "nodeManager": "npm"
    }
  }
}
```

---

## 十四、常见配置任务

| 任务 | 主要字段 |
|------|----------|
| 增加渠道 | `channels.<id>.enabled`、`botToken`、`allowFrom` |
| 多智能体 | `agents.list` + `bindings` |
| 群组放行 | `channels.telegram.groups`、`groupAllowFrom` |
| 更换模型 | `agents.defaults.model.primary`、`models.providers` |
| 代理 | `channels.telegram.proxy` |
| 心跳 | `agents.defaults.heartbeat.every` |

---

## 十五、校验与排错

```bash
openclaw config validate     # 校验配置
openclaw doctor              # 诊断问题
openclaw doctor --fix        # 尝试自动修复
openclaw channels status     # 渠道状态
openclaw logs --follow       # 实时日志
```

配置错误时 Gateway 会拒绝启动，仅 `openclaw doctor`、`openclaw logs` 等诊断命令可用。

---

## 十六、参考

- [Configuration Reference](https://docs.openclaw.ai/gateway/configuration-reference)（完整字段参考）
- [Configuration Examples](https://docs.openclaw.ai/gateway/configuration-examples)（示例配置）
- [Telegram Channel](https://docs.openclaw.ai/channels/telegram)
- [Multi-Agent Routing](https://docs.openclaw.ai/concepts/multi-agent)
- [配置多个 Telegram 机器人完整指南](/lab/telegram/multi-bots)
