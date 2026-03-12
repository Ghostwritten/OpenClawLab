---
title: 禁用渠道或机器人手册
description: 临时停用飞书、Telegram、Slack 等渠道或单个机器人的配置方法
layout: doc
---

# 禁用渠道或机器人手册

当需要临时停用某个渠道（如飞书、Telegram、Slack）或其中某个机器人时，只需在配置中关闭对应开关，无需删除配置或卸载插件。重启 Gateway 后生效。

---

## 一、适用场景

- 临时停用飞书、Telegram、Slack 等某一渠道
- 多机器人时只关闭其中一个账号
- 下线测试用 bot，保留生产用 bot

---

## 二、配置位置

主配置文件：**`~/.openclaw/openclaw.json`**（或由 `OPENCLAW_CONFIG_PATH` 指定）。

- 渠道总开关：`channels.<渠道名>.enabled`
- 多账号时单 bot：`channels.<渠道名>.accounts.<accountId>.enabled`

---

## 三、按渠道操作

### 3.1 飞书（Feishu）

关闭整个飞书渠道：

```json
"channels": {
  "feishu": {
    "enabled": false,
    "appId": "...",
    "appSecret": "...",
    ...
  }
}
```

将 `enabled` 设为 `false` 即可，其余配置可保留，便于日后重新启用。

### 3.2 Telegram

**关闭整个 Telegram 渠道：**

```json
"channels": {
  "telegram": {
    "enabled": false,
    ...
  }
}
```

**只关闭其中某个机器人（多账号时）：**

在 `channels.telegram.accounts` 下找到对应 `accountId`，将该账号的 `enabled` 设为 `false`：

```json
"channels": {
  "telegram": {
    "enabled": true,
    "accounts": {
      "product_manager": { "enabled": true, ... },
      "news": { "enabled": false, ... }
    }
  }
}
```

### 3.3 其他渠道（WhatsApp、Slack、Discord 等）

同样在 `channels.<渠道名>` 下：

- 整渠道关闭：`"enabled": false`
- 多账号时：在对应 `accounts.<id>` 下设 `"enabled": false`

---

## 四、命令行操作

### 4.1 使用 `config set` 关闭渠道或账号

**关闭整个渠道（如飞书）：**

```bash
openclaw config set channels.feishu.enabled false --json
```

**关闭整个 Telegram 渠道：**

```bash
openclaw config set channels.telegram.enabled false --json
```

**多账号时只关闭某个 Telegram 账号**（将 `news` 换成目标 accountId）：

```bash
openclaw config set 'channels.telegram.accounts.news.enabled' false --json
```

**恢复启用**（以飞书为例）：

```bash
openclaw config set channels.feishu.enabled true --json
```

执行后需**重启 Gateway** 才生效。

### 4.2 使用 `channels remove` 禁用账号（保留配置）

对支持多账号的渠道（如 Telegram、Discord、Slack），可只禁用某个账号而不删配置：

```bash
openclaw channels remove --channel telegram --account news
```

按提示确认后，会将对应账号的 `enabled` 设为 `false`，配置保留。若加 `--delete` 则会删除该账号的配置条目。

**注意**：飞书等单账号渠道若没有 `setAccountEnabled` 支持，可能需用 4.1 的 `config set channels.feishu.enabled false` 关闭整渠道。

---

## 五、界面操作

### 5.1 Onboarding 向导

运行 `openclaw onboard` 或渠道配置向导时，已配置的渠道会列出；可选择 **disable** 将某渠道或某账号设为禁用（仅改 `enabled`，不删配置）。

### 5.2 macOS 应用与 Web Control UI

- **macOS 应用**：打开 **设置 → Channels** 可查看各渠道的配置与运行状态（如 configured / running / connected）。
- **Web Control UI**：Gateway 启动后访问控制台（默认 `http://127.0.0.1:18789/`），可查看渠道状态与配置。

界面主要用于**查看状态**；渠道的启用/禁用通常需通过**命令行**（见第四节）或**直接编辑配置文件**（见第六节）完成。

---

## 六、直接编辑配置文件

1. **备份**：`cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.bak`
2. **编辑**：打开 `openclaw.json`，找到目标渠道或账号，将 `enabled` 改为 `false`。
3. **重启**：重启 Gateway（macOS 可通过 OpenClaw 应用重启；或 `openclaw gateway restart` / 先 stop 再 start）。
4. **验证**：`openclaw channels status` 或 `openclaw channels status --probe`，确认该渠道/账号为 disabled 或不可用。

---

## 七、恢复启用

- **命令行**：`openclaw config set channels.<渠道>.enabled true --json`（多账号时用 `channels.<渠道>.accounts.<id>.enabled`）。
- **配置文件**：将对应 `enabled` 改回 `true`，保存后重启 Gateway 即可。无需重新配置 token 或 bindings。

---

## 八、注意事项

- **只改 `enabled`**：不要删除整段渠道或账号配置，否则恢复时需重新填写 appId、token、bindings 等。
- **bindings**：禁用某账号后，绑定到该账号的 `agentId` 将不再收到该渠道消息；无需改 bindings，启用后自动恢复。
- **插件**：禁用渠道不会卸载对应插件（如 `@openclaw/feishu`），插件仍保留在 `plugins.installs` 中，重新开启渠道即可使用。

---

## 九、参考

- [openclaw.json 配置说明手册](/lab/config/reference)
- [配置多个 Telegram 机器人完整指南](/lab/telegram/multi-bots)
