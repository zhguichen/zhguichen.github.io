---
title: 'The One Without a Sandbox Wrote "No Sandbox" Into Its Docs'
slug: the-only-one-without-a-sandbox
lang: en
description: "Claude Code, Cursor, Codex, and OpenCode compared on sandboxing and security interception: where the boundary is placed, and who can see it when it fails."
date: 2026-08-05T00:00:00+08:00
topic: AI Engineering
tags: [AI Agent, Security, Open Source]
featured: false
draft: false
---

# The One Without a Sandbox Wrote "No Sandbox" Into Its Docs

> **TL;DR:** Claude Code, Cursor, Codex, and OpenCode have visibly converged on context compression, retrieval, memory, and subagent scheduling. What actually separates them is the execution boundary. Of the four tools compared here, OpenCode explicitly places sandboxing outside its security commitments; the other three offer varying degrees of OS-level isolation, but actual coverage is not the same as "every agent behavior runs inside a sandbox." The disclosed vulnerabilities also show that a security boundary can fail not just at the kernel layer, but on default semantics, agent parsing, and the trust that out-of-sandbox tools place in config files. More worth asking than "does it have a sandbox" is: where exactly is the boundary drawn, and can the user tell when it fails?

Claude Code, OpenCode, Cursor, and Codex — four coding agent harnesses — increasingly look alike on the surface in compression, retrieval, memory, and subagent scheduling. But when you get to sandboxing and security interception, the differences suddenly sharpen: which layer is the boundary placed on? Which operations are truly isolated at the OS level? And after a boundary fails, can the user actually see it?

This difference correlates somewhat with product form: Claude Code is a local CLI, Cursor spans IDE and cloud, Codex is closer to a SaaS enterprise platform, and OpenCode is an open-source community project. But product form alone can't tell you the motivation behind a security design. What can be reliably compared is each company's public docs, source code, and disclosed vulnerabilities.

## A SECURITY.md that writes "no sandbox" into the security doc

[OpenCode's SECURITY.md](https://github.com/anomalyco/opencode/blob/v1.2.9/SECURITY.md) is direct: it lists sandbox-related protections under **Out of Scope**. In other words, this class of attack is not part of the project's current publicly committed security boundary.

Here we need to be careful not to over-interpret. The public material supports "OpenCode explicitly discloses this part is outside its security commitment," but it's not enough to infer "the maintainer, out of some security philosophy, deliberately decided to never have a sandbox." Unless the maintainer makes a separate clear statement, the latter is speculation.

This distinction matters. Security discussions about coding agents often stop at "does it have a sandbox," but what really drives risk are two more specific questions: **what exactly does the sandbox cover, and is what it doesn't cover written down clearly?**

To understand the difference, it helps to first look at how the four tools design a few other core capabilities. Many of these have already highly converged; it's only at the security boundary that they truly diverge.

## Compression and retrieval have basically converged

The four tools face the same hard constraint: a limited context window. So automatic compression plus manual compression has become a shared design, and there's not much disagreement here.

Retrieval is also converging on agentic search, where the model decides what to look up and along what path to keep searching. Claude Code once tried embeddings and a local vector store, but according to the founder's public remarks it later pivoted to agentic search, citing effectiveness as well as security, privacy, and data-staleness concerns. OpenCode and Codex didn't take the vector-retrieval route. Cursor retained vector-search-like capability, which reads more like a design difference from its cloud-IDE product form than something to simplistically label as ahead or behind.

Two implementation details are genuinely interesting.

Codex's approach is not endlessly pushing old content into the same window; it can proactively switch windows. Cursor treats the history of a conversation as content that can be re-read: information doesn't have to get its final form decided at first compression; it can re-enter the context later if needed.

Both point to the same thing: solving insufficient context isn't only about "compressing history thinner." Another way is to keep history addressable and re-read it when needed.

## The same `agents.md` loads with different semantics across the four

Agentic coding has produced a cross-tool rules-file standard: [agents.md](https://agents.md/). It was initiated jointly by OpenAI Codex, Amp, Jules (Google), Cursor, and Factory — Anthropic is not on the list.

Claude Code also doesn't natively adopt the standard. Its [memory doc](https://code.claude.com/docs/en/memory) describes its own memory and rules-loading mechanism. Whether this means "not following the external standard" or "deliberately cultivating its own tool ecosystem" is something the available material can't determine.

For users, the more practical issue is load semantics: the same `agents.md` becomes default input in tools that support it, but in Claude Code you can't assume it takes effect automatically. Writing a rule doesn't mean every coding agent will read it.

Cursor adds another layer from its product state: its memory behavior is tied to **Privacy Mode**, which changes how memory is used. This also shows that the so-called "memory layer" is not an independent, static local-storage mechanism; it's directly shaped by product permissions and privacy design.

## Similar subagent architecture, differences hidden in communication and resource constraints

Subagent scheduling is one of the most consistent areas across the four: a subagent executes a task in its own context, then returns a summary to the main agent. At least from public implementations and docs, the core architecture is all moving toward "independent context + summary return."

The real differences are in communication capability and resource limits.

Anthropic has published specific cost multipliers in its [multi-agent research system engineering blog](https://www.anthropic.com/engineering/multi-agent-research-system), while the others are more qualitative. But those numbers come from Anthropic's own web research system's internal data on BrowseComp, so they can't be directly extrapolated into a general cost rule for coding subagents.

Codex provides a rarer runtime capability. From the [openai/codex source](https://github.com/openai/codex), in `control.rs` and `execution.rs`, you can see it supports sending messages to a subagent while it's still running; the other three tools compared here mostly use a "dispatch the task, then wait for the result" pattern.

On the other hand, Codex's concurrency limit is written into the implementation as a resource constraint. The other three don't show the same hardcoded limit in their public implementations. The architectures look similar, but how subagents can actually be controlled at runtime is already diverging.

## What truly separates them is the sandbox boundary

Back to security.

Among the four tools compared here, OpenCode's public security docs explicitly don't commit to sandboxing; the other three all have some OS-level execution isolation, but "having a sandbox" doesn't mean all of an agent's capabilities sit inside the same kernel boundary.

This is where many product descriptions are most misleading. When a user sees "sandbox," it's easy to read it as "all of the agent's file, network, and tool behavior is already isolated." In reality, each vendor's sandbox only covers certain execution paths; other capabilities may still rely on permission prompts, host-side proxies, or trusted components outside the sandbox.

### OpenCode: at least the boundary is written in the open

Back to the [SECURITY.md](https://github.com/anomalyco/opencode/blob/v1.2.9/SECURITY.md) at the start. What's certain is simple: OpenCode actively excludes sandbox-related protections from its current security commitment.

There's no need to add a "philosophy" for the maintainer here. From a user's perspective, what's more valuable is the disclosure itself: after reading the security doc, at least you know you can't treat the system sandbox as a security boundary OpenCode already provides.

In other words, its issue isn't "how far does the sandbox commitment reach," but that the doc already tells you this part has to be borne by the user.

### Claude Code, Cursor, and Codex all have isolation, but coverage differs

Claude Code provides OS-level isolation, while also using a host-side proxy to restrict network domains. But its OS-level isolation mainly covers the Bash tool and its subprocesses; Read, Write, WebFetch, MCP servers, hooks, and other capabilities do not automatically get the same kernel isolation, and instead rely more on permissions and their own security mechanisms.

That's the difference between "the product has a sandbox" and "all tool calls are inside the sandbox."

Cursor's isolation is spread across two execution environments, local and cloud. Local uses a "sandbox-first" design: Seatbelt on macOS, Landlock + seccomp on Linux, with bubblewrap as a fallback. Cloud background agents run in a separate cloud environment.

Codex's platform coverage is more complete: macOS, Linux, and Windows all provide default execution isolation, and the public implementation shows a fairly clear fail-closed tendency. For example, a glob parse failure terminates sandbox construction rather than just passing through because a rule couldn't be parsed.

So summarizing as "all three have a sandbox" has little analytical value. A more accurate comparison is to look layer by layer at which processes, tools, network accesses, and config paths actually fall within the isolation scope. The vulnerabilities below illustrate that problems often appear in the seams between these layers.

## Vulnerability counts can't be ranked into a security scorecard

Before comparing vulnerabilities, we need to handle one evidence bias: **the number of publicly disclosed vulnerabilities is not the number of real vulnerabilities, and certainly not the level of product security.**

Closed-source products may attract more researchers because of user scale, enterprise value, and bug bounties; an open-source project disclosing fewer doesn't let you infer a smaller attack surface. The reverse holds too.

So here we don't compare "which of the four had more vulnerabilities disclosed"; we only look at what mechanism each public case actually struck. What's valuable is the failure mode, not the vulnerability count.

## Three cases, each breaking through a different boundary

The first class of problem is in **default semantics**.

Claude Code's network allowlist config `allowedDomains` once had a counterintuitive behavior: a user configured `[]` intending "don't allow any domain," but the system interpreted it as "no restriction." [SecurityWeek's coverage of this bypass](https://www.securityweek.com/anthropic-silently-patches-claude-code-sandbox-bypass) shows this wasn't a user misconfiguration; the system's handling of empty-list semantics was contrary to security intuition.

The second class of problem is in the **parser**.

[oddguan's technical analysis](https://oddguan.com/blog/second-time-same-sandbox-anthropic-claude-code-network-allowlist-bypass-data-exfiltration) documents a null-byte parsing flaw in the SOCKS5 proxy that can bypass the host-side proxy's domain filtering, disabling Claude Code's network allowlist and creating an exfiltration path. According to this analysis, the issue lasted **5.5 months across 130 versions**, and both fixes were silent, with no public announcement.

Here it's especially important to state the boundary precisely: what failed was the **network allowlist** implemented by the host-side proxy, not the OS-level isolation itself. The isolation that constrains processes to localhost still exists; it's just that another layer responsible for controlling the target domain was bypassed. So this case can't be rewritten as "Claude Code's entire sandbox never worked."

The third class of problem is in the **trust relationship inside and outside the sandbox**.

[BleepingComputer's coverage of Pillar Security's "Week of Sandbox Escapes"](https://www.bleepingcomputer.com/news/security/cursor-codex-gemini-cli-antigravity-hit-by-sandbox-escapes) involves three Cursor vulnerabilities, and also touches Codex, Gemini CLI, and Antigravity. One common pattern described is: an attacker first writes config or files inside the sandbox, then a trusted tool outside the sandbox consumes that content, so the execution path crosses the original isolation boundary.

This set of material also can't be dressed up as "three independent verifications": Cursor's three vulnerabilities come from the same Pillar Security disclosure event, a single batch of research output, not multiple research teams independently finding the same defect.

The three cases respectively fail on default semantics, the parser, and cross-boundary trust. Together they show that a coding agent's security boundary doesn't only live in the kernel sandbox itself. As long as permission configs, proxies, parsers, or trusted tools outside the sandbox still participate in decisions, any of those layers can become the actual attack surface.

## Stronger cloud isolation doesn't mean more approvals

[Cursor's background agent docs](https://cursor.com/docs/background-agent) show another representative trade-off: the background agent runs in a cloud-isolated environment, but during execution it doesn't keep requesting user approval the way a local interactive agent does.

This isn't simply "more secure" or "less secure"; it's putting control in a different place. The execution environment is more thoroughly isolated from the local machine, so the product can reduce manual approvals; meanwhile, the user's real-time control over individual operations also decreases.

So when evaluating a coding agent's security mechanisms, it's best not to look at just one indicator like "how strong is the sandbox" or "how strict are approvals." Isolation, permissions, approvals, and automation are a whole set of trade-offs that together determine the risk a user is actually exposed to.

## Hardcoded interception and fully delegated control are two extremes

Dangerous-operation interception likewise shows two completely different designs.

Claude Code provides hardcoded interception for operations like `rm -rf /`. The [official sandbox doc](https://code.claude.com/docs/en/sandboxing) explains that even in more aggressive permission-bypass modes, these protections remain. That is, some security rules aren't user-configurable; they're fixed boundaries the product doesn't let you easily cross.

OpenCode has no corresponding built-in default interception. Whether a dangerous command like `rm -rf` is restricted depends on the user's own environment and config.

These two modes can't be simply reduced to "one is definitely safer." Hardcoded rules reduce user mistakes, but as long as a security system has multiple layers, it can still fail through semantics, parsers, or cross-boundary trust; handing control to the user avoids the illusion of "already protected by the system," but it also requires the user to build a reliable execution boundary themselves.

What's really worth checking isn't whether "sandbox" appears on the product page, but a few more concrete things: **which execution paths enter OS-level isolation, and which still rely on permissions or host components; whether default-deny rules are fail-open or fail-closed under abnormal conditions; whether files generated inside the sandbox are subsequently executed by trusted tools outside it; and whether these boundaries and known failures are written clearly in the open.**

From this angle, OpenCode's most striking feature isn't "no sandbox" itself, but that it at least writes this limitation clearly into its security doc. For the other three, the sandbox does provide stronger execution isolation, but "has a sandbox" is still only the starting point of analysis, not the security conclusion.
