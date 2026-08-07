# Jason's Notes

一个中文优先的技术研究笔记站点，记录 AI 工程、Agent、RAG、开源工具与算法等主题。使用 Astro 在构建期输出静态文件；浏览器端没有 React、Vue 或主题运行时。

## 本地开发

```bash
npm install
npm run dev
```

构建生产文件：

```bash
npm run build
```

构建结果位于 `dist/`。推送到 `main` 分支后，GitHub Actions 会构建并通过 GitHub Pages 发布。

## 写一篇笔记

在 `src/content/notes/` 新建一个 Markdown 文件：

```yaml
---
title: 文章标题
slug: english-url-slug
description: 用一句话说明文章解决的问题。
date: 2026-08-03T12:00:00+08:00
cover: ./assets/example/hero.png
topic: 算法
tags: [算法, C++]
featured: false
draft: false
---
```

`description` 是文章在首页、列表页、RSS 和搜索摘要中的简介。建议只写一句话，先给出文章的核心判断，再补充最关键的事实或结论；不要重复标题，也不要把正文中的所有数据、背景和论据都塞进去。整体控制在简洁、易读的长度，例如：`机器人会跑不等于会干活：近期真正能规模化落地的更可能是工厂和仓库。`

`cover` 是文章的分享图和封面图，路径相对于当前 Markdown 文件；Astro 会在构建时处理它。文章正文中的图片可以放在同一文章目录下的 `assets/` 中，并使用相对路径引用：

```markdown
![图片说明](assets/example/hero.png)
```

如果图片位于 `public/`，可以使用 `coverUrl` 指定分享图：

```yaml
coverUrl: /images/notes/example/hero.png
```

有 `cover` 或 `coverUrl` 时，文章的 Open Graph 和 Twitter 分享图会使用它；没有指定时使用 `public/og-default.png`。`draft: true` 的文章会保留在仓库中，但不会生成公开页面、RSS 或站点地图。
