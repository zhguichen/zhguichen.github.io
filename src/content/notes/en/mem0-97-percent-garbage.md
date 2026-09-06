---
title: 'Mem0 Raised $24M and Stored 97.8% Garbage'
slug: mem0-97-percent-garbage
lang: en
description: "While Mem0 announced a $24M raise, an independent audit found 97.8% of the 10,134 memories it stored over 32 days were garbage: agent-memory commercialization is running ahead of verifiable quality."
date: 2026-08-05T00:00:00+08:00
cover: ../assets/mem0-memory-junk/hero.jpg
topic: AI Engineering
tags: [AI Agent, Memory, Commercialization]
featured: false
draft: false
---

# Mem0 Raised $24M and Stored 97.8% Garbage

> **TL;DR:** The demand for agent memory is real, and so are its cost and cross-session value, but what this market lacks most today isn't products — it's credible quality validation. A production audit of Mem0 found 97.8% of the 10,134 memories stored over 32 days were judged to be garbage; meanwhile funding, cloud call volume, and platform integrations are all growing fast. The problem isn't just Mem0: there's a clear gap between vendor self-reported benchmarks and independent reproduction, and the mainstream evaluations themselves are affected by data errors, LLM-judge bias, and context-window inflation. Commercialization has already happened, but "which memory system actually works" still has no stable answer.

![A huge memory warehouse full of crumpled paper, with only one small shelf in the corner holding gold bars, symbolizing 97.8% garbage and a little real value](../assets/mem0-memory-junk/hero.jpg)

On March 27, 2026, a hard-to-ignore agent-memory production audit appeared on GitHub. A developer connected Mem0 into their own config, ran it continuously for 32 days, then used a script to remove duplicate entries and manually checked the remaining 6,264 memories.

The result was bad: over those 32 days, 10,134 memories were written (including duplicates), of which 97.8% were judged garbage by the auditor. Specifically, 3,200 were re-reading the system prompt, 668 came from repeatedly copying a single hallucination, and 130 wrote IP addresses, chat IDs, and file paths into the vector store; the rest were largely heartbeat logs, already-expired task states, and fabricated user profiles. In the end only 224 escaped cleanup, of which 186 were still incomplete and needed rewriting; only 38 could be kept as-is.

At nearly the same time, Mem0 was showing a completely different commercial curve. In October 2025, the company announced a $24M round, with Y Combinator, Peak XV, and GitHub Fund participating; the press release said AWS had selected it as the exclusive memory provider for the new Agent SDK; cloud API calls grew from 35M to 186M over three quarters — all call numbers come from vendor disclosure. GitHub stars reached 41k, and PyPI downloads surpassed ten million.

On one side, fast-growing funding, call volume, and platform integrations; on the other, a 97.8% garbage rate in a production-environment audit. What's truly worth discussing isn't which number is more eye-catching, but the gap between them: the commercialization of agent memory has clearly outpaced verifiable quality.

## Extraction is the bottleneck, not the model

Why so much garbage? The audit points to the extraction step, at the very front of the memory pipeline.

Mem0's default flow is to have the model "summarize the conversation into memory" based on a relatively loose prompt, then write the result directly into the vector store, with no clear quality gate in between. Intuitively, swapping in a stronger model should improve things, but the audit's reality isn't like that: on day 21 the author switched the model from gemma2 to Sonnet, and the obvious hallucinations disappeared, yet after the swap the garbage rate for the last batch only dropped from 97.7% to 89.6%, with the total still at 97.8%.

With a more faithful model, the problem just changed form: it began more earnestly saving the system architecture, tool configs, and transient task states verbatim. In other words, if the judgment "what deserves to become long-term memory" isn't done well, a stronger model doesn't automatically fix a wrong pipeline design.

Even more troublesome is the feedback loop. Once a hallucinated "user prefers Vim" is written into memory, it can be recalled into context in the next session; the extraction model then treats this existing memory as fact and re-saves it, so the error begins reinforcing itself. The audit ended with 808 Vim-preference entries, when no one actually uses Vim ([issue #4573](https://github.com/mem0ai/mem0/issues/4573)).

The auditor's summary: "Swapping in a better model only executes the loose extraction prompt more faithfully; the extraction prompt is the bottleneck, not the model."

This judgment is more worth heeding than "the model isn't strong enough." The real problem isn't a single generation mistake, but that the entire pipeline defaults to lacking filtering and validation. The auditor specifically compared Stanford Generative Agents, LangMem, and Letta: those approaches score candidate memories before actually storing them, while Mem0's default flow has no such layer.

Similar problems aren't confined to this audit. Another developer used Mem0's commercial API for 5 factual-recall tests and got all of them wrong. His judgment was direct: "It's not that Mem0 can't find the needle; it's that it never put the needle in a searchable haystack in the first place" ([Medium test](https://medium.com/asymptotic-spaghetti-integration/memthe-ai-memory-challenge-part-1-we-asked-mem0-to-remember-five-things-heres-how-it-did-56713c04a3e8)). Another developer, after being injected with three consecutive wrong facts, finally removed auto-extraction and fell back to plain-text summaries ([HN discussion](https://news.ycombinator.com/item?id=47770220)).

These cases can't prove every Mem0 deployment reaches a 97.8% garbage rate, but they at least point to the same engineering risk: the first thing a memory system may need to solve isn't retrieval, but "what should never have been stored in the first place."

## Commercial signals are running ahead of quality validation

If technical quality hasn't converged, why have funding and platform partnerships come so fast? Put the progress of the main companies together, and you'll see that the strongest commercial signals in this market right now are almost all quality signals' opposite.

- **Mem0**: Completed a $24M round ([TechCrunch](https://techcrunch.com/2025/10/28/mem0-raises-24m-from-yc-peak-xv-and-basis-set-to-build-the-memory-layer-for-ai-apps)). The AWS integration has two facts to separate: in July 2025, an AWS official announcement confirmed Mem0 integrated with Neptune Analytics and described it in the copy as a "self-improving memory layer" ([AWS announcement](https://aws.amazon.com/about-aws/whats-new/2025/07/amazon-neptune-analytics-mem0-graph-native-memory-in-genai-applications)); but the "exclusive memory provider for the Agent SDK" claim comes mainly from media and Mem0's own press release, with no corresponding AWS announcement. The cloud-call growth numbers likewise all come from vendor disclosure, with no third-party audit.
- **Letta**: Raised a $10M seed round in September 2024, led by Felicis ([official blog](https://www.felicis.com/blog/letta)). No new funding signal since; its positioning has shifted from "memory platform" toward "stateful agent platform."
- **Zep**: Its disclosed funding is the smallest of the companies, with sources ranging from $500k to $3.3M. It relies mainly on the open-source temporal-graph engine Graphiti for acquisition, with a managed service aimed at the enterprise market. Official channels self-report 50% monthly ARR growth and over 240 customers; these numbers likewise have no independent verification.
- **Cloudflare**: Released a private beta of Agent Memory in April 2026, providing a fully hosted memory layer including the extraction pipeline, deeply bound to Durable Objects and Vectorize in the Workers ecosystem, with pricing still undisclosed ([official blog](https://blog.cloudflare.com/introducing-agent-memory)).

Funding, open-source metrics, platform binding, and call volume are all growing, but the column for "memory quality independently validated" is still basically empty.

This doesn't mean these commercial signals are worthless. They can prove developer demand, ecosystem position, and capital expectations, but they can't directly prove memory accuracy. The real problem is that today, even someone who wants to validate this lacks a recognized yardstick.

## The evaluation system itself is also unreliable

![A row of measurement gauges with spinning needles, cracked dials, and contradictory scales, representing a malfunctioning memory-layer evaluation system](../assets/mem0-memory-junk/bench-broken.jpg)

In theory, benchmarks should fill this role. In reality, evaluation results in the agent-memory space are already hard to compare across the board.

Mem0's official docs report the new algorithm reaching 92.5 on LoCoMo and 94.4 on LongMemEval ([official evaluation page](https://docs.mem0.ai/core-concepts/memory-evaluation)), with the evaluation scripts also public in the vendor's own [memory-benchmarks](https://github.com/mem0ai/memory-benchmarks) repo.

On the other side, a third-party paper independently reproducing the open-source framework got only 49 on LongMemEval and 57.68 on LoCoMo ([arXiv 2603.04814](https://arxiv.org/html/2603.04814v1)).

But here I must first clarify the evidence level and testing criteria. That paper is from Bricks Technology, a company preprint without peer review, and it only tested one flat-typed (flat factual) pipeline; it reproduced the open-source framework with a relatively cheap extraction model. Mem0's official 92.5 and 94.4 come from the new algorithm released in April 2026, including managed-platform optimization. So these two sets of numbers aren't a strict same-version, same-config comparison, and the gap can't be wholly attributed to vendor exaggeration.

Even retreating to the more comparable old algorithm, the gap remains. Mem0's own published old-version scores are LoCoMo 71.4 and LongMemEval 67.8 ([official blog](https://mem0.ai/blog/ai-memory-benchmarks-in-2026)); against the independent reproduction, the same benchmark still shows a gap of about 10 to 19 percentage points. At least directionally, there's currently a stable phenomenon: vendors self-report higher, independent reproduction comes lower.

More troublesome, different vendors can't even agree on each other's results. Mem0's paper rates Zep at 65.99, while Zep's own test gets 75.14 and claims Mem0's config was wrong. Zep also points out that in Mem0's own published LoCoMo data, a full-context baseline that stuffs the entire conversation into context gets about 73, higher than Mem0's best config of about 68 — meaning the memory system is worse than just handing the model the full text ([Zep blog](https://blog.getzep.com/lies-damn-lies-statistics-is-mem0-really-sota-in-agent-memory/)).

If it were only config differences between vendors, the problem would be manageable. More serious is that benchmarks themselves may have systematic errors.

After auditing LoCoMo, Penfield Labs reported that 6.4% of the ground-truth answers are themselves wrong, that an LLM judge accepts 63% of deliberately wrong answers, and that 56% of per-category comparisons are statistically indistinguishable from noise. LongMemEval's S version can fit entirely within a modern model's context window, so they argue: "This is a context-window test, not a memory test" ([Penfield audit](https://penfieldlabs.substack.com/p/proposal-a-new-benchmark-for-long)).

Some in the industry put it more bluntly: existing benchmarks "are now mainly testing whether your LLM can read" ([Vectorize Manifesto](https://hindsight.vectorize.io/blog/2026/03/23/agent-memory-benchmark)).

So when you see a memory product score 90+, the real question isn't "is it high," but what version, what extraction model, what context budget, who ran the evaluation, who acted as judge, and whether the benchmark is actually testing long-term memory or a model's ability to find answers within a long text.

What this field lacks right now is a neutral, stable, widely accepted evaluation system.

## But the value of a memory layer isn't fake

If you only looked at the data above, it'd be easy to conclude "agent memory is just marketing." That judgment is equally overreaching, because the other side has fairly clear evidence too: the memory mechanism itself does have value in some scenarios.

Mastra's Observational Memory self-reports 94.87% on LongMemEval, while the full-context on the same table is only 60.2% ([Mastra evaluation](https://mastra.ai/research/observational-memory)). But here again we need to distinguish evidence levels: 94.87% is first and foremost a vendor self-report, currently with only partial independent reproduction; and Observational Memory is a kind of "observational context management," where two background agents continuously compress the conversation into text logs and then put them back into context. It isn't a typical Mem0-style "extract → store → retrieve" memory layer.

So this result is better suited to showing "the memory or long-term-context-management paradigm has potential" than to proving a specific product has solved the problem.

Cost evidence is more direct. The independent team Memori used its own system to get 81.95% on LoCoMo, consuming only 1,294 tokens per query on average, while stuffing the full text required 26,031 tokens — a gap of about 20x ([Memori paper](https://arxiv.org/html/2603.19935)). Bricks' paper also did a cost calculation: when a conversation reaches about 100k tokens, after roughly ten rounds of queries, the cumulative cost of a memory system starts to be lower than stuffing the full text ([arXiv 2603.04814](https://arxiv.org/html/2603.04814v1)).

Beyond that, cross-session continuity, multi-agent sharing, and data sovereignty aren't capabilities that simply expanding the context window can fully replace.

Even the auditor who reported the 97.8% garbage rate didn't abandon Mem0. His words: "The 224 cleaned entries do have value, so we're still using Mem0; the problem is we read 10,134 to find 38 clean ones, which isn't a path most deployments can take."

That sentence may be closer to the true state of current agent memory than any benchmark: value exists, but the signal-to-noise ratio is extremely unstable, and the market currently has no mature mechanism to help developers predict in advance which outcome they'll get.

## Big tech is turning "good-enough memory" into a platform capability

The independent memory layer faces another pressure from model and cloud platforms themselves. From September 2025 to June 2026, several big players built memory into their own platforms, forming roughly two paths.

The first is first-party, self-built.

Anthropic's memory tool is now GA, not separately charged, with the storage backend managed by developers themselves ([official docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)). From a product-pricing angle, this is equivalent to compressing the most basic value of a third-party memory layer — "persistence" — to zero.

Microsoft also provides similar file-based memory in its Agent Framework: directly storing with Markdown files, shipped with the SDK ([Microsoft blog](https://devblogs.microsoft.com/foundry/memory-build2026)). Google built Memory Bank into Vertex's billing system, with a third-party-arranged official price of $0.25 per 1,000 events ([pricing writeup](https://www.betterclaw.io/blog/google-vertex-ai-agent-builder)). Cloudflare's approach is more direct: Agent Memory is built into the Workers ecosystem.

The second path is leaving room for third parties.

OpenAI Agent SDK's long-term-memory request was closed by the official as "not planned" ([issue #887](https://github.com/openai/openai-agents-python/issues/887)), so third-party memory layers still have a clear integration space, and Mem0 became one of the officially documented paths.

AWS is a special case: it already has Bedrock AgentCore Memory, while also doing deep integration with Mem0. The integration itself can be confirmed from public material, but the "exclusive memory provider for the Agent SDK" phrasing currently comes mainly from Mem0's side, with no corresponding AWS official announcement.

These two situations show the independent memory layer hasn't immediately lost its market, but its position is changing: it's increasingly like a replaceable component in a platform, not indispensable infrastructure. Memory in the AWS SDK is a `provider` field; from a product-form angle, swapping providers doesn't require refactoring the whole agent.

When native platform solutions can already satisfy "good-enough" memory needs, a third party must prove why it's worth adding. Some mainstream 2026 comparison articles already list Claude Code's native memory and Mem0 as default options ([Vectorize comparison](https://vectorize.io/articles/claude-code-memory-vs-mem0-vs-hindsight)); Mem0 itself has started publishing pieces like "why still use Mem0" ([Mem0 blog](https://mem0.ai/blog/claude-code-memory)).

This means the competitive focus is shifting from "is there long-term memory" to "what can a third-party memory layer offer beyond a platform's native solution."

## Two years on, forgetting still isn't solved

Community demand for agent memory has rarely been controversial. The controversy has always centered on implementation quality, especially a question that looks basic but is actually extremely hard: when should memory disappear?

When Mem0 first launched in September 2024, someone on Show HN asked "is there a forgetting mechanism," and the answer was "planned" ([Show HN](https://news.ycombinator.com/item?id=41447317)). By June 2026, the new project Mnemo hit the same question on release, and the answer became "on the v0.2.0 roadmap" ([Show HN](https://news.ycombinator.com/item?id=48389586)).

Two years have passed, and forgetting, contradiction detection, and timeliness updates are still recurring problems in this field. In July 2026, Mem0's own annual state report also listed memory staleness among the hardest unsolved problems ([State of AI Agent Memory 2026](https://mem0.ai/blog/state-of-ai-agent-memory-2026)).

These problems matter because long-term memory isn't simply "writing in more facts." Old facts expire, different sources conflict, user preferences change, and some task states are valid only for minutes. If a system only keeps accumulating without judging what should be updated, overwritten, or forgotten, then more memory doesn't necessarily mean the agent knows the user better; it may just mean the noise grows larger.

One developer on HN put the distinction clearly: "Mem0 stores memories but doesn't learn user patterns. Storing facts and learning from behavior are two different things" ([Ask HN](https://news.ycombinator.com/item?id=46891715)).

Others question whether complex memory infrastructure is even necessary: "A 300-line structured markdown file is enough; I can't think of what a database would improve" ([Reddit discussion](https://www.reddit.com/r/AI_Agents/comments/1u1hmjq/stop_putting_your_ai_agents_memory_inside_the_llm)).

This doesn't mean Markdown is necessarily better than a database; it's a reminder of a very real engineering problem: if a more complex memory layer can't stably provide higher accuracy, control, or cost-benefit than a simple text state, then the complexity itself has no value.

Personal memory products have already offered a similar cautionary tale. Rewind went from launching a Mac app in 2022, to renaming itself Limitless in 2024, to being acquired by Meta in 2025, to the app shutting down permanently that December — a product cycle built around "perfect memory" lasted less than three years ([Rewind timeline](https://rewind.ai/what-happened-to-rewind)).

## Conclusion

Today, when evaluating an agent-memory product, funding amount, GitHub stars, cloud call volume, and platform partnerships can only answer "does this market have demand," not "is this memory system reliable."

More worth looking at is another set of data rarely made public: of the memories written, how many are genuinely worth long-term keeping, and how many are duplicates, hallucinations, stale states, or system information; after a wrong memory is recalled, does it keep contaminating subsequent writes; how are old facts updated, how are conflicts handled, and under what conditions is something forgotten; and whether a benchmark is vendor self-reported or independently reproduced, whether the test config is consistent, and whether the evaluation truly requires long-term memory.

Mem0's 97.8% can't be extrapolated into a uniform industry garbage rate; it comes from one specific developer, one specific config, and 32 days of production data. But the engineering problem it reveals is real: today an agent can easily acquire the "long-term memory" feature, yet it's still very hard to acquire a mechanism that can validate its long-term correctness.

Meanwhile, big tech is building basic memory into platforms, further compressing the space for independent memory layers to charge based on "persistence" alone. Third parties may ultimately be left with two narrower, harder positions: either become the memory supplier behind a platform, similar to the Mem0-AWS partnership model; or prove they offer what a platform's native solution doesn't — across models, compliance, temporal graphs, and more complex long-term state management.

So the metric truly worth tracking isn't how much the next company raises, but who can turn "remembering" from an easy-to-demo feature into an auditable, updatable, forgetful engineering system that still holds up after independent reproduction.
