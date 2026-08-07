---
title: Prompt Cache 的原理：命中率由前缀稳定决定
slug: prompt-cache-prefix-stability
description: 同一模型下缓存命中率能差出 4 倍，不是模型问题：前缀字节稳定性决定命中率。讲清缓存机制、七种真实破缓存事故，以及怎么不踩坑。
date: 2026-08-06T00:00:00+08:00
cover: ./assets/prompt-cache-prefix-stability/fig1_prefix_cache_mechanism.png
topic: AI 工程
tags: [Prompt Caching, Agent, LLM]
featured: false
draft: false
---

# Prompt Cache 的原理：命中率由前缀稳定决定

![请求前缀从断点处被缓存：前缀不变时命中缓存只付读价，任何字节变化则全量重算并重新写入](assets/prompt-cache-prefix-stability/fig1_prefix_cache_mechanism.png)

> **TL;DR**：Prompt Cache 的核心不是「上下文越短越省钱」，而是「前缀能不能跨请求保持稳定」。同一个模型下，两个 agent harness 的缓存命中率可以差出 4 倍，最终成本差 3 倍。真正决定命中率的是请求前缀里放了什么、顺序是否稳定、序列化形状是否一致，以及工具集、模型和压缩流程会不会在会话中途改变前缀。

同一个模型，两个不同的 agent harness（运行 agent 循环、负责拼装每轮请求的框架或客户端），跑各自的真实会话。Claude Code 每轮请求要携带 6.76 万 token 的上下文，OpenClaw 只带 1.85 万。结果却是上下文更长的一方几乎不花钱：Claude Code 每轮大约付 2 美分，OpenClaw 付 6 美分（数字来自 [Galileo 的 2026 缓存手册](https://galileo.ai/blog/the-2026-caching-playbook-for-agents-bigger-prompts-smaller-bills)，口径差异后面会说到）。

差别在缓存命中率。Claude Code 的请求里，92.7% 的 token 从缓存读回，每轮只有 296 个 token 需要按原价计算；OpenClaw 每轮 1.85 万 token 里只有 5.2 千来自缓存，剩下 1.33 万都按原价计费。

这组数据说明了一个很容易被忽略的问题：在 agent 场景里，上下文有多长未必是成本的第一决定因素。更大的杠杆往往是缓存命中率，而它很大程度上不由模型决定，而由 harness 如何组织请求决定。

这篇文章主要回答三个问题：Prompt Cache 到底缓存了什么；为什么同一个模型下，不同 harness 的命中率能差出 4 倍；以及自己写 agent 时，怎样避免把本来可以复用的缓存主动打碎。

## 先看模型内部：KV cache

Transformer 每生成一个新 token，注意力机制都要访问序列中已有 token 的 Key 和 Value 表示，用当前 Query 与它们计算注意力。对于已经处理过的 token，这些 K/V 表示不会因为后续生成而改变：生成第 100 个 token 时，前 99 个 token 的 K/V，和生成第 50 个 token 时对应部分的 K/V 是一样的。

因此，推理引擎不会每生成一个 token 就重新计算整段历史，而是把已经算过的 K/V 保存下来复用。这就是 KV cache，也是 Transformer 推理服务里的基础优化。

Prompt caching 可以理解成把这种复用从「一次生成内部」延伸到「多次请求之间」。如果两个请求拥有相同的前缀，那么这段前缀对应 token 计算出来的 K/V 也相同。服务端可以把前一次请求得到的前缀缓存保存几分钟到一小时，下一次请求直接读取，而不再重新计算。

于是几个计费概念就对应起来了：所谓 cache hit，是已有前缀对应的 K/V 被直接复用；cache write，是第一次计算这段前缀并把结果存进缓存；cache miss，则意味着前缀无法复用，需要重新计算。

这也能解释为什么 Anthropic 的缓存写入价格高于读取：写入包含了把前缀编码进模型内部表示的计算，而读取只是复用已经存在的结果。不过，这只是[第三方对定价机制的解释](https://dev.to/rikuq/anthropic-prompt-caching-explained-cachecontrol-markers-the-two-tier-write-premium-and-when-it-25cp)，Anthropic 官方并没有公开说明具体的定价理由。

## 缓存机制：前缀匹配、断点和定价

理解了模型内部的复用逻辑，API 层的规则就简单很多。LLM API 的缓存只认一种东西：请求前缀。

缓存保存的是「从请求开头到某个断点为止的完整内容」。下一次请求只要这段前缀与缓存一致，就可以命中；前缀中一旦出现变化，变化位置之后的缓存就无法继续复用。

Anthropic 的官方表述是："Prompt caching is a prefix match. Any change anywhere in the prefix invalidates everything after it."（[Claude Code 团队博客](https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything)）。OpenAI 的表述则是："Cache hits are only possible for exact prefix matches within a prompt."（[OpenAI 文档](https://developers.openai.com/api/docs/guides/prompt-caching)）。

两家的底层约束是一致的：缓存依赖精确前缀匹配。主要差异在于缓存如何控制，后面会单独比较。

Anthropic 的命中判定可以理解为基于前缀 hash，而不是每次重新逐字节滚动比较。缓存条目对应断点之前全部内容的累积 hash，一个断点对应一个条目。前缀内容一致，hash 就可以匹配；其中任意内容发生变化，对应的 hash 也会变化。检查时，API 会从断点位置向前检查最近 20 个 block，寻找可以复用的匹配位置，这主要是为了处理随着对话增长、断点不断向后移动的情况（[Anthropic 文档](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)）。

所谓断点（cache breakpoint），就是告诉 API「缓存到这里为止」的标记。Anthropic API 使用 `cache_control` 字段显式标注，最多允许 4 个断点，超过会直接报错（[官方文档](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)）。

缓存失效也遵循前缀层级。工具定义变化，后面的 system 和 messages 都会受到影响；system 变化，则 system 和 messages 无法继续复用；只有 messages 后部变化时，前面的 tools 和 system 仍然可能命中。原因并不复杂：Anthropic 请求的顺序本身就是 tools → system → messages，越靠前的内容，影响的后续前缀越长。

真正让这些细节变得重要的是定价。以 Sonnet 4.6 为例（$3/M input）：写入 5 分钟 TTL 的缓存按 1.25 倍计费，即 $3.75/M；写入 1 小时 TTL 按 2 倍，即 $6/M；从缓存读取只按 0.1 倍，即 $0.30/M；如果没有命中，则仍然按原价 $3/M 计算。

换算一下，**写一次 5 分钟缓存的钱，大约够读 12 次**。即使前缀能够稳定复用，也至少要等到后续请求真正命中，写入成本才开始体现价值。

所以缓存经济学其实可以压缩成三句话：少写，多读，尤其不要让已经写进去的稳定前缀因为无关变化反复失效。

两家的机制差异可以放在一起看：

| 维度 | Anthropic | OpenAI |
|---|---|---|
| 断点控制 | 显式 `cache_control`，最多 4 个，harness 自己声明 | 自动缓存，无需配置（GPT-5.6+ 可选显式断点） |
| 命中判定 | 断点前全部字节的累积 hash；检查时在断点处回看最近 20 个 block 找匹配 | 前 256 个 token 的 hash 决定路由机器，机器上检查前缀 hash（128-token 增量匹配） |
| 写入成本 | 1.25x（5 分钟 TTL）/ 2x（1 小时 TTL） | 免费（GPT-5.6 前）/ 1.25x（之后） |
| 读取折扣 | 0.1x | 因模型 -50% 到 -90% |
| TTL | 5 分钟默认，1 小时显式 | 不活跃 5-10 分钟驱逐（最多 1 小时），extended 24 小时 |

## 前缀为什么这么脆弱

把前缀匹配这个规则继续往 agent harness 上推，就能看出很多看似无害的实现为什么会把缓存打碎。

**第一，前缀里任何会变化的内容，都会影响它后面的稳定内容。** 缓存建立在累积前缀上。时间戳、会话状态、环境变量之类动态信息，如果出现在请求靠前的位置，即使后面几十万 token 都没有变化，也可能因为前面的少量差异而失去复用。

**第二，工具集本身就是前缀，而且通常位于最前面。** Anthropic 的请求顺序是 tools → system → messages（[Anthropic 文档](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)）。这意味着 agent 在对话中途新增一个工具、删除一个工具，甚至只是改变工具定义的序列化结果，影响的都不只是工具本身，而是它后面的 system prompt 和历史消息。

**第三，缓存按模型隔离。** 中途换模型，相当于切换到另一套缓存，需要重新建立前缀。Claude Code 团队给过一个很反直觉的例子：当对话已经进行到 10 万 token 时，如果此时从 Opus 切换到更便宜的 Haiku，重新建立缓存的成本可能比继续让 Opus 回答还高（[同上博客](https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything)）。

**第四，压缩（compaction）和缓存很容易互相冲突。** 对话太长以后通常需要摘要。如果压缩请求换了一套 system prompt，或者不再携带原有工具，那么请求从前缀开头就已经分叉，历史对话无法继续复用，只能重新按普通输入计算。对话越长，这次重算越贵。

这四点基本覆盖了 agent 中最常见的缓存事故：动态内容放得太靠前、中途修改工具集、切换模型，以及为了压缩上下文重新构造一套请求。下面七个真实案例，可以看到这些问题具体是怎样发生的。

## 七种真实事故

下面七个案例全部来自 GitHub issue 或 pull request，数字取自原帖。其中事故三和事故四的数字表，我逐字核对过原 issue。不同案例的材料强度并不完全相同：有的是项目维护者提交的修复，有的是 issue 作者的抓包和本地 patch，也有第三方代码审计。下文会保留这些来源层级，不把它们当成同一种证据。

![两种前缀布局：静态内容在前、断点位于静态末尾、动态内容沉底时前缀可复用；动态内容混入静态区时每轮变化导致缓存失效](assets/prompt-cache-prefix-stability/fig2_prefix_layout_compare.png)

### 事故一：动态内容放在静态内容前面

OpenClaw 的 system prompt 里，`## Messaging`、`## Group Chat Context` 这类会随着频道变化的 section，被放在了大型静态 `# Project Context` 之前（[PR #40296](https://github.com/openclaw/openclaw/pull/40296)）。

问题不在于这些动态信息本身有多大，而在于它们出现得太早。频道上下文每次请求都可能变化，于是它后面的整段 Project Context 也无法稳定复用。

调整顺序后，命中率从 10-16% 提升到 95%+，后续 turn 的延迟从 10-16 秒降到 1-2 秒。

这里的规则很简单：请求最前面尽量只放长期不变的内容，越容易变化的信息越往后放。

### 事故二：动态信息注入 system prompt

NousResearch 的 Hermes agent 把 `pre_llm_call` 插件召回的记忆直接注入 system prompt（[PR #5146](https://github.com/NousResearch/hermes-agent/pull/5146)）。

记忆召回天然依赖当前查询，不同 turn 返回的内容不同。于是即使真正的基础 system prompt 没有变化，最终发送给模型的 system prompt 仍然每轮不同，缓存也就跟着失效。

修复方式是把插件生成的动态上下文移到当前 turn 的 user message 中，让 system prompt 保持逐字节稳定。

动态状态不是不能传，而是不要让它污染长期稳定的 system 前缀。

### 事故三：同一份内容，跨 turn 变成两种形状

Claude Code 的 PostToolUse hook 返回 `additionalContext` 后，在 hook 触发的当轮，这段内容会被包装成 `<system-reminder>` 文本块，塞进 tool_result 消息；到了下一轮，它却会变成一条独立的 `role: "system"` 消息（[issue #81077](https://github.com/anthropics/claude-code/issues/81077)）。

![对话消息流中，同一段 hook 上下文在 turn N 是 system-reminder 包裹形状，turn N+1 变成独立 system 消息，从变化点之后的缓存全部失效](assets/prompt-cache-prefix-stability/fig3_shape_mismatch.png)

内容本身没有变，但序列化形状变了。更麻烦的是，这段内容已经落在历史消息深处，因此变化位置之后的缓存都会受到影响。

原 issue 给出的实测数据很直观：跨 turn 边界时，cache read 从 143,250 token 掉到 6,472，同时发生了一次 140,916 token 的全量写入。作者还做了对照：没有 hook 上下文需要转换的 turn 边界，只写入了 2,468 token。这个对照说明，额外成本来自历史内容的重序列化，而不是单纯因为新一轮请求增加了内容。

对于进入缓存前缀的数据，稳定的不只是「语义」，还包括它最终发送给 API 的结构和序列化形状。

### 事故四：进前缀的集合没有排序

Claude Code 内置的 Agent 工具描述会枚举可用的 subagent 类型，而这个枚举顺序来自无序集合（[issue #49038](https://github.com/anthropics/claude-code/issues/49038)）。

Agent 恰好又是 `tools[0]`。于是只要 32 个 subagent 的排列顺序发生变化，变化就出现在整个请求非常靠前的位置，后面的工具定义、system prompt 和消息前缀都会受到影响。

issue 作者抓包确认，在相隔 45 秒的两次请求里，唯一变化就是 `tools[0]` 中 32 个 subagent 的顺序。resume 会话时，`cache_create` 从 56,296 token 降到修复后的 32 token，相差约 1750 倍。

这个 issue 最终被 closed as not planned，作者选择自己 patch 包，因此这里应当把它看作 issue 作者的抓包和本地修复结果，而不是官方已经合入的修复。

工程上的处理也不复杂：任何会进入缓存前缀的集合——工具、subagent、技能列表——在序列化之前都应该使用确定性顺序，例如统一按名字排序。

### 事故五：会话中途动工具、换模型

Roo Code 给 Opus 4.5 的缓存开关里漏掉了这个模型 ID，导致该模型完全没有启用缓存（[PR #9568](https://github.com/RooCodeInc/Roo-Code/pull/9568)）。

另一个类似问题发生在 Roo Code 的 Bedrock 自定义 ARN 上：请求缺少 `cachableFields` 字段后，缓存命中率会静默掉到 0%，同时没有报错（[issue #11983](https://github.com/RooCodeInc/Roo-Code/issues/11983)）。

模型切换则是另一个层面的问题。Claude Code 团队明确指出，会话中途换模型相当于重建缓存。前面提到的 10 万 token 例子，就是这种成本的一个锚点。

因此，如果只是希望某个子任务使用更便宜的模型，更合理的方式通常不是修改主会话的模型，而是让 subagent 在自己的上下文里运行。这样主对话的模型和前缀都不需要变化。

工具集也是同样的逻辑。状态转换最好用工具调用本身来建模，例如把 Plan Mode 设计成可调用工具，而不是进入某个状态后动态增删整套工具定义。

### 事故六：压缩时重新造了一套前缀

一种 naive compaction 的实现方式是：单独发起一次摘要调用，使用不同的 system prompt，并且不携带原来的工具。问题在于，这样的压缩请求从前缀开头就已经和父对话不同，整段历史无法复用，只能重新按普通输入计算（[Claude Code 团队博客](https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything)）。

更适合缓存的方式是 fork：保留父对话完全相同的 system prompt、上下文和工具定义，只把「请压缩当前对话」作为新的 user message 追加进去。这样父对话已有的缓存前缀可以继续复用，真正新增的只有压缩 prompt。

这个模式现在也已经进入 Anthropic 的 [server-side compaction API](https://platform.claude.com/docs/en/build-with-claude/compaction)。官方指引是在 system prompt 末尾放置一个断点，把 system 与对话分别缓存，这样发生压缩时，需要新写入的主要是摘要部分，而不是重新计算整个稳定前缀。

换句话说，压缩不是缓存体系之外的一次特殊调用。压缩流程本身也应该遵守前缀稳定原则。

### 事故七：断点打在必然变化的内容上

这一类问题传播得最广。Cline、Roo Code 和 Continue 三个 harness 的 Anthropic 请求转换代码里，`cache_control` 断点被打在「最后 2 条 user 消息」上，而最后一条 user 消息恰好就是当前 turn，每次请求都会变化（[prompt-cache-skills 审计](https://github.com/OnlyTerp/prompt-cache-skills)）。

结果是断点长期落在不稳定内容上：每一轮都可能重新写缓存，却很难在下一轮复用对应缓存块。在 Anthropic 的 5 分钟缓存定价下，这意味着持续支付 1.25 倍的写入价格，却拿不到预期的读取折扣，极端情况下甚至比不使用缓存更贵。

三个 harness 在该审计中的修复思路相同：把断点从当前 turn 移到它之前最后一条稳定消息。

需要注意的是，这里的材料来自第三方代码审计，原文称这个 bug 通过复制粘贴传播，且官方都没有修。因此它和前面已经进入项目 PR 的案例不是同一层级的来源。

判断一个断点是否合理，可以问一个非常具体的问题：**这条消息在下一个请求中，还会以完全相同的内容和形状存在吗？**

## 对自己的 agent 应该检查什么

如果自己维护 agent harness，不需要先做复杂的缓存优化。先检查几个最容易出问题的地方，通常就能找到大部分 miss 的来源。

1. **先看请求日志里的两个数字。** Anthropic usage 中重点关注 `cache_read_input_tokens` 和 `cache_creation_input_tokens`。如果 creation 长期居高不下，而对话又在连续进行，优先怀疑前缀中存在不必要的变化。

2. **把请求结构按顺序画出来。** 尤其检查请求最前面的 system prompt、工具定义和静态上下文。对每一块都问一句：它在两个连续请求之间会不会变？如果会，而且没有必须放在前面的理由，就应该考虑往后移动。

3. **进入前缀的集合必须确定性序列化。** 工具、subagent 列表、技能列表统一排序，不要依赖 map、set 或文件遍历产生的偶然顺序。

4. **动态信息走消息，不要污染 system prompt。** 当前时间、环境状态、召回记忆、权限变化之类信息，更适合进入当前 user message 或 tool result，而不是修改长期稳定的 system prompt。

5. **主会话中途尽量冻结工具集和模型。** 状态转换用工具建模；确实需要使用其他模型时，可以让 subagent 维护独立上下文，避免破坏主对话已有缓存。

6. **压缩时复用父对话前缀。** 自己实现 compaction 时，尽量保留父对话的 system 和工具；使用服务端 compaction 时，则按照缓存分区设计断点。

7. **断点只打在真正稳定的内容上。** 写完以后直接验证：被标记的这段内容，在下一轮请求里是否仍然逐字节、逐结构保持一致？

最后再回到开头那个看似反直觉的对比：Claude Code 每轮携带 6.76 万 token，OpenClaw 只有 1.85 万，但前者命中率高出约 4 倍，最终每轮成本反而只有后者的三分之一左右。

这也是 Prompt Cache 最值得记住的一点：**前缀大小不是最关键的变量，前缀稳定性才是。**

缓存是否能复用，取决于前缀里放了什么、按什么顺序排列、以什么序列化形状存在，以及会话中途有没有修改工具、模型或压缩方式。

所以下一次看到自己的 agent `cache_creation_input_tokens` 长期居高不下，第一反应不应该是「是不是上下文太长」或者「换个模型试试」，而应该先检查一个更基础的问题：

**前缀里，到底有什么东西在变？**
