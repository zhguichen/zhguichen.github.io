# Jason / Notes

一个中文优先的个人笔记站点，记录技术、运动、生活与其他兴趣。使用 Astro 在构建期输出静态文件；浏览器端没有 React、Vue 或主题运行时。

## 本地开发

```bash
npm install
npm run dev
```

构建生产文件：

```bash
npm run build
```

构建结果位于 `dist/`。推送到 `hexo` 分支后，GitHub Actions 会构建并通过 GitHub Pages 发布。

## 写一篇笔记

在 `src/content/notes/` 新建一个 Markdown 文件：

```yaml
---
title: 文章标题
slug: english-url-slug
description: 用一句话说明文章解决的问题。
date: 2026-08-03T12:00:00+08:00
topic: 算法
tags: [算法, C++]
featured: false
draft: false
---
```

`draft: true` 的文章会保留在仓库中，但不会生成公开页面、RSS 或站点地图。文章图片请放到 `public/images/notes/<文章名>/`，并在 Markdown 中以 `/images/notes/<文章名>/图片名.png` 引用。
