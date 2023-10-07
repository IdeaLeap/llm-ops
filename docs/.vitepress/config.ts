import { defineConfig } from "vitepress";

export default defineConfig({
  title: "LLM Ops",
  description: "助力AIGC落地应用、高效开发llm workflow的低代码TS框架",
  lang: "zh-CN",
  lastUpdated: true,
  markdown: { attrs: { disable: true } },
  head: [
    [
      "script",
      {
        async: "async",
        src: "https://umami.marlene.top/umami.js",
        "data-website-id": "8082e8f8-4d08-46ac-b089-bd883ab4c637",
        "data-domains": "ops.idealeap.cn,preview.idealeap.cn",
      },
    ],
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { name: "description", content: "LLM-OPS" }],
    ["meta", { property: "og:url", content: "https://ops.idealeap.cn/" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "LLM-OPS | IdeaLeap" }],
    ["meta", { property: "og:description", content: "LLM-OPS" }],
    ["meta", { property: "og:image", content: "/og.jpg" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    [
      "meta",
      {
        property: "twitter:domain",
        content: "助力AIGC落地应用、高效开发llm workflow的低代码TS框架",
      },
    ],
    ["meta", { property: "twitter:url", content: "https://ops.idealeap.cn/" }],
    ["meta", { name: "twitter:title", content: "LLM-OPS | IdeaLeap" }],
    ["meta", { name: "twitter:description", content: "LLM-OPS" }],
    ["meta", { name: "twitter:image", content: "/og.jpg" }],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
    ],
    ["link", { rel: "manifest", href: "/site.webmanifest" }],
    [
      "link",
      { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#5bbad5" },
    ],
    ["meta", { name: "msapplication-TileColor", content: "#2b5797" }],
  ],
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/" },
      { text: "API", link: "/api/" },
      { text: "Preview", link: "https://preview.idealeap.cn/" },
    ],

    sidebar: {
      "/guide": [
        {
          text: "开始",
          items: [
            { text: "简介", link: "/guide/" },
            { text: "快速上手", link: "/guide/start" },
          ],
        },
        { text: "部署", link: "/guide/deploy" },
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
