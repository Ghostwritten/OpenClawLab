# 配置文件中 tools 配置说明

> `~/.openclaw/openclaw.json` 中与工具（tools）相关的配置完整参考。用于控制智能体可调用的工具、执行策略、沙箱与提升权限等。

---

## 一、概述

OpenClaw 通过 `tools` 配置控制：

1. **工具策略**：哪些工具可用（profile / allow / deny / byProvider）
2. **提升权限**：elevated exec 在主机上执行
3. **具体工具**：exec、web、media、fs、sessions 等的参数
4. **沙箱工具策略**：沙箱内额外限制

全局配置在 `tools` 下，每 agent 可在 `agents.list[].tools` 下覆盖。

---

## 二、工具策略（profile / allow / deny）

### 2.1 tools.profile（基础允许列表）

`tools.profile` 定义基础工具集合，在 allow/deny 之前生效。

| Profile   | 包含的工具 |
|-----------|------------|
| `minimal` | 仅 `session_status` |
| `coding`  | `group:fs`、`group:runtime`、`group:sessions`、`group:memory`、`image` |
| `messaging` | `group:messaging`、`sessions_list`、`sessions_history`、`sessions_send`、`session_status` |
| `full`    | 无限制（等同于未设置） |

每 agent 覆盖：`agents.list[].tools.profile`。

```json5
{
  "tools": {
    "profile": "coding"
  }
}
```

### 2.2 tools.allow / tools.deny

全局工具允许/拒绝策略，**deny 优先**。不区分大小写，支持 `*` 通配符。

```json5
{
  "tools": {
    "deny": ["browser", "canvas"]
  }
}
```

若同时使用 allow 和 deny，allow 为白名单，deny 可进一步剔除。未启用 Docker 沙箱时也会生效。

### 2.3 tools.byProvider（按模型/提供商限制）

为特定 provider 或 `provider/model` 进一步限制工具（只能更严，不能放宽）。

```json5
{
  "tools": {
    "profile": "coding",
    "byProvider": {
      "google-antigravity": { "profile": "minimal" },
      "openai/gpt-5.2": { "allow": ["group:fs", "sessions_list"] }
    }
  }
}
```

优先级：profile → provider profile → allow/deny。

---

## 三、工具组（group:*）

在 allow/deny 中可使用 `group:*` 简写，展开为多个具体工具：

| 组               | 包含的工具 |
|------------------|------------|
| `group:runtime`  | `exec`、`bash`、`process` |
| `group:fs`       | `read`、`write`、`edit`、`apply_patch` |
| `group:sessions` | `sessions_list`、`sessions_history`、`sessions_send`、`sessions_spawn`、`session_status` |
| `group:memory`   | `memory_search`、`memory_get` |
| `group:web`      | `web_search`、`web_fetch` |
| `group:ui`       | `browser`、`canvas` |
| `group:automation` | `cron`、`gateway` |
| `group:messaging`  | `message` |
| `group:nodes`    | `nodes` |
| `group:openclaw` | 所有内置 OpenClaw 工具（不含插件） |

示例：只允许消息与会话相关工具：

```json5
{
  "tools": {
    "profile": "messaging",
    "allow": ["slack", "discord"]
  }
}
```

---

## 四、每 Agent 覆盖

`agents.list[].tools` 可覆盖全局 tools 策略：

```json5
{
  "tools": { "profile": "coding" },
  "agents": {
    "list": [
      {
        "id": "support",
        "tools": {
          "profile": "messaging",
          "allow": ["slack"],
          "deny": ["exec"]
        }
      }
    ]
  }
}
```

---

## 五、tools.elevated（提升权限）

控制 `exec` 是否可在**主机**上执行（绕过沙箱）。用于需要直接访问主机时。

```json5
{
  "tools": {
    "elevated": {
      "enabled": true,
      "allowFrom": {
        "whatsapp": ["+1234567890"],
        "telegram": [123456789],
        "discord": ["123456789012345678"]
      }
    }
  }
}
```

- `enabled`：是否启用 elevated
- `allowFrom.<channel>`：各渠道允许使用 elevated 的发送者（号码、用户 ID 等）
- 每 agent 可在 `agents.list[].tools.elevated` 进一步收紧（不能放宽）

会话内可通过 `/elevated on|off|ask|full` 切换，但需在 allowFrom 中。

---

## 六、tools.exec

exec 工具的参数与限制：

```json5
{
  "tools": {
    "exec": {
      "backgroundMs": 10000,
      "timeoutSec": 1800,
      "cleanupMs": 1800000,
      "notifyOnExit": true,
      "notifyOnExitEmptySuccess": false,
      "applyPatch": {
        "enabled": false,
        "allowModels": ["gpt-5.2"]
      }
    }
  }
}
```

| 字段 | 说明 |
|------|------|
| `backgroundMs` | 后台执行判定时长（ms） |
| `timeoutSec` | 执行超时（秒） |
| `cleanupMs` | 后台进程清理间隔 |
| `notifyOnExit` | 进程退出时是否发系统事件 |
| `applyPatch.enabled` | 是否允许 apply_patch |
| `applyPatch.allowModels` | 允许使用 apply_patch 的模型 |

---

## 七、tools.web

网络搜索与抓取：

```json5
{
  "tools": {
    "web": {
      "search": {
        "enabled": true,
        "provider": "brave",
        "apiKey": "brave_api_key",
        "maxResults": 5,
        "timeoutSeconds": 30
      },
      "fetch": {
        "enabled": true,
        "maxChars": 50000,
        "timeoutSeconds": 30
      }
    }
  }
}
```

---

## 八、tools.media

图片/音频/视频理解与转录：

```json5
{
  "tools": {
    "media": {
      "concurrency": 2,
      "audio": {
        "enabled": true,
        "maxBytes": 20971520,
        "models": [
          { "provider": "openai", "model": "gpt-4o-mini-transcribe" }
        ]
      },
      "video": {
        "enabled": true,
        "maxBytes": 52428800,
        "models": [{ "provider": "google", "model": "gemini-2.0-flash-vision" }]
      }
    }
  }
}
```

---

## 九、tools.fs（文件系统）

文件系统工具路径限制：

```json5
{
  "tools": {
    "fs": {
      "workspaceOnly": true
    }
  }
}
```

- `workspaceOnly: true`：read/write/edit/apply_patch 只能在工作区内访问。

---

## 十、tools.sandbox（沙箱内工具策略）

启用 Docker 沙箱时，可单独限制沙箱内可用工具：

```json5
{
  "tools": {
    "sandbox": {
      "tools": {
        "allow": ["group:fs", "group:sessions", "read", "sessions_list"],
        "deny": ["exec", "browser"]
      }
    }
  }
}
```

每 agent 可在 `agents.list[].tools.sandbox.tools` 覆盖。

---

## 十一、tools.sessions

控制 session 工具可访问的会话范围：

```json5
{
  "tools": {
    "sessions": {
      "visibility": "tree"
    }
  }
}
```

| visibility | 说明 |
|------------|------|
| `self` | 仅当前会话 |
| `tree` | 当前会话及其子会话（默认） |
| `agent` | 当前 agent 下的所有会话 |
| `all` | 所有会话（跨 agent 还需 `tools.agentToAgent`） |

---

## 十二、tools.agentToAgent

是否允许跨 agent 调用（如 sessions_spawn 到其他 agent）：

```json5
{
  "tools": {
    "agentToAgent": {
      "enabled": false,
      "allow": ["home", "work"]
    }
  }
}
```

---

## 十三、tools.loopDetection

工具调用环路检测（默认关闭）：

```json5
{
  "tools": {
    "loopDetection": {
      "enabled": true,
      "historySize": 30,
      "warningThreshold": 10,
      "criticalThreshold": 20,
      "globalCircuitBreakerThreshold": 30
    }
  }
}
```

---

## 十四、与沙箱的关系

- **沙箱**（`agents.defaults.sandbox`）：决定工具在**哪里**运行（Docker vs 主机）
- **工具策略**：决定**哪些**工具可用
- **Elevated**：exec 的「在主机执行」开关

三者独立：工具被 deny 时，即使启用 elevated 也无法使用；elevated 只影响 exec 的执行位置。

---

## 十五、常见配置示例

| 需求 | 配置要点 |
|------|----------|
| 禁用 browser/canvas | `tools: { deny: ["browser", "canvas"] }` |
| 仅消息与会话 | `tools: { profile: "messaging" }` |
| 禁用 exec | `tools: { deny: ["exec", "group:runtime"] }` |
| 限制 elevated 发送者 | `tools.elevated.allowFrom.<channel>` |
| 沙箱内禁用 exec | `tools.sandbox.tools.deny: ["exec"]` |
| 仅工作区内读写 | `tools.fs.workspaceOnly: true` |

---

## 十六、参考

- [Tools](https://docs.openclaw.ai/tools)（工具总览）
- [Sandbox vs Tool Policy vs Elevated](https://docs.openclaw.ai/gateway/sandbox-vs-tool-policy-vs-elevated)
- [Elevated Mode](https://docs.openclaw.ai/tools/elevated)
- [Configuration Reference - Tools](https://docs.openclaw.ai/gateway/configuration-reference#tools)
- [openclaw.json 配置说明手册](/lab/config/reference)
