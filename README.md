# Jason's Notes

A bilingual (English-first) technical research-notes site about AI engineering, agents, RAG, open-source tools, and algorithms. Built with Astro, output as static files at build time; no React, Vue, or client-side runtime.

## Local development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

The build output is in `dist/`. Pushing to `main` triggers a GitHub Actions build and publishes via GitHub Pages.

## Bilingual structure

The site is English-first by default. Every note lives in one of two language folders inside `src/content/notes/`:

```
src/content/notes/
  en/   # English versions
  zh/   # Chinese versions
  assets/  # shared images, referenced with ../assets/...
```

URLs follow this convention:

- English: `/notes/<slug>/`
- Chinese: `/zh/notes/<slug>/`
- Root `/` is the English homepage; `/zh/` is the Chinese homepage.

Each note declares its language in front matter with `lang: en` or `lang: zh`. A note can exist in only one language (e.g., older algorithm notes are Chinese-only), but the recommended practice is to publish both.

## Writing a note

Create a Markdown file in `src/content/notes/zh/` (and the matching English version in `src/content/notes/en/`):

```yaml
---
title: 文章标题
slug: english-url-slug
lang: zh
description: 用一句话说明文章解决的问题。
date: 2026-08-03T12:00:00+08:00
cover: ../assets/example/hero.png
topic: 算法
tags: [算法, C++]
featured: false
draft: false
---
```

- `slug` is shared across the two languages and becomes the URL path.
- `lang` is `en` or `zh`.
- `description` is the summary used on the homepage, list pages, RSS, and search. Keep it to one sentence: state the core claim first, then the most important fact or conclusion. Don't repeat the title, and don't cram every number, background, and argument in. Keep it short and readable. For example: `机器人会跑不等于会干活：近期真正能规模化落地的更可能是工厂和仓库。`
- `cover` is the share and cover image, relative to the current Markdown file; Astro processes it at build time. Images in the article body go in the same article's `assets/` directory (under `src/content/notes/assets/`) and are referenced with a relative path:

```markdown
![图片说明](../assets/example/hero.png)
```

If an image lives in `public/`, use `coverUrl` for the share image:

```yaml
coverUrl: /images/notes/example/hero.png
```

With `cover` or `coverUrl`, the article's Open Graph and Twitter share image uses it; otherwise `public/og-default.png` is used. Notes marked `draft: true` stay in the repo but don't generate public pages, RSS, or sitemap entries.

When publishing, add the English version in `src/content/notes/en/` with the same `slug`, `lang: en`, and a `description` in English.
