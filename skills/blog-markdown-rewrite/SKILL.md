---
name: blog-markdown-rewrite
description: Rewrite Markdown blog posts from a local repository through the user's ChatGPT Blog project, using the project's 改写规范.md as the rewrite specification, then copy complete results back into the repository and validate them. Use when the user asks to polish, rewrite, or batch-process repository Markdown with ChatGPT Blog.
---

# Blog Markdown 改写

## 目标

将本地仓库中的 Markdown 文章交给用户 ChatGPT 的 Blog 项目改写：每篇文章使用独立聊天，直接粘贴原始 Markdown，引用项目来源中的《改写规范.md》，取得完整 Markdown 后回写原文件并校验差异。

## 工作流

1. 定位用户明确指定的 Markdown 文件。使用 `rg --files` 或 `rg --files | rg`，只读取目标文件及其必要的上下文，不把无关文件或凭据粘贴到聊天中。先记录每个文件的绝对路径。

2. 打开用户的 ChatGPT Blog 项目。在项目的“来源”中确认存在《改写规范.md》。把它作为本次改写规范的唯一来源；不要把规范内容重新硬编码进 prompt，也不要自行追加一套风格要求。

3. 为每个目标文件在 Blog 项目下新建一个独立聊天。直接把完整 Markdown 粘贴到聊天输入框，不使用文件上传。使用下面的 prompt 结构，并将原文放在明确的 Markdown 代码块中：

   ```text
   请按照本项目来源中的《改写规范.md》改写下面的 Markdown，返回一份可直接替换仓库原文件的完整 Markdown。

   请保留原文件的 YAML front matter、图片 Markdown 及相对路径、链接和必要的 Markdown 结构。完整结果放在一个 markdown 代码块中，代码块外不要输出说明。

   原文件：
   ```markdown
   [完整原文]
   ```
   ```

   不要把被用户明确删除的旧版 prompt 要求加回来。每个聊天只处理一个目标文件，并在 prompt 中明确文件用途或原文件名。

4. 等待 ChatGPT 完整输出。优先使用“复制回复”取得原始 Markdown；如果界面把结果显示为代码块，只去掉最外层的 `markdown` 代码围栏，不改写正文内容。确认结果以 YAML front matter 开始，并保留原文引用的图片路径。

5. 将结果写回对应的绝对路径。使用 `apply_patch` 编辑文件，不使用 shell 重定向、`cat` 或脚本直接覆写。写回前后保持目标文件和聊天结果一一对应，避免交叉粘贴。

6. 完成后运行 `git diff --check -- <目标文件>`，检查 front matter、图片路径、Markdown 代码围栏和文件结尾；必要时查看 `git diff --stat`。不要自动提交或推送，除非用户另行要求。

## 交付要求

最终说明已处理的文件、校验结果和仍需用户判断的事项。若 ChatGPT 输出不完整、缺少 front matter 或图片路径，不要回写；在同一聊天中要求它重新输出完整源文后再继续。
