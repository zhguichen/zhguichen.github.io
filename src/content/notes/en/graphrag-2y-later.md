---
title: 'GraphRAG Two Years Later: Still Maintained, but Useless for Most Scenarios'
slug: graphrag-2y-later
lang: en
description: "Two years after GraphRAG was open-sourced it's still maintained, but most RAG scenarios don't need it in practice: for simple fact retrieval it's a negative asset; only multi-hop reasoning, cross-document synthesis, and relational queries are worth it — and it's more expensive and harder to maintain."
date: 2026-08-06T00:00:00+08:00
cover: ../assets/graphrag-2y-later/hero.jpg
topic: AI Engineering
tags: [GraphRAG, RAG, Knowledge Graph]
featured: false
draft: false
---

# GraphRAG Two Years Later: Still Maintained, but Useless for Most Scenarios

![Routing fork: multi-hop reasoning, cross-document synthesis, and relational queries go to the knowledge graph; simple fact retrieval and general Q&A go to vector retrieval](../assets/graphrag-2y-later/hero.jpg)

> TL;DR: Two years on, GraphRAG is still maintained, but it never became the default upgrade path for general RAG. The boundary given by third-party benchmarks is now fairly clear: simple fact retrieval is usually not worth it; multi-hop reasoning, cross-document synthesis, and relational queries are where graph structure genuinely adds value; meanwhile its indexing, querying, incremental update, and entity-governance costs are all significantly higher. The safer production move is not a wholesale migration, but keeping vector RAG and making graph an on-demand capability for a few complex queries.

Two years ago, in July 2024, Microsoft released GraphRAG: first extracting entities and relationships from documents to build a graph, then retrieving on the graph and generating an answer; the project was open-sourced that November. It was quickly treated as "the next generation of RAG," and in the Chinese community an impression even formed that it was "better across the board and could answer any query." Two years later, the genuinely valuable question is no longer whether it's still hot, but where its applicable boundary really is.

On August 6, 2026, I verified the project's current state with the [GitHub API](https://api.github.com/repos/microsoft/graphrag). The repo is still not archived, the latest version v3.1.1 was released July 18, and there was a push the day before; but the heat and investment are weaker than the popular impression: stars are 35,280, not the 80k+ circulated in the Chinese community; in the last 52 weeks there were only 84 commits, about 1.6 per week, including a roughly 3.5-month zero-commit gap from October 2025 to January 2026; and releases are dominated by a single maintainer.

The version line itself is still evolving: open-sourced in Nov 2024 with DRIFT search, LazyGraphRAG (the no-graph mode) open-sourced Feb 2025, and a monorepo split into 8 packages in Jan 2026. But Microsoft's peripheral investment signals are weaker: [graphrag-accelerator](https://github.com/Azure-Samples/graphrag-accelerator) is archived, the official [Agent Framework's graph integration stars Neo4j's GraphRAG](https://learn.microsoft.com/en-gb/agent-framework/integrations/neo4j-graphrag), and the ICLR 2026 papers are all external academic follow-ups. As for the common claim that "Microsoft uses GraphRAG internally," I couldn't find a source for it in the papers or official blogs.

So the first question, "is it still alive," isn't hard to answer: yes, but the heat has been discounted, and it doesn't look like a continuously high-investment project. The second question, which is genuinely worth a team's time, is: when is GraphRAG actually worth using?

## Is GraphRAG really better?

The mainstream narrative in 2024 was "GraphRAG is better across the board." By 2026, three third-party academic benchmarks have narrowed this conclusion into a clearer boundary: the graph isn't a universal improvement; it trades for stronger capability on specific query types.

Simple fact retrieval is precisely its least worthwhile scenario. [GraphRAG-Bench](https://ar5iv.labs.arxiv.org/html/2506.05690) (ICLR 2026) measured that GraphRAG is 13.4% lower than plain RAG on Natural Questions and 16.6% lower on time-sensitive queries; on HotpotQA's multi-hop task it's only 4.5% higher, yet pays 2.3x the latency. The reason isn't complicated: for simple queries, graph processing is itself an extra step and can bring more irrelevant relationships and noise into context.

Complex reasoning and cross-document synthesis are where graph structure genuinely wins. On the same benchmark, the graph family clearly leads on complex reasoning, HippoRAG2 at 53.38 vs Basic RAG at 42.93; context synthesis is 12.8 points higher. But there are two easily overlooked qualifiers here: these numbers compare against HippoRAG2, and Microsoft's GraphRAG isn't among them; meanwhile, on simple tasks the graph loses by only 0.78 points, far less than its gain on complex tasks. So you can't mix tasks and simplify into "GraphRAG is on average better" or "GraphRAG is overall worse."

Multi-hop reasoning is the graph's most solid advantage right now. [Do We Still Need GraphRAG?](https://arxiv.org/abs/2604.09666) (2026-04) gives a very direct quantitative result: under single-hop retrieval, the graph is only 0.47 points higher on average; under multi-hop, 27.23 points higher, with HotpotQA at 46.70 vs 19.00. Even swapping in the RL-trained agentic retrieval Search-R1, the graph backend is still 40.82 vs 14.42 on MuSiQue, with about 5x lower variance. The paper's judgment is therefore not "graph replaces agent," nor "agent eliminates graph," but that the two are complementary.

A sharper result comes from AWS and Cisco's [Is GraphRAG Needed?](https://arxiv.org/abs/2606.25656) (ACL 2026 GEM Workshop). They found a "retrieval-generation gap": graph entity recall rose from 54.9% to 83.5%, roughly 1.5x, but the LLM's answer recall barely moved, staying between 45.4% and 48.2%. More worrying, a simple "document + 1-hop relationship" approach had Hit@1 of 0.6972, higher than the full GraphRAG pipeline's 0.6422; a tool-free self-consistent agentic retrieval reached 0.6881, but dropped to 0.6055 after adding a graph tool. This pushes the debate from "which retrieval architecture is stronger" toward the more practical "context engineering": the retrieval side retrieving more entities doesn't mean the generation side can effectively use that information.

![Bar comparison: graph entity recall rises from 54.9% to 83.5%, while LLM answer recall only moves from 45.4% to 48.2%, with the retrieval-generation gap marked in between](../assets/graphrag-2y-later/gap.jpg)

I should add an evidence-level note here. All three benchmarks above are third-party academic evaluations, more credible than vendor self-reports, but none have independent replication yet; they're also each based on a single backbone model (GPT-4o-mini or Claude 3.7 Sonnet), and the papers themselves note results may shift as model capabilities change. In other words, the safest conclusion right now isn't "GraphRAG definitely wins on X," but: multi-hop reasoning and cross-document synthesis already have fairly clear advantage evidence; simple fact retrieval is often not worth the cost. For the third type, relational queries, the main evidence comes from production routing practices, covered later.

## Winning comes at a price: heavier cost and maintenance

GraphRAG's performance gains can't be separated from cost, and here it's especially unsuitable to summarize with a single "N times more expensive," because different configs and corpus sizes can widen the result by orders of magnitude.

### How much more expensive is indexing? It depends on config

Start with indexing. An [EMNLP 2025 paper](https://aclanthology.org/2025.findings-emnlp.321.pdf) independently measured GraphRAG's index tokens as 1.7 to 2.3x LightRAG's. The community-circulated "8x" and "10-20x" come from individual cases with different configs; high-end estimates can reach 50-100x. That is, the same technique can differ by two orders of magnitude across settings, so any "N times more expensive" claim without config and corpus size has basically no decision value.

Query cost is easier to verify. The original paper's [Table 3](https://ar5iv.labs.arxiv.org/html/2404.16130) gives a single global query's context as 40k to 1.14M tokens, corresponding to News corpus levels C0 to C3; in independent tests, GPT-4o running one query was about 150k tokens and $0.80. For systems needing frequent online queries, this part enters TCO more directly than the one-time graph-build cost.

### Harder still: incremental updates and entity governance

The maintenance problem isn't as simple as "tune a few more parameters"; it's tied to the graph's incremental-update mechanism. The official issue chain documents a few typical problems clearly: [#741](https://github.com/microsoft/graphrag/issues/741) states incremental indexing uses an append-only design, with delete and modify out of scope, and in the worst case degrades to a full rebuild; in [#511](https://github.com/microsoft/graphrag/discussions/511) the maintainer acknowledges that modifying a document is like adding a new node, and the graph may keep old facts; [#1702](https://github.com/microsoft/graphrag/issues/1702) records ID corruption after incremental merge making query results unusable; and [#401](https://github.com/microsoft/graphrag/issues/401) shows the entity disambiguation problem when building a graph of *Sherlock Holmes*: Sherlock, Sherlock Holmes, and Mr. Holmes split into three separate nodes.

[Community source analysis](https://juejin.cn/post/7438052532990492710) adds the mechanism-level explanation: missing cross-batch entity disambiguation means that when indexing in monthly batches, the same entity doesn't automatically merge; measured node duplication exceeds 18%, and disambiguation accuracy is only 63.2%, ultimately relying on monthly full rebuilds as a fallback. What practitioners call "a month of tuning" is still just an individual case, not a general statistic; but parameter sensitivity, entity duplication, and update oscillation aren't merely subjective complaints — there are mechanisms and issues that corroborate each other.

Extraction quality can also form a hidden systemic risk. In a [codebase scenario](https://ar5iv.labs.arxiv.org/html/2601.08773), 31.2% of files were skipped outright by the LLM extraction, consistently across three repos; graph build time was about 70x, end-to-end cost about 20-46x. More troubling, skipped files disappear from both embeddings and the graph, forming a silent blind spot that's hard to detect.

### LazyGraphRAG lowers cost, but evidence is still mostly from the vendor

Microsoft's answer to the cost problem is LazyGraphRAG. The [official blog](https://www.microsoft.com/en-us/research/blog/lazygraphrag-setting-a-new-standard-for-quality-and-cost/) claims indexing cost is the same as vector RAG and only 0.1% of full GraphRAG, with query cost 700x lower. These numbers look good, but they're still an official benchmark with no third-party retest; meanwhile, it moves some work to the query stage, introducing per-query LLM calls, pushing latency from milliseconds to seconds, and it isn't yet merged into the main repo.

The closest real-migration story is [a legal-tech client's 80k case documents](https://particula.tech/blog/lazygraphrag-700x-cheaper-graphrag-knowledge-graphs): a standard GraphRAG index was estimated at $12k, while LazyGraphRAG's first query only took minutes. But this is still an evaluation post, not a long-term production retrospective, so it's better treated as a "feasibility signal" than a maturity proof.

## In production, GraphRAG is more like an on-demand capability

The claim "from research to production" isn't entirely unfounded, but the public evidence is far thinner than the marketing material. If I require a case to include a real production period, quantified metrics, and a verifiable source, the only complete case I can find is the LinkedIn customer-support system: it comes from a [SIGIR 2024 paper](https://arxiv.org/abs/2404.17723), ran about 6 months in real production, and includes a randomized controlled comparison.

The effect numbers here must be preserved in their original framing: MRR +77.6% is a relative gain, from 0.522 to 0.927; BLEU +0.32 is an absolute difference, from 0.057 to 0.377; ticket-resolution time -28.6% is the median, while the mean is actually -62.5%. If these numbers are quoted apart from their metric definitions, they're easily inflated into a stronger claim than the paper intended.

Most other public cases have only the vendor's own account. In the AWS pharma case, "R&D cycle -87%, 5x hit rate" comes from an anonymous single-client pilot and [vendor self-report](https://aistory.news/generative-ai/aws-graphrag-deployment-slashes-drug-rd-cycles-87); a Neo4j executive named Uber, Klarna, and Novo Nordisk, but with no metric details; AISO orthodontics is a rare named private deployment in the Chinese community, but the source is still the vendor side, and its effect numbers can't be quoted alone. The widely circulated "6% hallucination reduction, 80% token reduction" comes from the [GenAIK 2025 paper's](https://aclanthology.org/2025.genaik-1.6/) benchmark results on Finance Bench, not production data; the same paper also reports a 734x token reduction on another task, showing that such effect numbers can span two orders of magnitude across task sets.

Compared to individual cases, production architecture shows a more stable consensus: rather than migrating all queries to GraphRAG, let the graph handle only what it's good at. A [practitioner's year-end review](https://jacar.es/en/enterprise-graphrag-patterns-after-a-year-of-adoption/) calls "hybrid routing" the most common and most robust approach: simple queries go to vector, complex queries go to agentic, relational queries go to graph. The key of this pattern isn't adding another backend; it's first acknowledging that different queries have different optimal retrieval paths.

Two other common patterns also revolve around cost and governance. One is layered extraction: use a small model to extract entities, and only call a frontier model when synthesis is needed, to keep indexing cost down. The other is a federated graph: each business domain maintains its own schema, bridged by an upper graph for shared entities, to avoid re-ingesting all data during an organizational restructure.

There's also a very practical entry-gate consensus: if a team can't explain to a person the five most important entity types in its corpus, it's usually not ready for GraphRAG directly.

## Risks and alternatives: the graph is not a free structure

The most direct cost critique of full GraphRAG comes, in a sense, from Microsoft itself: LazyGraphRAG's benchmark precisely brings full GraphRAG's indexing cost to the table. A third-party paper is more direct — ICLR 2026's GraphRAG-Bench explicitly writes "GraphRAG often underperforms vanilla RAG on real-world tasks."

A common practitioner heuristic is that 70% to 90% of real queries are fine with plain or hybrid RAG; but this ratio comes from multiple independent blog posts, not a single authoritative statistic, so it's better treated as an experience range than an industry law.

### Security risks come from the relational structure itself

GraphRAG also introduces a structured attack surface that traditional vector retrieval lacks. [GragPoison](https://arxiv.org/abs/2501.14050) demonstrates a black-box poisoning attack: by injecting relationships, one can affect multiple queries at once, with a success rate up to 98%; that 98% is an upper bound, not an average, and the work was accepted at IEEE S&P 2026.

A [graph reverse-extraction study](https://arxiv.org/abs/2508.17222) gives a noteworthy paradox: raw-text leakage may actually decrease, but structured entity and relationship information is easier to extract. This direction has already formed a set of attack-defense work, including LogicPoison, backdoor attacks, and HoG-GRAG defenses, and it's a research frontier still actively developing in 2026. For privacy-sensitive domains like healthcare, law, and finance, this isn't a peripheral security issue, but a new attack surface that must enter the threat model during selection.

### Many alternatives, but no single winner yet

LightRAG's [stars (about 38k)](https://www.star-history.com/hkuds/lightrag/) have overtaken the Microsoft repo, but the community-circulated "10x faster, 8x fewer tokens" has no official source. The [paper](https://arxiv.org/abs/2410.05779) self-reports about 100x fewer index tokens, and its LLM-judge evaluation actually loses to GraphRAG on mixed domains, at a 48.14% win rate. This also shows you can't extrapolate a project's advantage on a single benchmark into a general ranking.

Other routes each emphasize something different. HippoRAG2 takes the memory route, strongest on multi-hop and best cost-performance, with a preprocessing cost of $2.85 per million tokens versus $13.19 for the Microsoft version; KAG (Ant Group) emphasizes logical reasoning and compliance, adopted by WPS 365; Graphiti (Zep) builds temporal graphs and entered the ThoughtWorks radar. The problem is that vendors' benchmarks are mutually incompatible, so cross-vendor ranking is unreliable; Mem0 self-reports 93.4%, while a third-party replication gets 73.8% — such gaps are not uncommon.

A more noteworthy trend alternative is Agentic RAG: using an agent's reasoning to replace part of the pre-built graph structure, at lower cost and with better freshness. But it still hasn't closed the multi-hop gap. The earlier results show that on multi-hop tasks, agentic retrieval still clearly lags the graph backend. This is why graph structure, though not the default, still retains a capability range that's hard to replace.

## How to choose, two years later

Two years on, whether to adopt GraphRAG no longer needs to be bet on vision; it's more a question of query type and system constraints.

Don't use it by default. For fact retrieval, single-hop Q&A, and general knowledge bases, vector RAG with good document parsing and reranking is usually enough; counting indexing, querying, and maintenance, the cost can be one to two orders of magnitude lower. [Atlan's rule](https://atlan.com/know/what-is-graphrag/) is concrete: when there are fewer than 1000 entities and relationships are simple, vector RAG can win at one-tenth the cost.

Layer it on demand. If the corpus has dense, nameable relationships — e.g., legal, medical, finance, or code dependencies — and queries really need multi-hop reasoning, cross-document synthesis, or explicit relational queries, the more reasonable move is hybrid routing: simple queries keep going to vector, complex queries go to graph, rather than a wholesale migration.

Two scenarios warrant particular caution. First, frequently-updated corpora shouldn't be put on a graph lightly: append-only incremental indexing may keep old facts in the graph, making freshness maintenance a systemic cost. Second, dirty data that can't be governed shouldn't be put on a graph lightly: noise in vector retrieval becomes fixed entities and relationships in a graph, and after structuring it's harder to ignore.

The value of GraphRAG two years later isn't whether it's "the next-generation RAG," but that it finally has a clearer applicable boundary. Treating it as the upgrade path for all RAG is likely not worth the cost and complexity; confining it to multi-hop, cross-document synthesis, and relational queries, then controlling cost with hybrid routing, is closer to the engineering choice the public evidence supports today.
