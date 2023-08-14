<div align="center">
<img src="https://avatars.githubusercontent.com/u/129276618?s=200&v=4" height="150" width="150" alt="IdeaLeap Logo">
<h1>GWT</h1></div>

<p align="center">
<img src="https://wakatime.com/badge/user/5bfd81bc-9515-462b-a942-069791b283b7/project/af5f20a2-48c4-4ffb-81b8-7c330a9ee330.svg?style=flat-square"  alt="Develop time"/>

</p>
<p align="center">基于GWT理论构建的LLM Agent 智能系统框架，不基于LangchainJs!</p>

## 🎨 技术栈

- Openai
- Jest
- Typescript
- Vitepress
- Eslint
- Prettier
- MarkdownLint
- Github Actions
- Vercel Ncc

## Misc

发包时由于使用 ES module，Node.js 内置的 __filename 与__dirname 就变得不可用了，需要使用 url 模块的 fileURLToPath 方法将 import.meta.url 转换为文件路径，然后再使用 path 模块的 dirname 方法获取文件所在目录的路径。

```js
import {fileURLToPath} from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

```

## 📄 作者

(C) 2023 Marlene, Idealeap
