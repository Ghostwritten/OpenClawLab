import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/OpenClawLab/',
  title: 'OpenClawLab',
  description: 'OpenClaw 知识库 — 从入门到精通',
  lang: 'zh-CN',
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'description', content: 'OpenClaw 中文知识库：从入门到精通，覆盖 Agent、Skills、多机器人实战与最佳实践' }],
    ['meta', { property: 'og:title', content: 'OpenClawLab — OpenClaw 知识库' }],
    ['meta', { property: 'og:description', content: '由社区整理的 OpenClaw 实战知识库，覆盖配置、多 Agent 与最佳实践' }],
    ['meta', { property: 'og:type', content: 'website' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'OpenClawLab',
    editLink: {
      pattern: 'https://github.com/Ghostwritten/OpenClawLab/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'Skills', link: '/skills/' },
      { text: 'Agent', link: '/agent/' },
      { text: 'Lab 实战', link: '/lab/' },
      {
        text: '资源',
        items: [
          { text: '关于本项目', link: '/about/' },
          { text: '常见问题', link: '/faq/' },
          { text: 'OpenClaw 官网', link: 'https://openclaw.ai' },
          { text: '官方文档', link: 'https://docs.openclaw.ai' },
          { text: 'GitHub', link: 'https://github.com/openclaw/openclaw' },
          { text: 'ClawHub', link: 'https://clawhub.ai' },
          { text: 'Discord', link: 'https://discord.gg/clawd' }
        ]
      }
    ],
    sidebar: [
      {
        text: '📖 指南',
        items: [
          { text: '5 分钟上手', link: '/quickstart/' },
          { text: 'OpenClaw 完整指南', link: '/guide/' },
          { text: '常见问题', link: '/faq/' }
        ]
      },
      {
        text: '🧩 Skills 指南',
        items: [
          { text: 'Skills 完全指南', link: '/skills/' }
        ]
      },
      {
        text: '🤖 Agent 指南',
        items: [
          { text: 'Agent 完全指南', link: '/agent/' }
        ]
      },
      {
        text: '📦 版本更新',
        items: [
          { text: '版本列表', link: '/releases/' },
          { text: 'v2026.3.11 更新报告', link: '/releases/v2026-3-11' }
        ]
      },
      {
        text: '🦞 OpenClaw Lab 实战',
        collapsed: false,
        items: [
          { text: 'Lab 总览', link: '/lab/' },
          {
            text: '架构与概念',
            items: [
              { text: 'AI Dev Team 架构', link: '/lab/architecture/ai-dev-team' },
              { text: '多智能体协作 Demo', link: '/lab/concepts/multi-agent-demo' },
              { text: '子代理 Sub-Agents', link: '/lab/concepts/subagents-guide' }
            ]
          },
          {
            text: '配置与搭建',
            items: [
              { text: 'Agent 手动配置', link: '/lab/setup/agent-setup-guide' },
              { text: '新增 Telegram 机器人', link: '/lab/telegram/bot-add' },
              { text: '配置多个机器人', link: '/lab/telegram/multi-bots' },
              { text: '机器人配置优化', link: '/lab/telegram/bot-optimize' },
              { text: '渠道选型', link: '/lab/channels/comparison' }
            ]
          },
          {
            text: '工作区定制',
            items: [
              { text: '产品经理', link: '/lab/setup/workspace/product-manager' },
              { text: '架构师', link: '/lab/setup/workspace/architect' },
              { text: '开发工程师', link: '/lab/setup/workspace/dev' },
              { text: '测试工程师', link: '/lab/setup/workspace/qa' },
              { text: 'DevOps', link: '/lab/setup/workspace/ops' },
              { text: '文档工程师', link: '/lab/setup/workspace/docs' },
              { text: '平台管理员', link: '/lab/setup/workspace/admin' }
            ]
          },
          {
            text: '配置参考',
            items: [
              { text: 'openclaw.json 说明', link: '/lab/config/reference' },
              { text: 'tools 配置', link: '/lab/config/tools' },
              { text: '禁用渠道或机器人手册', link: '/lab/config/disable-bots-guide' }
            ]
          },
          { text: 'Agent-Send', link: '/lab/tools/agent-send' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Ghostwritten/OpenClawLab' }
    ],
    footer: {
      message: '社区知识库，与 <a href="https://docs.openclaw.ai">官方文档</a> 互补。详见 <a href="/OpenClawLab/about/">关于本项目</a>。',
      copyright: '© 2025 OpenClawLab. Powered by VitePress.'
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '没有找到相关结果',
            resetButtonTitle: '清除搜索条件',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        }
      }
    },
    returnToTopLabel: '回到顶部',
    outline: {
      label: '页面导航',
      level: [2, 3]
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    }
  }
})
