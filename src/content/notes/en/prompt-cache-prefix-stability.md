---
title: 'How Prompt Caching Works: Hit Rate Is Decided by Prefix Stability'
slug: prompt-cache-prefix-stability
lang: en
description: "Under the same model, cache hit rate can differ by 4x — and it's not the model: prefix byte stability decides the hit rate. Explains the cache mechanism, seven real cache-breaking incidents, and how to avoid the pitfalls."
date: 2026-08-06T00:00:00+08:00
cover: ../assets/prompt-cache-prefix-stability/fig1_prefix_cache_mechanism.png
topic: AI Engineering
tags: [Prompt Caching, Agent, LLM]
featured: false
draft: false
---

# How Prompt Caching Works: Hit Rate Is Decided by Prefix Stability

![The request prefix is cached from a breakpoint: when the prefix stays unchanged, hits only pay the read price; any byte change triggers a full recompute and rewrite](../assets/prompt-cache-prefix-stability/fig1_prefix_cache_mechanism.png)

> **TL;DR:** The core of prompt caching isn't "shorter context saves money," it's "can the prefix stay stable across requests." Under the same model, two agent harnesses can differ by 4x in cache hit rate and 3x in final cost. What really decides hit rate is what sits in the request prefix, whether the order is stable, whether serialization shape is consistent, and whether the tool set, model, and compaction flow change the prefix mid-conversation.

The same model, two different agent harnesses (the framework or client that runs the agent loop and assembles each round's request), running their own real sessions. Claude Code carries 67.6k tokens of context per round; OpenClaw carries only 18.5k. Yet the one with the longer context costs almost nothing: Claude Code pays about 2 cents per round, OpenClaw about 6 cents (numbers from [Galileo's 2026 caching guide](https://galileo.ai/blog/the-2026-caching-playbook-for-agents-bigger-prompts-smaller-bills); the difference in accounting is covered later).

The difference is cache hit rate. In Claude Code's requests, 92.7% of tokens are read back from cache, and only 296 tokens per round are charged at full price; of OpenClaw's 18.5k tokens per round, only 5.2k come from cache, leaving 13.3k billed at full price.

This set of data points to an easily overlooked issue: in agent scenarios, how long the context is isn't necessarily the first cost factor. The bigger lever is often cache hit rate, which is largely not decided by the model, but by how the harness assembles the request.

This article mainly answers three questions: what exactly does prompt caching cache; why can different harnesses differ by 4x in hit rate under the same model; and when writing your own agent, how to avoid actively shattering a cache that could have been reused.

## First, look inside the model: KV cache

Every time a Transformer generates a new token, the attention mechanism must access the Key and Value representations of tokens already in the sequence, computing attention against the current Query. For already-processed tokens, these K/V representations don't change as generation proceeds: when generating the 100th token, the K/V of the first 99 tokens is the same as the corresponding K/V when generating the 50th.

So the inference engine doesn't recompute the entire history each time it generates a token; it saves the computed K/V and reuses it. This is the KV cache, the foundational optimization in Transformer inference serving.

Prompt caching can be understood as extending this reuse from "within a single generation" to "across multiple requests." If two requests share the same prefix, then the K/V computed for the tokens in that prefix is also the same. The server can save the prefix cache from the earlier request for a few minutes to an hour, and the next request reads it directly instead of recomputing.

That maps several billing concepts: a cache hit is when the K/V of an existing prefix is directly reused; a cache write is the first time this prefix is computed and stored; a cache miss means the prefix can't be reused and must be recomputed.

This also explains why Anthropic's cache write price is higher than its read price: writing includes the computation of encoding the prefix into the model's internal representation, while reading merely reuses an existing result. However, this is only [a third-party explanation of the pricing mechanism](https://dev.to/rikuq/anthropic-prompt-caching-explained-cachecontrol-markers-the-two-tier-write-premium-and-when-it-25cp); Anthropic hasn't publicly stated its specific pricing rationale.

## The cache mechanism: prefix matching, breakpoints, and pricing

Once you understand the reuse logic inside the model, the API-layer rules are much simpler. LLM API caching recognizes only one thing: the request prefix.

The cache stores "the complete content from the start of the request up to a breakpoint." On the next request, as long as this prefix matches the cache, it can hit; if any change appears in the prefix, everything after the change can no longer be reused.

Anthropic's official phrasing: "Prompt caching is a prefix match. Any change anywhere in the prefix invalidates everything after it." ([Claude Code team blog](https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything)). OpenAI's phrasing: "Cache hits are only possible for exact prefix matches within a prompt." ([OpenAI docs](https://developers.openai.com/api/docs/guides/prompt-caching)).

The underlying constraint of both is the same: caching relies on exact prefix matching. The main difference is how caching is controlled, which we'll compare separately later.

Anthropic's hit determination can be understood as based on a prefix hash, rather than re-comparing byte-by-byte each time. A cache entry corresponds to the cumulative hash of all content before the breakpoint, with one entry per breakpoint. If the prefix content matches, the hash can match; if any content changes, the corresponding hash changes too. On check, the API looks back up to 20 blocks from the breakpoint position to find a reusable match — mainly to handle breakpoints moving backward as a conversation grows ([Anthropic docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)).

A so-called cache breakpoint is a marker telling the API "cache up to here." Anthropic's API uses the `cache_control` field to mark it explicitly, allowing at most 4 breakpoints; exceeding that returns an error ([official docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)).

Cache invalidation also follows the prefix hierarchy. A change in tool definitions affects the subsequent system and messages; a change in system means system and messages can't be reused; only when the back of messages changes can the earlier tools and system still potentially hit. The reason isn't complicated: Anthropic's request order itself is tools → system → messages; the earlier content is, the longer the prefix it affects.

What makes these details matter is pricing. Take Sonnet 4.6 ($3/M input): writing a 5-minute TTL cache is billed at 1.25x, i.e., $3.75/M; writing a 1-hour TTL is 2x, i.e., $6/M; reading from cache is only 0.1x, i.e., $0.30/M; if there's no hit, it's still billed at the full $3/M.

Converted: **one write of a 5-minute cache costs about enough for 12 reads.** Even if the prefix can be stably reused, you have to wait until subsequent requests actually hit for the write cost to start showing value.

So the cache economics can be compressed into three phrases: write less, read more, and above all don't let an already-written stable prefix keep getting invalidated by unrelated changes.

The two vendors' mechanism differences can be viewed side by side:

| Dimension | Anthropic | OpenAI |
|---|---|---|
| Breakpoint control | Explicit `cache_control`, max 4, harness declares it | Automatic caching, no config (GPT-5.6+ optional explicit breakpoints) |
| Hit determination | Cumulative hash of all bytes before breakpoint; on check looks back 20 blocks | Hash of first 256 tokens decides routing machine; prefix hash checked on machine (128-token incremental match) |
| Write cost | 1.25x (5-min TTL) / 2x (1-hour TTL) | Free (pre GPT-5.6) / 1.25x (after) |
| Read discount | 0.1x | Varies by model, -50% to -90% |
| TTL | 5 min default, 1 hour explicit | Evicted after 5-10 min inactive (up to 1 hour), extended 24 hours |

## Why the prefix is so fragile

Push this prefix-match rule further onto agent harnesses, and you can see why many seemingly harmless implementations shatter the cache.

**First, any changing content in the prefix affects the stable content after it.** Caching is built on a cumulative prefix. Dynamic information like timestamps, session state, and environment variables, if it appears near the front of the request, can cause the loss of reuse even if the following hundreds of thousands of tokens haven't changed.

**Second, the tool set is itself part of the prefix, and usually sits at the very front.** Anthropic's request order is tools → system → messages ([Anthropic docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)). That means adding a tool mid-conversation, removing one, or even just changing how a tool definition serializes affects not only the tool itself, but the system prompt and message history after it.

**Third, caching is isolated per model.** Switching models mid-conversation is like switching to another set of caches; the prefix has to be rebuilt. The Claude Code team gave a very counterintuitive example: when a conversation has already reached 100k tokens, if you switch from Opus to the cheaper Haiku at that point, the cost of rebuilding the cache may be higher than continuing with Opus ([same blog](https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything)).

**Fourth, compaction and caching often conflict.** After a conversation gets too long, summarization is usually needed. If the compaction request swaps in a different system prompt, or no longer carries the original tools, then the request diverges from the start of the prefix, and the conversation history can't be reused — it has to be recomputed as ordinary input. The longer the conversation, the more expensive this recompute.

These four points cover the most common cache incidents in agents: dynamic content placed too far forward, modifying the tool set mid-conversation, switching models, and rebuilding a whole request for context compaction. The seven real cases below show how these problems happen concretely.

## Seven real incidents

All seven cases below come from GitHub issues or pull requests, with numbers taken from the original posts. I verified the number tables in incidents three and four against the original issues line by line. The material strength isn't uniform across cases: some are fixes submitted by project maintainers, some are packet captures and local patches by the issue author, and some are third-party code audits. I'll preserve these source levels below and not treat them as the same kind of evidence.

![Two prefix layouts: when static content is first, the breakpoint sits at the end of the static region, and dynamic content sinks to the bottom, the prefix is reusable; when dynamic content mixes into the static region, each round's changes invalidate the cache](../assets/prompt-cache-prefix-stability/fig2_prefix_layout_compare.png)

### Incident one: dynamic content placed before static content

In OpenClaw's system prompt, sections like `## Messaging` and `## Group Chat Context`, which change with the channel, were placed before a large static `# Project Context` ([PR #40296](https://github.com/openclaw/openclaw/pull/40296)).

The problem isn't how large this dynamic information is, but that it appears too early. The channel context can change on every request, so the whole Project Context after it also can't be stably reused.

After reordering, the hit rate went from 10-16% to 95%+, and subsequent turn latency dropped from 10-16 seconds to 1-2 seconds.

The rule here is simple: put only long-term-stable content at the very front of the request; the more volatile the information, the further back it should go.

### Incident two: dynamic information injected into the system prompt

NousResearch's Hermes agent injects memory recalled by a `pre_llm_call` plugin directly into the system prompt ([PR #5146](https://github.com/NousResearch/hermes-agent/pull/5146)).

Memory recall naturally depends on the current query, so different turns return different content. Thus even though the actual base system prompt hasn't changed, the system prompt finally sent to the model differs each round, and the cache fails accordingly.

The fix is to move the plugin-generated dynamic context into the current turn's user message, keeping the system prompt byte-stable.

Dynamic state isn't something you can't pass; it's that you shouldn't let it pollute the long-term stable system prefix.

### Incident three: the same content takes two shapes across turns

After Claude Code's PostToolUse hook returns `additionalContext`, in the round the hook fires, this content is wrapped as a `<system-reminder>` text block and stuffed into the tool_result message; by the next round, it becomes a standalone `role: "system"` message ([issue #81077](https://github.com/anthropics/claude-code/issues/81077)).

![In the message stream, the same hook context is wrapped in system-reminder shape in turn N, and becomes a standalone system message in turn N+1, invalidating everything after the change point](../assets/prompt-cache-prefix-stability/fig3_shape_mismatch.png)

The content itself hasn't changed, but the serialization shape has. More troublesome, this content has already landed deep in the message history, so the cache after the change point is affected.

The original issue's measured data is straightforward: across the turn boundary, cache read dropped from 143,250 tokens to 6,472, while a full 140,916-token write occurred. The author also ran a control: a turn boundary where no hook context needed conversion only wrote 2,468 tokens. This control shows the extra cost came from reserializing history, not simply because the new round added content.

For data entering the cache prefix, what must be stable isn't just "semantics," but also the structure and serialization shape it finally sends to the API.

### Incident four: an unsorted collection entering the prefix

Claude Code's built-in Agent tool description enumerates the available subagent types, and that enumeration order comes from an unsorted set ([issue #49038](https://github.com/anthropics/claude-code/issues/49038)).

The Agent happens to be `tools[0]`. So if the ordering of the 32 subagents changes, the change appears at a very early position in the entire request, affecting the tool definitions, system prompt, and message prefix after it.

The issue author confirmed by packet capture that, across two requests 45 seconds apart, the only change was the order of the 32 subagents in `tools[0]`. On resuming a session, `cache_create` dropped from 56,296 tokens to 32 after the fix — a roughly 1750x difference.

This issue was eventually closed as not planned, and the author chose to patch the package themselves, so it should be viewed as the issue author's packet capture and local fix, not an official merged fix.

The engineering fix isn't complicated either: any set that enters the cache prefix — tools, subagents, skill lists — should use a deterministic order before serialization, e.g., always sort by name.

### Incident five: touching tools and switching models mid-conversation

Roo Code's cache toggle for Opus 4.5 missed this model ID, so the model never had caching enabled ([PR #9568](https://github.com/RooCodeInc/Roo-Code/pull/9568)).

A similar issue occurred on Roo Code's Bedrock custom ARN: after the request was missing the `cachableFields` field, cache hit rate silently dropped to 0% with no error ([issue #11983](https://github.com/RooCodeInc/Roo-Code/issues/11983)).

Model switching is another layer of the problem. The Claude Code team is explicit: switching models mid-conversation is like rebuilding the cache. The 100k-token example mentioned earlier is an anchor for that cost.

So if you just want a cheaper model for a subtask, a more reasonable way is usually not to change the main conversation's model, but to let the subagent run in its own context. That way neither the main conversation's model nor its prefix needs to change.

The tool set follows the same logic. State transitions are best modeled with tool calls themselves — for example, designing Plan Mode as a callable tool, rather than dynamically adding or removing a whole set of tool definitions after entering some state.

### Incident six: rebuilding a whole prefix during compaction

One naive compaction implementation is to make a separate summarization call with a different system prompt and without the original tools. The problem is that such a compaction request diverges from the parent conversation at the start of the prefix, so the entire history can't be reused and has to be recomputed as ordinary input ([Claude Code team blog](https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything)).

A more cache-friendly way is to fork: keep the parent conversation's exact same system prompt, context, and tool definitions, and only append "please compact the current conversation" as a new user message. That way the parent's existing cache prefix can be reused, and the only truly new content is the compaction prompt.

This pattern has now also entered Anthropic's [server-side compaction API](https://platform.claude.com/docs/en/build-with-claude/compaction). The official guidance is to place a breakpoint at the end of the system prompt, caching system and conversation separately, so that when compaction happens, the main thing newly written is the summary, not a recompute of the entire stable prefix.

In other words, compaction isn't a special call outside the caching system. The compaction flow itself should also follow the prefix-stability principle.

### Incident seven: a breakpoint placed on content that always changes

This class of problem spreads the widest. In the Anthropic request-conversion code of Cline, Roo Code, and Continue, the `cache_control` breakpoint was placed on "the last 2 user messages," and the last user message happens to be the current turn, which changes every request ([prompt-cache-skills audit](https://github.com/OnlyTerp/prompt-cache-skills)).

The result is that the breakpoint sits on unstable content for a long time: every round may rewrite the cache, but the corresponding cache block is hard to reuse on the next round. Under Anthropic's 5-minute cache pricing, this means continuously paying the 1.25x write price without getting the expected read discount, and in extreme cases it can be more expensive than not caching at all.

The fix direction for all three harnesses in that audit was the same: move the breakpoint from the current turn to the last stable message before it.

Note that this material comes from a third-party code audit, which claims the bug spread through copy-paste and that none of the officials fixed it. So it's a different level of source than the cases that entered project PRs above.

To judge whether a breakpoint is reasonable, ask one very specific question: **will this message exist with exactly the same content and shape in the next request?**

## What to check in your own agent

If you maintain your own agent harness, you don't need to start with complex cache optimization. First check a few of the most error-prone spots; that usually finds most sources of misses.

1. **Look at two numbers in the request log.** In Anthropic usage, focus on `cache_read_input_tokens` and `cache_creation_input_tokens`. If creation stays high for a long time while the conversation is ongoing, suspect unnecessary changes in the prefix.

2. **Draw the request structure in order.** Especially check the system prompt, tool definitions, and static context at the front. For each block, ask: will it change between two consecutive requests? If so, and there's no reason it must be at the front, consider moving it back.

3. **Sets entering the prefix must be serialized deterministically.** Sort tools, subagent lists, and skill lists uniformly; don't rely on the accidental order from a map, set, or directory traversal.

4. **Dynamic information goes in messages, not the system prompt.** Current time, environment state, recalled memory, permission changes, and similar info fit better in the current user message or a tool result than in the long-term stable system prompt.

5. **Freeze the tool set and model mid-conversation if possible.** Model state transitions with tools; if you really need another model, let the subagent maintain its own context, avoiding disruption to the main conversation's existing cache.

6. **Reuse the parent prefix during compaction.** When implementing compaction yourself, keep the parent's system and tools; when using server-side compaction, design breakpoints by cache partition.

7. **Only place breakpoints on truly stable content.** After writing, verify directly: is the marked content byte-for-byte and structure-for-structure identical in the next round's request?

Finally, return to that seemingly counterintuitive comparison at the start: Claude Code carries 67.6k tokens per round, OpenClaw only 18.5k, but the former has about 4x the hit rate and ends up costing about a third of the latter per round.

This is the most worth-remembering point about prompt caching: **prefix size is not the most critical variable; prefix stability is.**

Whether a cache can be reused depends on what's in the prefix, in what order it's arranged, in what serialization shape it exists, and whether tools, models, or compaction were modified mid-conversation.

So next time you see your own agent's `cache_creation_input_tokens` staying high for a long time, your first reaction shouldn't be "is the context too long" or "let's try a different model." You should check a more basic question first:

**What exactly in the prefix is changing?**
