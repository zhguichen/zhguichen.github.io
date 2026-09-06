---
title: 'Can an Investing Agent Actually Make Me Money?'
slug: ai-agent-invest
lang: en
description: "Live-money experiments show AI agents occasionally win, but are far from a stable strategy: the ones already making money are brokers, advisors, and course sellers, while an ordinary user relying on it for sustained gains is still an open question."
date: 2026-08-07T00:00:00+08:00
cover: ../assets/ai-agent-invest/champions.png
topic: AI Frontiers
tags: [AI Agent, Investing, Trading]
featured: false
draft: false
---

# Can an Investing Agent Actually Make Me Money?

> **TL;DR:** Investing agents occasionally win, but the existing evidence isn't enough to prove they can make money consistently. The champions of several real-money experiments keep changing; shift the market or the time window and the rankings may flip. Scale up to an agent vault with nearly a million holders, and the median user is losing money. The most stable business model right now isn't letting users earn excess returns with agents, but selling them trading tools, advisory services, and courses. So when judging an investing agent, first see whether it publicly publishes a long-term, cross-market, cost-deducted user-return distribution.

By 2026, AI agents have begun truly taking over trading accounts.

Robinhood opened its interface so third-party agents can place orders directly; Coinbase launched payment and trading infrastructure aimed at agents; domestic brokers are also pushing AI advisors and T+0 algorithms into trading apps. On the other side, crypto markets ran a round of agent tokens, and social media is increasingly full of content like "give DeepSeek $1M to trade stocks."

The question isn't whether AI can analyze stocks, but something more direct: **hand real money to AI — can it actually make money consistently?**

This can't be answered by looking at a few pretty backtests. The evidence for investment AI agents roughly splits into three layers: backtests, real-money experiments, and the returns of ordinary users after real commercialization. The further down, the more valuable the evidence and the harder it is to find.

What public data currently shows is interesting: AI occasionally does make money, but champions keep changing and cross-market stability is poor; at the scale of a few hundred thousand users in the agent-token market, the median user is losing money. Meanwhile, platform commissions, advisory service fees, and course revenue all have very clear cash flows.

## Real money to AI: it can win, but it doesn't win stably

What's most worth looking at now isn't backtests, but experiments running models directly on real money.

Nof1 Alpha Arena Season 1 ran from October 18 to November 3, 2025. Six models each got $10,000 and traded perpetuals on Hyperliquid, using real funds throughout. In the end Qwen3-Max was +22.32%, DeepSeek V3.1 +4.89%, and all other models lost money, with GPT-5 down 62.66%. These results have [SCMP coverage](https://www.scmp.com/tech/tech-trends/article/3331425/alibabas-ai-model-outperforms-us-rivals-crypto-trading-showdown), and the trades themselves can be verified through public wallets.

The most important thing about this experiment isn't that Qwen won, but that Nof1 itself was very restrained about the result. Officially, it's clear this was "real trading, not replay or paper practice," but it also cautioned that early success could entirely be luck, and [they don't expect any model to be naturally good at trading](https://nof1.ai/blog/TechPost1).

Season 2 expanded to 8 models and 32 strategy groups, each still $10,000, with total funds of $320,000, and the market switched to US equity tokens. Only 6 groups made money, and all came from Grok 4.2. More anomalous, per-group trade win rates were generally 70%-89%, but win rate had almost no relationship to final returns. What actually separated outcomes was holding time: Grok 4.2's average hold was clearly longer, while most models held under two hours. Results can be seen at [Nof1](https://nof1.ai) and in the participating [retrospective](https://www.linkedin.com/posts/victor-zhorin_in-late-2025-nof1-ran-alpha-arena-season-activity-7458491378105315328-gElz).

A HKU experiment gave a similar result. In April 2026, HKU Business School launched AIEL Agentic Trader, letting 10 models each run $100k in real-time FX trading for 6 weeks, with no preset strategy. In the end Qwen +9.9%, DeepSeek -15.1%, and the high-frequency model that traded over 1,000 times didn't gain higher returns. The school therefore defined the result only as ["stage performance in a specific market environment"](https://www.hku.hk/press/press-releases/detail/c_29241.html).

But in another market, the rankings immediately reversed. When HKUDS's [AI-Trader](https://github.com/HKUDS/AI-Trader) traded Nasdaq-100 constituents with $10k each, DeepSeek instead ranked first at +10.61%. The same model was best in the US-equity experiment and worst in the FX experiment.

![Champion returns across four real-money experiments: Qwen3-Max 22.32%, Grok 4.2 12.11%, Qwen 9.9%, DeepSeek 10.61% — a different champion each time](../assets/ai-agent-invest/champions.png)

These experiments prove at least one thing: **AI can make money in some market environment, but there's currently no evidence that any model possesses a stable alpha that can be reproduced across markets and cycles.**

The sample window is also a clear limitation. These positive results mostly come from short 2-6 week experiments. Beating the market for a few weeks can show the model has trading ability, but is far from proving it has formed a stable investment system.

A smaller but typical case comes from Nathan Smith. He ran an AI portfolio for 6 months with $100 of real money; the first four weeks were decent, but then the core position AYTR crashed 83% in a single day, and [the whole portfolio never recovered](https://blog.flatcircle.ai/p/ai-trading-arenas). This case isn't even about AI failing to pick stocks, but a more traditional problem: over-concentration, where a single risk event wiped out all prior gains.

AI hasn't bypassed the most basic things in investing — market environment, position sizing, risk control, and transaction cost are still more important than "which model was used."

## Agent tokens: 920k holders, losing a combined $190M

The problem with real-money experiments is small samples. If you want to see whether large numbers of real users actually made money, the most valuable data right now actually comes from crypto.

IC3's study [Paper Agents, Paper Gains](https://arxiv.org/abs/2605.29174) audited 11 Solana agent vaults, covering 925,323 holders, from October 2024 to November 2025.

The result is extreme: these agent vaults showed unrealized gains of over $30M on paper, but holders lost a combined $191.7M. Cumulative user returns once reached about $2.4B, then all round-tripped into a net loss. Return distribution was also highly concentrated: the top 1% of wallets took 81.4% of the gains, and the median user on every platform had negative returns.

![Left: vault paper gains of $30M while holders net-lost $191.7M; right: 81.4% of gains flowed to top 1% wallets, median return negative](../assets/ai-agent-invest/ic3-ledger.png)

Token performance itself was equally poor. The sample's agent tokens fell an average of about 93% from their highs, while SOL's drawdown over the same period was 54%. The study also found many so-called agents weren't actually doing autonomous trading; most of the 17,000+ launches were just simple API integrations.

![Drawdowns from highs: elizaOS 97%, agent tokens average 93%, VIRTUAL 89%, SOL 54% over the same period](../assets/ai-agent-invest/token-drawdowns.png)

Star projects didn't change this. ai16z later renamed to elizaOS; after a token migration, in August 2026 the project reached a settlement with a class-action suit, and the founder declared the token "dead," down more than 97% from its peak; VIRTUAL also fell about 89% from its high at one point.

This data can't represent all AI agents, nor directly prove future agent tokens will all lose money. But it does provide one of the few large-sample user ledgers currently available: **the project making money on paper, and a few early wallets making money, doesn't mean ordinary holders did.**

This is a layer easily overlooked when discussing AI investing. Media usually shows the highest-returning model, the most successful wallet, or the prettiest equity curve, while what investors should really look at is the median of the whole user distribution.

## Agents are getting hotter, but platforms haven't published what users actually earned

If AI agents' profitability hasn't been proven, why are brokers and trading platforms rushing to integrate?

The reason isn't complicated. For a platform, whether AI produces stable alpha and whether AI can be a business are two separate questions.

On May 27, 2026, Robinhood opened its Agentic Trading beta, letting third-party AI agents directly operate trades via MCP and separate budget accounts. The official description even notes trades may be executed by the agent without direct user input.

At the same time, its [risk terms](https://robinhood.com/us/en/agentic-trading) are also explicit: Robinhood doesn't guarantee the accuracy or suitability of agent output, isn't responsible for investment losses from agent decisions, and reminds users they may lose their entire investment. In other words, the platform provides trading infrastructure, not return guarantees.

Post-launch user counts and volume come mainly from the company's own disclosure, and there's currently no sign of Robinhood separately reporting agentic users' average returns, profit/loss ratio, or risk-adjusted returns in its financials. Truly independent tests are rare; after trying it, NexusTrade founder Austin Starks lost about $5 and also hit issues like missing paper-trading mode and abnormal OAuth callbacks, finally calling it ["a half-baked API release masquerading as AI"](https://medium.com/@austin-starks/i-just-tried-robinhoods-alleged-agentic-trading-i-am-not-impressed-33d3725a23e0).

eToro's Tori is similar. The platform claims about 500k trades in the first year, but its official financials don't separately disclose Tori users' return data, while explicitly stating "Tori does not provide investment advice."

Coinbase's model is more direct. After Coinbase for Agents launched in June 2026, revenue sources include trading fees, USDC settlement spreads, and trading activity on the Base chain. Here the business logic is no different from traditional trading platforms: the more frequently agents trade, the more infrastructure is used, and the easier it is for the platform to make money.

Domestic brokers are going down a similar path. 34 listed brokers spent a combined 27.588 billion yuan on IT in 2025, up 12.96% year over year, about 6.2% of total revenue; AI has become part of broker infrastructure spending. [Caixin's data](https://m.cls.cn/detail/2365785) at least shows this isn't a conceptual demo, but real IT investment.

Huatai's AI Zhangle and SmarT T+0, and Guotai Haitong's Junhong Lingxi have all entered real products. The problem remains that user-return data is scarce. In SmarT T+0 sales, a "win rate of about 70%" claim appeared, but no independent ledger verifies it; commissions, however, are clear — roughly 0.03%-0.035% for T+0 trades and about 0.01% for ordinary trades. As trading frequency rises, platform revenue naturally rises.

For actual user results, what can be cited now is only press interviews. For example, a [June 2026 report](https://www.21jingji.com/article/20260608/herald/1fc0517d78684d3ed05f32a075a4646e.html) aggregated several account managers and gave a roughly 7:3 profit-to-loss ratio, but there's no public ledger, and the same article also contains opposite user experiences.

So at this stage, when judging such commercial products, it's best to separate "lots of users," "lots of trades," and "users making money." The first two have plenty of data; the third is still nearly blank.

## What's actually worked is the cash flow of selling tools

Compared with whether agents themselves can make money stably, the data on the tool-selling side is far more complete.

Jiufang Zhitou is a very typical sample. According to its [2024 annual report](https://www1.hkexnews.hk/listedco/listconews/sehk/2025/0327/2025032701708_c.pdf), revenue was 2.306 billion yuan, up 17.3% year over year, with a gross margin of 82.1% and net profit of 272 million yuan. Marketing spend reached 1.06 billion yuan, of which internet traffic purchases alone were 675 million yuan.

By the first half of 2025, revenue further reached 2.10 billion yuan, up 133.79% year over year, with net profit attributable to shareholders of 865 million yuan.

Meanwhile, the refund rate is also high. The overall refund rate was 21.8% in 2024, the flagship series once reached 30.3% in the first half of 2024, and it rose to 24.6% in the first half of 2025. A very interesting contrast: Jiufang's own financial-investment business lost 64.08 million yuan in 2024.

![Jiufang Zhitou 2024 revenue 2.306B, marketing spend 1.06B, net profit 272M; refund rate rising from 21.8% to 24.6%](../assets/ai-agent-invest/jiufang-fin.png)

Combined, these numbers explain this business better than any marketing copy: high margin, high marketing spend, high refund rate, while revenue grows quickly. Its core business capability is customer acquisition, sales, and providing advisory services; it doesn't require clients to ultimately make money with these tools.

Regulatory data also shows the same structural problem. In February 2025, the Shanghai CSRC ordered Jiufang to rectify for unregistered employee stock recommendations and misleading marketing; in February 2026 the penalty escalated to an order to correct and a 3-month suspension of new customers. At the industry level, multiple advisory institutions have been penalized since November 2025, and [Securities Times' statistics](https://stcn.com/article/detail/3636427.html) show the number of institutions has also declined.

This isn't a new business model invented by AI. Complaints in the advisory industry were growing fast before the AI wave, from 6,040 in 2021 to 23,531 in 2023. AI is more like putting a new product wrapper around the original stock-tip, advisory, and course sales.

Regulatory cases even show very direct practices. A [risk warning](https://www.csrc.gov.cn/shenzhen/c105615/c7638512/content.shtml) issued by the Shenzhen CSRC in June 2026 mentioned so-called "AI quantitative stock-picking" software that fabricated profit by modifying historical backtest data; some training institutions' stock recommendations were actually generated directly by free AI; and some products controlled so-called quantitative devices through remote cloud desktops.

Course-market revenue is also real. Li Yizhou's AI course sold about 250,000 sets in a year, with sales of about 50 million yuan; content like "DeepSeek stock trading return 1281.82%" also appears widely. Relevant investigations can be seen at [Huxiu](https://m.huxiu.com/article/4119755.html) and [Yicai](https://www.yicai.com/news/102505405.html).

What's most worth distinguishing here is the business model: investors only make money if their trading judgment is correct, while platforms, advisors, and course companies can generate revenue as soon as they complete a trade or sale.

This puts the two sides in fundamentally different return structures.

## Why backtests always look better than live trading

The easiest place for investment AI agents to create illusion is still backtesting.

TradingAgents is currently one of the most well-known open-source LLM trading frameworks, with researchers from UCLA, MIT, and others, and substantial GitHub attention. It published very pretty results: from January 1 to March 29, 2024, testing AAPL, GOOGL, and AMZN, with a Sharpe of 8.21.

The problem is that this result covers only three months and three stocks, and the test period itself rarely showed significant drawdown. More seriously, the project later confirmed a look-ahead bug: Alpha Vantage's earnings data bypassed the original filtering logic, allowing future-dated data into the historical backtest, meaning the model in some cases effectively saw the future.

The project's own README later also warned that historical backtests may mix in real-time news, so reruns aren't guaranteed to match the paper's numbers. Another issue found that the paper claimed the sentiment agent could use Reddit/X data, but the actual code at one point had only Yahoo Finance's news feed. The project page and related notes can be followed from [TradingAgents](https://tradingagents-ai.github.io).

This problem isn't unique to TradingAgents. A [May 2026 study](https://arxiv.org/abs/2605.16895) simultaneously analyzed FinCon, FinMem, TradingAgents, FinAgent, QuantAgent, FLAG-Trader, and others, concluding that the alpha reported by end-to-end LLM trading agents should not be taken directly as deployable evidence.

A more fundamental problem comes from model behavior itself. [Related research](https://arxiv.org/abs/2409.11540) found LLMs tend to over-extrapolate trends in financial forecasting and produce systematic optimism bias, and simple prompt engineering doesn't fully eliminate it. Multiple models also share similar training corpora and underlying architectures, so as more agents participate in a market simultaneously, strategy homogenization is possible.

Of course, this doesn't mean AI has no value in investing. Chen, Kelly, and Xiu's [news-embedding research](https://papers.ssrn.com/sol3/Papers.cfm?abstract_id=4416687) achieved a very high long-short portfolio Sharpe, showing language models can indeed extract effective signals from unstructured financial information.

But the prerequisite here is institutional-grade news data, rigorous methodology design, and professional trading infrastructure, and the results are still before deducting actual transaction costs.

It proves "LLMs can be a quantitative-research tool," not "give a retail user a chatbot and it will reliably make money for you."

## Regulation isn't ready either

After AI agents directly operate securities accounts, there's also a new question: when the machine makes a wrong trade, who's responsible?

So far, neither China nor the US has built a complete rule set specifically for AI agent trading.

On the US side, on June 23, 2026, eight House Democrats wrote to the SEC, directly asking whether third-party AI agents should bear broker-dealer regulation, Reg BI, record-keeping, or fiduciary duties. The congressmen's framing was that these companies largely [operate outside the existing securities regulatory framework](https://foster.house.gov/media/press-releases/foster-sherman-seek-regulatory-clarity-agentic-ai-trading).

FINRA's 2026 regulatory report discusses AI agents for the first time, but the basic principle remains technology-neutral: even if advice or decisions are influenced by GenAI, financial institutions are still responsible for the related conduct. There's currently no standalone "AI agent trading license."

China's direction is similar. The Securities Association of China is discussing tiered access, algorithm registration, continuous testing, and responsibility chains, and the basic principle of financial regulators toward AI applications like fund trading remains "whoever uses it is responsible."

After a real dispute, users find it hard to pursue liability. A Beijing Internet Court generative-AI case in January 2026 clearly held that AI itself is not a civil subject, that generative AI is a service rather than a product, that service providers usually bear fault-based liability, and that they owe an obligation of method, not a guarantee of results, for accuracy. [People's Daily's coverage of the case](http://society.people.com.cn/n1/2026/0126/c1008-40652440.html) shows this judgment.

If financial trading develops along similar lines, a very real structure emerges: an agent can make decisions for the user automatically, but the final investment loss may not be easily transferred to the model provider.

This also explains why the disclaimers from Robinhood, eToro, and domestic brokers are written so cautiously.

## So, can investing with an AI agent actually make money?

The existing evidence isn't enough to answer "no," but it also falls far short of supporting "can reliably make money."

Real-money experiments already prove LLM agents can earn positive returns in certain markets and certain time windows. The problem is that champions keep changing; the same model, moved to another market, can go from first to last, and positive-return windows are currently generally only a few weeks.

When you reach real large-scale user data, the situation is actually worse. IC3 tracked 920k+ agent-token holders with a combined loss of $191.7M, with returns highly concentrated in the earliest small batch of wallets and a negative median user.

The clearest numbers come from the other side: brokers collect commissions, trading platforms collect fees and spreads, advisory companies collect service fees, and course companies collect tuition. These revenues don't need to wait for agents to prove long-term alpha.

So a more accurate reading of the headline isn't "investing with AI will definitely lose money," but:

**So far, selling AI investment tools already has a business model verifiable from financials and transaction structure; ordinary users relying on these tools for stable excess returns don't yet have evidence of the same level.**

Next time you see an investing agent claiming to make money, first look at five things:

1. Is it showing a backtest, a paper-trading simulation, or real money?
2. How long did the experiment run, and does it span different market environments?
3. Have returns deducted fees, slippage, and financing costs?
4. Is it showing the champion account, or the median return across all users?
5. Will the platform dare to publish the real long-term profit/loss distribution of users?

If these five questions can't be answered, then it should first be treated as an AI product, not an already-proven investment strategy.
