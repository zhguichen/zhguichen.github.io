---
title: 唯一没有沙箱的那一家，把"没有沙箱"写进了官方文档
slug: the-only-one-without-a-sandbox
description: Claude Code、Cursor、Codex、OpenCode 四款 coding agent 在沙箱与安全拦截上的对照：边界放在哪一层，失效时谁能看见。
date: 2026-08-05T00:00:00+08:00
topic: AI 工程
tags: [AI Agent, 安全, 开源]
featured: false
draft: false
---

# 唯一没有沙箱的那一家，把"没有沙箱"写进了官方文档

Claude Code、OpenCode、Cursor、Codex——四款 coding agent harness 在压缩、检索、记忆、subagent 调度、沙箱、安全拦截六件事上给出的答案表面趋同。但"边界放在哪一层、边界失效时谁能看见"这件事上，它们分道了。这种分道与各自的产品形态有可解释的对应：本地 CLI（Claude Code）、IDE 加云端（Cursor）、SaaS 企业平台（Codex）、开源社区项目（OpenCode）。

## 一篇把"没有沙箱"写进安全文档的 SECURITY.md

[OpenCode 的 SECURITY.md](https://github.com/anomalyco/opencode/blob/v1.2.9/SECURITY.md) 是一份不按套路出牌的安全文档：别的工具在安全页面上用大段文字描述自己的沙箱防护，OpenCode 直接把沙箱相关防护划进了 **Out of Scope**——官方文档主动承认，这一类攻击不在它的安全承诺范围内。

注意措辞：这里能确证的只有"披露"，不能定性为"哲学选择"。没有维护者的独立立场声明来支撑"我们故意不设沙箱"这种更强的解读。可以确证的只有一件事：文档明明白白写着，没有沙箱。

四家对沙箱的**宣传强度**与**实际保护范围**之间存在系统性落差，而这个落差本身很少被公开审计。现在的问题是：另外三家怎么了？它们的沙箱宣传，经得起自己文档和已披露漏洞的检验吗？

## 压缩与检索：收敛的共识，两个反直觉的细节

四家共享同一个硬约束：上下文窗口有限。因此四家都有自动加手动两套压缩机制，这一层没有悬念，全部收敛。

检索上的收敛更彻底：三家在检索上收敛到 agentic search——让模型自己决定查什么、按什么路径查。其中 Claude Code 是试过 embedding + 本地向量库之后主动放弃的（创始人公开说明 agentic search 效果更好、且没有安全/隐私/过期问题）；OpenCode 和 Codex 则是从未采用。Cursor 是唯一的例外，没有放弃向量检索式的路径，这对应它云端 IDE 的产品形态；这里不定性为领先或落后，形态差异而已。

两个反直觉的设计细节值得停下来：

- **Codex 主动换窗**。多数工具的压缩是"把旧内容挤进当前窗口"，Codex 的回答是主动换窗——让上下文换一个窗口，而不是在同一个窗口里越压越薄。
- **Cursor 历史当文件回读**。Cursor 不把历史当作只能被压缩的负担，而是把它当作一个可以重新读回的"文件"：需要时再读回来，而不是预先决定它该被压成什么。

两个细节指向同一个观察：压缩不是唯一解，"让内容以可寻址的方式重新进入上下文"是另一种策略。

## 记忆层：一份标准文件，四种加载语义

Agentic coding 催生了一份跨工具标准：`agents.md`，[agents.md](https://agents.md/) 定义了它的规范。这份标准由 OpenAI Codex、Amp、Jules（Google）、Cursor、Factory 协作发起——发起者名单里没有 Anthropic。反讽在这里：把 agentic coding 带向主流的 Anthropic，是唯一不原生读取这个标准的公司——[Claude Code 的记忆文档](https://code.claude.com/docs/en/memory)描述的是它自己的记忆机制。至于这是"创新者掉队"还是"生态位经营"（不养外部标准，经营自家生态），本文不下判断，只记录这个事实。

规则加载的语义因此在四家之间分裂：同一个 `agents.md`，在多数工具里是默认消费的输入，在 Claude Code 里不是——你写了一份规则文件，并不保证你的工具读了它。

Cursor 的记忆则多了一层产品绑定：记忆行为与 **Privacy Mode** 绑定，隐私模式的开关改变记忆如何被使用。记忆不是静态的存储层，它是跟着产品形态走的。

## Subagent 调度：架构收敛，数据与能力分化

调度架构上四家出奇一致：都是"独立上下文 + 返回摘要"——子 agent 干完活把摘要交回主 agent，无一例外用角色切换实现。架构收敛到同一条路。

分化的地方在数据与能力：

- **只有 Anthropic 公布了成本倍数**。在 [multi-agent research system 工程博客](https://www.anthropic.com/engineering/multi-agent-research-system)里，Anthropic 给出了具体数字；其余三家只有定性声明。但这是 Anthropic 自家网页研究评测（BrowseComp）的内部数据，不能泛化为"coding subagent 的通用成本倍数"。
- **Codex 有唯一一个双向通道**。[openai/codex 源码](https://github.com/openai/codex)的 `control.rs`、`execution.rs` 里，实现了四家中唯一一个"运行中向子 agent 发消息"的双向通道；另外三家发完任务，只能等摘要回来。同时，Codex 的并发上限是硬编码的资源限制——写死在代码里的天花板；另外三家没有这个硬编码，并发靠模型"自觉"。

## 沙箱与安全拦截：边界放在哪一层，失效时谁能看见

进入正题前，先把四家的底牌摊开：四家里只有一家没有沙箱，而那一家把它写进了文档；另外三家都有某种 OS 级执行隔离，但覆盖范围各不相同，且各自都有已披露的漏洞。漏洞形态各不相同，值得按机制分开看。

### 1. OpenCode：把"没有沙箱"写进文档

回到开篇那份 [SECURITY.md](https://github.com/anomalyco/opencode/blob/v1.2.9/SECURITY.md)。把它当"哲学选择"是过度解读——只有"披露"是可确证的：文档主动、明确地把沙箱防护划出安全承诺范围，用户读到就知道边界在哪。这是主轴的一半：**边界放在哪一层，用户看得见**。OpenCode 的选择是"没有边界，且文档里明说没有边界"。

### 2. 另外三家的隔离：都有，但覆盖不对称

除了 OpenCode，另外三家都有某种 OS 级执行隔离，但覆盖范围各不相同：Claude Code 有 OS 级隔离（把进程钉在 localhost），另配宿主侧代理做网络域名过滤，但它的 OS 级隔离只覆盖 Bash 工具及其子进程——Read/Write/WebFetch/MCP servers/hooks 完全停留在权限询问层，没有内核隔离，这是"沙箱"字面含义和实际保护范围之间的落差。Cursor 的隔离分布在本地执行与云端执行两层，本地是"沙箱优先"设计：macOS 用 Seatbelt，Linux 用 Landlock+seccomp（带 bubblewrap 兜底）。Codex 是三家里覆盖最广的：macOS/Linux/Windows 三平台默认强制沙箱，fail-closed 倾向也最强——比如 glob 解析失败就中止沙箱构建，而不是放行。关键词是"各不相同"——每一家都只覆盖了某些层，而漏洞恰恰出现在没覆盖到的层。

### 3. 先说清证据的不对称

进入漏洞之前，先说清一件事：**已披露漏洞的数量反映研究者的注意力，不反映真实安全水平**。闭源工具用户多、赏金高，更受研究者关注，被挖出的洞更多，不代表它更不安全；开源工具披露少，也不代表它更安全。所以下文不比较谁的漏洞多，只按机制分类看漏洞本身。

### 4. 三个漏洞案例，三种机制

**机制一：默认语义反转。** Claude Code 的网络 allowlist 配置 `allowedDomains`，用户写 `[]` 想表达"阻止一切"，系统却解释成"允许一切"。这是默认语义本身的错误，不是配置失误——[SecurityWeek 报道了这次绕过](https://www.securityweek.com/anthropic-silently-patches-claude-code-sandbox-bypass)。

**机制二：解析器绕过，静默 5.5 个月。** [oddguan 的技术分析](https://oddguan.com/blog/second-time-same-sandbox-anthropic-claude-code-network-allowlist-bypass-data-exfiltration)记录了一个 SOCKS5 代理的 null-byte 解析缺陷：穿透宿主侧代理的域名过滤层，Claude Code 的网络 allowlist 可以被绕过，实现数据外泄。失效持续了 **5.5 个月、跨 130 个版本**，且两次都是 silent fix、无公告。这里要划清边界：失效的是**网络 allowlist**（宿主侧代理的域名过滤），OS 级隔离本身——把进程钉在 localhost——始终在工作。不能因为 allowlist 被绕过，就说"沙箱从未生效"。

**机制三：配置注入型逃逸。** [BleepingComputer 的报道](https://www.bleepingcomputer.com/news/security/cursor-codex-gemini-cli-antigravity-hit-by-sandbox-escapes)记录了 Pillar Security 的"Week of Sandbox Escapes"活动：Cursor 的三个漏洞（同一活动中 Codex、Gemini CLI、Antigravity 亦有涉及）被报道描述为同类配置注入问题——在沙箱内写入文件，沙箱外受信任的工具消费这些文件，沙箱边界被绕过。限定一下：这三个漏洞是 Pillar Security **同一次披露活动的批量产出**，不是三次独立验证，也不存在"多方独立发现同一类缺陷"。

三个机制各打在不同的层：一个错在默认语义，一个错在解析器，一个错在信任边界。它们的共性是：发现都来自外部研究者，修复或披露都来得安静。

### 5. 云端强隔离 × 零审批：安全预算的两个方向

[Cursor 的后台 agent 文档](https://cursor.com/docs/background-agent)写了一个值得注意的组合：云端 agent 的隔离更强——执行环境在云端——换来的却是**从不请求批准**：隔离足够强，所以不打断你审批。安全预算没有同时加强，而是在两个方向上分配：隔离变强，审批变弱。这个取舍本身可以理解，但它说明"隔离强度"和"人类控制"是同一份预算的两个花法，不是两个能同时拉满的旋钮。

### 6. 危险操作硬拦截：规则硬编码 vs 零规则

最后看两极。Claude Code 对 `rm -rf /` 有硬编码拦截，[官方沙箱文档](https://code.claude.com/docs/en/sandboxing)表明即使在最激进的绕过模式下它依然生效——规则写死在代码里，用户绕不开。OpenCode 则完全没有对应的内置拦截——零规则，用户自己负责：`rm -rf` 不会被默认拦截，除非用户自己在配置里写规则。

"规则硬编码、用户绕不开"与"零规则、用户自己负责"，是放手程度的两端，没有谁更安全的问题——前面三个案例已经证明，每一种边界都有自己的失效方式：语义反转、解析器绕过、配置注入。

四家的安全承诺没有高下，只有取舍。OpenCode 把责任全部交回用户，好在它的文档把这一点写到明处；另外三家把隔离做进内核，好在——也坏在——每一层机制都有它自己的失效方式。而这一切的前提，是先有一份把边界写清楚的文档。