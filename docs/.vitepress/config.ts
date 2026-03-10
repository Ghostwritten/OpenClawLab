import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/OpenClawLab/',
  title: 'OpenClawLab',
  description: 'OpenClaw 知识库 — 从入门到精通',
  lang: 'zh-CN',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'OpenClawLab',
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'Skills', link: '/skills/' },
      { text: 'Agent', link: '/agent/' },
      {
        text: '资源',
        items: [
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
        text: '📖 完整指南',
        items: [
          { text: 'OpenClaw 完整指南', link: '/guide/' }
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
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Ghostwritten/OpenClawLab' }
    ],
    footer: {
      message: '基于 OpenClaw 官方文档整理',
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
