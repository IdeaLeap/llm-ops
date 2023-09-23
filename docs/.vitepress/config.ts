import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "LLM Ops",
  description: "高效制作llm workflow的低代码框架",
  lang: "en-US",
  lastUpdated: true,
  markdown: { attrs: { disable: true } },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/model" },
      { text: "API", link: "/api/" },
    ],

    sidebar: {
      "/guide": [
        {
          text: "LLM Ops",
          items: [{ text: "model", link: "/guide/model" }],
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
