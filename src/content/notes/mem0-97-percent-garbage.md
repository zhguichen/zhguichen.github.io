---
title: Mem0 融了 2400 万美元，也存下了 97.8% 的垃圾
slug: mem0-97-percent-garbage
description: Mem0 宣布完成 2400 万美元融资的同时，一份独立审计显示它 32 天存下的 10134 条记忆里 97.8% 是垃圾：agent 记忆的商业化跑在了可验证的质量前面。
date: 2026-08-05T00:00:00+08:00
topic: AI 工程
tags: [AI Agent, 记忆, 商业化]
featured: false
draft: false
---

# Mem0 融了 2400 万美元，也存下了 97.8% 的垃圾

![堆满揉皱废纸的巨大记忆仓库中，只有角落一小格货架放着金条，象征 97.8% 垃圾与少量真实价值](assets/mem0-memory-junk/hero.jpg)

2026 年 3 月 27 日，GitHub 上出现了 agent 记忆领域一年来最刺眼的一份生产报告。一个开发者在自己搭的配置里把 Mem0 接进 agent，跑了 32 天，用脚本剔除重复条目后，逐条读完了剩下的 6,264 条记忆。结论是：32 天里存下的全部 10,134 条记忆（含重复）97.8% 是垃圾。垃圾长这样：3,200 条在复读系统提示词，668 条是同一个幻觉的复制品，还有 130 条把 IP 地址、聊天 ID 和文件路径存进了向量库，其余是心跳日志、过期的任务状态和编造的用户画像。224 条逃过了清理，其中 186 条残缺需要重写，能原样保留的只有 38 条。

同一个时期，Mem0 的商业故事是另一幅图景。2025 年 10 月它宣布完成 2,400 万美元融资，Y Combinator、Peak XV 和 GitHub 基金参与；通稿说 AWS 把它选为新 Agent SDK 的独家记忆提供商；云 API 调用量三个季度从 3,500 万涨到 1.86 亿（均为厂商披露数字）。GitHub 星标 4.1 万，PyPI 下载量破千万。

两个数字放在一起，构成这篇文章要讲的问题：agent 记忆的商业化，跑在了可验证的质量前面。

## 提取是瓶颈，不是模型

为什么会存进这么多垃圾？审计者把原因钉在提取环节。Mem0 的默认流程是用一个宽松的提示词让模型把对话"总结成记忆"，然后直接进向量库，中间没有质量门。换更强的模型没有救：作者在第 21 天从 gemma2 换到 Sonnet，幻觉消失了，但换模型后最后一批的垃圾率只从 97.7% 降到 89.6%，全程合计仍然是 97.8%——更忠实的模型反而把系统架构、工具配置、临时任务状态原样存了进来。真正危险的是反馈回路：一条"用户偏好 Vim"的幻觉被存进去之后，下次会话它出现在召回上下文里，提取模型把它当事实再存一遍。808 条 Vim 偏好，没人用 Vim（[issue #4573](https://github.com/mem0ai/mem0/issues/4573)）。

审计者的原话是："换更好的模型只会更忠实地执行宽松的提取提示词，提取提示词才是瓶颈，不是模型。" 这解释了一个反直觉的现象：记忆质量跟不上，不是模型不够强，而是整个管线在设计上就没有过滤和验证环节。审计者点名对比：Stanford Generative Agents、LangMem、Letta 都在存储前给候选打分，Mem0 默认不做。

这不是孤立案例。另一位开发者用 Mem0 商业 API 做了 5 道事实回忆测试，全错，根因是同一处："不是 Mem0 找不到针，是它一开始就没把针放进可搜索的干草堆"（[Medium 实测](https://medium.com/asymptotic-spaghetti-integration/memthe-ai-memory-challenge-part-1-we-asked-mem0-to-remember-five-things-heres-how-it-did-56713c04a3e8)）。还有开发者实测后被连续注入的三条错误事实劝退，撤回自动提取，退回纯文本摘要（[HN 讨论](https://news.ycombinator.com/item?id=47770220)）。

## 商业化跑得比质量快

如果技术还没收敛，为什么钱和平台都来了？看一遍各家进度就明白，这个赛道的商业信号几乎全部与质量验证脱节：

- **Mem0**：2,400 万美元融资（[TechCrunch](https://techcrunch.com/2025/10/28/mem0-raises-24m-from-yc-peak-xv-and-basis-set-to-build-the-memory-layer-for-ai-apps)）。AWS 集成有两个独立落点：2025 年 7 月官方公告把 Mem0 接进 Neptune Analytics，官方文案称它是"self-improving memory layer"（[AWS 公告](https://aws.amazon.com/about-aws/whats-new/2025/07/amazon-neptune-analytics-mem0-graph-native-memory-in-genai-applications)）；"Agent SDK 独家"的说法则主要来自媒体与 Mem0 自己的通稿，AWS 侧没有对应公告。云调用量的增长数字全部是厂商披露，没有第三方审计。
- **Letta**：2024 年 9 月拿到 1,000 万美元种子轮，Felicis 领投（[官方博客](https://www.felicis.com/blog/letta)），此后没有新融资信号，产品定位从"memory platform"漂移成"stateful agent platform"。
- **Zep**：公开融资规模是四家里最小的，不同来源口径从 50 万到 330 万美元不等；靠开源的时序图引擎 Graphiti 获客，托管服务主打企业级。官方渠道自述 50% 月度 ARR 增长、240 多个客户，同样无独立验证。
- **Cloudflare**：2026 年 4 月发布 Agent Memory 私有测试版，是完整的托管记忆层（自带提取管线），深度绑定 Workers 生态的 Durable Objects 和 Vectorize，定价至今未公布（[官方博客](https://blog.cloudflare.com/introducing-agent-memory)）。

一句话概括：开源指标、融资、平台绑定都在涨，唯独"记忆质量经过独立验证"这一项是空的。为什么钱还来得这么猛？原因到下一节更清楚：不是没人想验证，而是这个领域根本没有公认的验证工具。

## 评测系统整体失灵

![一排指针乱转、表盘碎裂、刻度互相矛盾的测量仪表，代表记忆层评测体系整体失灵](assets/mem0-memory-junk/bench-broken.jpg)

那用什么来证明质量？理论上是 benchmark。现实是这个领域的评测已经烂到无法比较产品。

Mem0 官方文档自报新算法在 LoCoMo 上 92.5 分、LongMemEval 上 94.4 分（[官方评测页](https://docs.mem0.ai/core-concepts/memory-evaluation)），评测脚本放在厂商自己的仓库里（[memory-benchmarks](https://github.com/mem0ai/memory-benchmarks)）。而第三方论文独立复现开源框架，LongMemEval 只拿到 49 分，LoCoMo 57.68 分（[arXiv 2603.04814](https://arxiv.org/html/2603.04814v1)）。先交代口径：这篇论文是 Bricks Technology 的公司 preprint，没经过同行评审，只测了 flat-typed（扁平事实型）一种管线，独立复现跑的是开源框架配一个便宜的提取模型；而 Mem0 的 92.5/94.4 来自 2026 年 4 月的新算法，含托管平台优化，两边版本并不严格对齐。但即使不碰新数字，拿 Mem0 自己公布的旧算法成绩（LoCoMo 71.4、LongMemEval 67.8，[官方博客](https://mem0.ai/blog/ai-memory-benchmarks-in-2026)）和独立复现比，同一基准也差 10 到 19 个百分点。自报高、复现低，方向是一致的。

厂商之间在互相拆台。Mem0 的论文给 Zep 评了 65.99 分，Zep 自己测自己是 75.14 分，声称 Mem0 配置错误；Zep 还指出，Mem0 自己的 LoCoMo 数据里，把整个对话直接塞进上下文（full-context）的基线分数约 73 分，高过 Mem0 的最佳配置约 68 分——记忆系统不如直接塞全文（[Zep 博客](https://blog.getzep.com/lies-damn-lies-statistics-is-mem0-really-sota-in-agent-memory/)）。

独立审计发现基准本身带病：Penfield Labs 审计 LoCoMo 后报告 6.4% 的标准答案本身就是错的，LLM 裁判会接受 63% 的故意错误答案，56% 的逐类对比在统计上与噪声不可区分；LongMemEval 的 S 版本完全装得进现代上下文窗口，"这是上下文窗口测试，不是记忆测试"（[Penfield 审计](https://penfieldlabs.substack.com/p/proposal-a-new-benchmark-for-long)）。行业内已经有人总结得更直白：这些基准"现在主要是在测你的 LLM 会不会阅读"（[Vectorize Manifesto](https://hindsight.vectorize.io/blog/2026/03/23/agent-memory-benchmark)）。

也就是说，今天你看到的任何记忆层分数，都缺一个前提：没有一个中立的、公认的评测存在。

## 但记忆层不是假的

到此为止的论证很容易滑向"记忆层都是营销"。这是错的，而且有对等的独立证据。

首先，记忆系统在某些维度上确实系统性优于长上下文。Mastra 的 Observational Memory 在 LongMemEval 上报 94.87%，同一张表里 full-context 只有 60.2%（[Mastra 评测](https://mastra.ai/research/observational-memory)）。注意两点：这是厂商自报、只被部分独立复现；更关键的是它属于"观察式上下文管理"——两个后台 agent 把对话压缩成文本日志放回上下文，不是提取-检索式的记忆层。它证明的是"记忆范式"的潜力，不是 Mem0 这类产品的现状。

其次，成本差距是真实的。独立团队 Memori 用自己的系统在 LoCoMo 拿到 81.95%，平均每次查询只用 1,294 token，对比直接塞全文的 26,031 token，节省约 20 倍（[Memori 论文](https://arxiv.org/html/2603.19935)）。Bricks 那篇论文也算过账：约 10 万 token 的对话规模下，大约十轮之后记忆系统的累计成本开始低于直接塞全文（[arXiv 2603.04814](https://arxiv.org/html/2603.04814v1)）。跨会话延续、多 agent 共享、数据主权，这些更是长上下文物理上给不了的。

第三，那个 97.8% 的审计者自己也在为记忆层说话："清理后的 224 条确实有价值，所以我们还在用 Mem0；问题是我们读了 10,134 条才找到 38 条干净的，这不是大多数部署能走的路径。" 这正好给出这个领域最准确的画像：价值真实存在，但信噪比极端不稳，而市场没有任何机制帮你分辨。

## 大厂正在把记忆免费化

真正的结构性问题来自上方。2025 年 9 月到 2026 年 6 月，四家大厂把记忆做成了平台层能力，姿态分两类：

**第一方自建**。Anthropic 的 memory tool 已经 GA，没有独立计费，存储后端由开发者自己管理（[官方文档](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)）——等于把"持久化"这个第三方记忆层最核心的价值定价为零。微软在 Agent Framework 里复刻了同一套 file-based 记忆，Markdown 文件、免费随 SDK（[微软博客](https://devblogs.microsoft.com/foundry/memory-build2026)）。Google 把 Memory Bank 做成 Vertex 平台的计费行，第三方整理的官方定价为每 1,000 个事件 0.25 美元（[定价整理](https://www.betterclaw.io/blog/google-vertex-ai-agent-builder)）。Cloudflare 则直接内置在 Workers 里。

**让位与代工**。OpenAI 是例外：Agent SDK 的长期记忆请求被官方以"不计划实现"关闭（[issue #887](https://github.com/openai/openai-agents-python/issues/887)），把生态让给第三方，Mem0 因此成了官方文档化的集成路径。AWS 更极端，自己有 Bedrock AgentCore Memory，却把 Agent SDK 的记忆外包给 Mem0——集成本身有据可查，只是"独家"的表述始终只出现在 Mem0 一侧。这两家说明独立记忆层还有窗口，但窗口的形状是"平台随时可替换的配置项"：AWS 的 SDK 里记忆是 `provider` 字段，换一家只是改配置。

第一方记忆免费化的结果是：开发者已经不再需要为"够用"的记忆付钱。2026 年的主流对比文章把 Claude Code 原生记忆列为与 Mem0 并列的默认选项（[Vectorize 对比](https://vectorize.io/articles/claude-code-memory-vs-mem0-vs-hindsight)），Mem0 的官方博客也开始写"为什么还要用 Mem0"这种防御性文章（[Mem0 博客](https://mem0.ai/blog/claude-code-memory)）。

## 两年没解决的遗忘问题

社区侧的情绪比任何厂商叙事都说明问题。记忆层的需求共识从来没有争议——没有人质疑 agent 需要记忆。争议全在实现质量。从 2024 年 9 月 Mem0 首发时有人问"有没有遗忘机制"，回答是"计划中"（[Show HN](https://news.ycombinator.com/item?id=41447317)），到 2026 年 6 月新项目 Mnemo 被问同样的问题，回答变成"在 v0.2.0 的路线图上"（[Show HN](https://news.ycombinator.com/item?id=48389586)）。两年过去，遗忘、矛盾检测、时效更新这些核心机制，没有一家做闭环。2026 年 7 月 Mem0 自己的年度状态报告把 memory staleness 列入最难未解问题（[State of AI Agent Memory 2026](https://mem0.ai/blog/state-of-ai-agent-memory-2026)）。

有开发者在 HN 上把症结说得最清楚："Mem0 存储记忆，但不学习用户模式。存储事实和从行为中学习是两回事"（[Ask HN](https://news.ycombinator.com/item?id=46891715)）。还有人不买记忆层的账："300 行的结构化 markdown 文件就够用了，我想不出数据库能改进什么"（[Reddit 讨论](https://www.reddit.com/r/AI_Agents/comments/1u1hmjq/stop_putting_your_ai_agents_memory_inside_the_llm)）。前车之鉴是个人记忆产品：Rewind 从 2022 年发布 Mac 应用，到 2024 年更名 Limitless、2025 年被 Meta 收购、同年 12 月应用永久关停，一个"完美记忆"的产品周期不到三年（[Rewind 时间线](https://rewind.ai/what-happened-to-rewind)）。

## 结论

把这几条线索摆在一起，判断很清楚：agent 记忆的商业化进程由叙事、融资和平台绑定驱动，不是由可验证的质量驱动。这个市场的信号系统整体失灵——评测不可信、自报分数虚高、厂商互相拆台，唯一在增长的是商业信号。而大厂第一方记忆的免费化，正在把"够用"的场景吃光，把独立层推向两个窄门：要么做平台代工（Mem0 的 AWS 模式），要么做跨模型、合规、时序图这类高端位。
