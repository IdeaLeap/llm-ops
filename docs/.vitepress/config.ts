import { defineConfig } from "vitepress";

export default defineConfig({
  title: "LLM Ops",
  description: "助力AIGC落地应用、高效开发llm workflow的低代码TS框架",
  lang: "zh-CN",
  lastUpdated: true,
  markdown: { attrs: { disable: true } },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/" },
      { text: "API", link: "/api/" },
      { text: "Preview", link: "https://preview.idealeap.cn/"}
    ],

    sidebar: {
      "/guide": [
        {
          text: "开始",
          items: [{ text: "简介", link: "/guide/" },{ text: "快速上手", link: "/guide/start" }],
        },
      ],
    },
    editLink: {
      pattern: "https://github.com/idealeap/llm-ops/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    lastUpdatedText: "Last Updated",

    socialLinks: [
      { icon: "github", link: "https://github.com/IdeaLeap/llm-ops" },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2023-present Marlene & IdeaLeap",
    },
  },
});
