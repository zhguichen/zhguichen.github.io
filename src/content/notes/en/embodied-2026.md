---
title: "Embodied AI 2026: Robots Can Outrun Humans, So Why Can't They Fold a Shirt?"
slug: embodied-2026
lang: en
description: "A robot that can run doesn't mean it can work: the half-marathon record has been broken, but cooking, laundry, and folding clothes are still limited by complex environments and long-flow reliability; what can really scale in the near term is more likely factories and warehouses."
date: 2026-08-07T00:00:00+08:00
cover: ../assets/embodied-2026/hero.png
topic: AI Frontiers
tags: [Embodied AI, Robotics, Humanoid]
featured: false
draft: false
---

# Embodied AI 2026: Robots Can Outrun Humans, So Why Can't They Fold a Shirt?

![Side-by-side illustration: on the left a humanoid robot runs on a track; on the right one clumsily folds a shirt in a kitchen](../assets/embodied-2026/hero.png)

> **TL;DR:** Robots have proven they can run, and they can complete some repetitive tasks in factories and warehouses, but that's a long way from "autonomously doing housework at home." What's genuinely hard isn't succeeding once, but continuously handling soft objects, long workflows, and unexpected situations in cluttered environments. Today's household capabilities are still mostly demos, pilots, and sometimes even need remote human takeover. To judge when embodied AI matures, rather than asking "how many more years," ask whether it can complete real tasks stably, with little supervision, at low cost, and expand deployment.

In 2026, if you only look at public videos, humanoid robots seem almost ready to do everything: run half marathons, breakdance, do martial arts, juggle walnuts, fold clothes, even enter car factories and logistics warehouses.

At the Spring Festival gala, Galbot and Shen Teng and Ma Li shared the stage, completing walnut juggling, picking up glass shards, taking goods from shelves, folding clothes, and threading sausages; [Science and Technology Daily called it](https://www.stdaily.com/web/gdxw/2026-02/17/content_474989.html) the first robot at the gala capable of "fully autonomous decision-making to do work." In April, at the humanoid half-marathon in Beijing's Yizhuang, Unitree's "Lightning" finished in 50:26, faster than the men's half-marathon world record of 56:42; [CBS News also covered the race](https://www.cbsnews.com/news/humanoid-robot-half-marathon-beijing-human-world-record).

But if you reframe the question into something more practical: **is there actually a robot that can cook, do laundry, and wash dishes at home?**

The answer is: not yet.

As of August 2026, embodied intelligence has proven strong motor ability and is beginning to take on real tasks in industrial environments, but it's still far from a stable, autonomous "robot housekeeper." The key reason: motion control, object manipulation, long-horizon planning, and safety are not problems of the same difficulty.

## Where has the household robot gotten to?

If you break "can do housework" into specific tasks, the current state is much clearer.

| Task | Current status | What it can do | Main problem |
|---|---|---|---|
| Cooking | Demo / pilot | Take ingredients, heat in microwave or oven | No credible full cooking |
| Laundry | Demo | Put in and take out of washing machine | Unstable soft-object manipulation |
| Dishwashing | Demo | Clear table, load dishwasher | No complete wash-and-stow loop |
| Folding clothes | Demo | Fold pre-arranged clothing | Input and environment highly controlled |
| Full household flow | Small-scale pilot | Chain multiple tasks | Slow, insufficient stability |

Start with cooking. Wuhan Shiguang S1's breakfast flow mainly uses a microwave to heat; LG CLOiD put a croissant into the oven at CES, but [CNET reporters noticed on site](https://www.cnet.com/home/kitchen-and-household/lg-brought-a-robot-that-cooks-folds-laundry-and-empties-the-dishwasher-to-ces) that the oven door wasn't even closed during the demo. The 1X NEO's publicly shown kitchen abilities are also more about recognizing ingredients, suggesting recipes, and picking/placing items.

So when a vendor says "cooking" today, it usually still means taking ingredients, putting them in a device, heating, and taking them out. Full cooking involving chopping, stir-frying, heat control, and exception handling has no credible public case yet.

Laundry is harder. In September 2025, a TIME reporter watched Figure 03 put clothes into a washing machine; [the robot dropped the clothes on the floor twice](https://time.com/7324233/figure-03-robot-humanoid-reveal) before succeeding on the third try. The problem isn't that the robot can't do it at all, but that a household needs not "succeed once," but long-term stability.

Dishwashing is a bit further along. Figure 03 can already clear a dining table and load dishes into a dishwasher, but that still isn't completing washing, drying, and stowing. Figure CEO Brett Adcock said at the time: "We're not there yet."

Folding clothes is likewise easy to overestimate from a demo. LG CLOiD can indeed fold, but [CNET's verdict](https://www.cnet.com/home/kitchen-and-household/lg-brought-a-robot-that-cooks-folds-laundry-and-empties-the-dishwasher-to-ces) was "somewhat sloppily," and the towel was pre-arranged by staff. [Engadget thus called the whole showcase](https://www.engadget.com/home/smart-home/lgs-cloid-robot-can-fold-laundry-and-serve-food-very-slowly-181902306.html) a "carefully choreographed 15-minute demo." The Verge specifically tested robot laundry at CES and [concluded](https://www.theverge.com/featured-video/860104/we-tried-to-get-humanoid-robots-to-do-the-laundry) the industry is still stuck in Demo Mode.

The real problem is no longer "has the robot done it," but: **how many consecutive times can it succeed, can it still do it after the environment changes, and does it need a human to take over in the middle.**

## Wuhan Shiguang S1: one of the few cases in real homes

The case closest to a real home scenario right now is Wuhan Shiguang S1.

It's a wheeled robot, not bipedal. After its May launch, it entered the Guanggu Talent Apartment for testing; [Hubei Daily reported earlier](https://news.hubeidaily.net/pc/c_5599535.html) that the project planned to open 100 free home trials.

In a floor plan of about 150 square meters, S1 can chain together fetching items, microwave heating, clearing the dining table, washing dishes, taking clothes, folding clothes, and stowing. The vendor says the complete flow takes about 7-8 minutes at the fastest.

On June 8, [Hubei Daily reporters ran an on-site test](https://news.hubeidaily.net/pc/c_5613011.html): the breakfast flow took about 8 minutes, visibly slower than a human but logically coherent; if someone blocks the way or an item is moved, the robot can re-plan its path.

This is already a step beyond a launch demo, but the vendor also admits it still can't fully serve as a "housekeeper." And the pilot timeline still has inconsistent accounts, and as of early August there was no follow-up reporting of large-scale home deployment.

So S1 is better defined as a **real-home pilot**, not a mature household robot.

## The "88% household failure rate" is actually misread

A number often appears online: robots fail at housework 88% of the time.

It wasn't measured directly.

That claim comes from a "success rate of about 12%" in the Stanford 2026 AI Index Report, which media then derived into 88% by subtracting 12% from 100%.

More importantly, this 12% isn't real-home data; it comes from the 2025 BEHAVIOR Challenge, a simulation test. The contest selected 50 long-horizon household tasks, and the best team's full-task success rate was about 12.4%, with relevant data in the [Stanford AI Index 2026 technical chapter](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_2_technical.pdf).

So the accurate statement should be:

> **On the long-horizon household benchmark in simulation, the best current system's full-task success rate is about 12.4%.**

What's the real failure rate in actual homes? No one knows, because robots haven't formed a large enough real-home deployment sample.

And after transferring from simulation to real machines, performance usually drops further. In BEHAVIOR-1K tests, a real-machine system with human-input assistance reached about 22%, fully self-learned methods even 0%, while in simulation it could reach about 40%.

This is the Sim-to-Real Gap: being able to do it in a simulator doesn't mean it can be done in reality.

## Why can a robot run a half marathon but not fold a shirt well?

Because motion and manipulation are two completely different classes of problems.

Running, jumping, and balancing mainly handle the robot's own dynamics, including center of mass, inertia, joint control, and foot placement. These problems are hard, but the physics is clear, and reinforcement learning, simulation training, and Sim-to-Real have accumulated for years.

Housework requires the robot to keep handling unpredictable external environments. Clothes deform randomly, cups slip, every home's kitchen layout differs, and the arrangement on the same table changes daily.

The home scenario concentrates four hard problems at once:

**Unstructured environments, soft objects, long-horizon tasks, and low fault tolerance.**

Long-horizon tasks especially. Suppose the robot's per-step success rate is already 99%; to complete 50 consecutive steps, the overall success rate is only:

`0.99^50 ≈ 60.5%`

If the per-step rate is 95%, then only:

`0.95^50 ≈ 7.7%`

So "being able to pick up a cup" and "being able to independently clean the whole kitchen" aren't just a few more actions; the error accumulates along the task chain.

Long ago, IEEE Spectrum recorded PR2's household experiments: completing a breakfast-related task took about 90 minutes, and the cleanup task failed 2 out of 5 times. [Such experiments](https://spectrum.ieee.org/hard-for-robots-autonomous-household-chores) still explain why household robots are so hard today.

## What's holding robots back now is mainly data and manipulation capability

Current embodied intelligence increasingly relies on VLA, i.e., Vision-Language-Action models, which learn "what is seen," "what the user wants," and "how to move next" in a single model.

The problem is that robot data is very hard to collect.

Language models can use internet text directly, but robot action data usually requires human teleoperation, repeatedly completing tasks like picking up a cup, opening a fridge, folding clothes, and loading a dishwasher. Each piece of data needs real time, and data from different robot bodies and hands may not be directly reusable.

Internet video is plentiful, but lacks precise robot action labels. You can see a person folding clothes, but you don't know how much force each finger used or when the joints moved.

This is why teleoperation is now both a fallback and a data-collection method.

Control frequency, by contrast, has already progressed quickly. Early RT-2 was usually only 1-3Hz; π0 raised it to 50Hz; π0-FAST can reach 200Hz. The truly hard questions have gradually become: does the robot understand the object, where to grasp it, how much force, can it recover after a failure, and whether it's safe to work alongside a person.

[State of Robotics 2026](https://www.roboticscenter.ai/state-of-robotics-2026) still lists dexterous-hand manipulation as one of the most important unsolved problems in practical robotics.

So "robots only know how to dance" is only half right. It underestimates the real progress in motion control, but if you conclude from that that robots can immediately cook and do laundry, you've clearly overestimated manipulation.

## The robots actually working are still in factories and warehouses

If household robots are mainly demos and pilots, where did the tens of thousands of already-produced robots go?

Mainly factories and warehouses.

The Figure-BMW partnership is a typical case. Two Figure 02 robots perform sheet-metal loading tasks at BMW's Spartanburg plant, having loaded more than 90,000 parts cumulatively and run over 1,250 hours. During the partnership, the relevant line produced more than 30,000 BMW X3s.

Note the phrasing here: the robots **participate in production**, not "produced 30,000 BMWs." Figure and [BMW's official press release](https://www.press.bmwgroup.com/global/article/detail/T0455864EN/bmw-group-to-deploy-humanoid-robots-in-production-in-germany-for-the-first-time?language=en) are basically aligned on this.

Agility Robotics' Digit has already moved more than 100,000 totes cumulatively at GXO warehouses.

Warehouses and factories are easier to commercialize because the environment is relatively standardized: flat ground, fixed routes, standardized items, repetitive tasks, and companies can directly compute uptime, throughput, error rate, and labor cost.

Chinese manufacturers have also entered the tens-of-thousands range. Per Omdia estimates, Agibot shipped about 5,168 units in 2025; on June 28, 2026, Agibot announced its 15,000th robot off the line. Galbot S1 has also entered CATL's production line.

Different institutions' industry totals don't agree, but the direction is clear: **shipments are rising fast, and the real demand for scale comes mainly from industry, not homes.**

The reason is simple. The four hardest things for a home are unstructured environments, soft objects, long workflows, and low fault tolerance, while a factory can cut away most of them.

## What can an ordinary consumer buy now?

You can buy a robot, but it's hard to buy a true "robot housekeeper."

The clearest home-positioned product is the 1X NEO. [1X's site](https://www.1x.tech/discover/neo-home-robot) lists an early-bird price of $20,000, with an option for $499/month subscription.

But NEO's most critical feature isn't hardware; it's Expert Mode: when the robot doesn't know how to complete a household task, the user can book a 1X Expert to take over remotely.

In other words, the current NEO is closer to:

**Robot hardware + AI model + cloud remote human.**

1X CEO Bernt Børnich has also said publicly that many early tasks will be done by teleoperators, and [Engadget has a full introduction to this model](https://www.engadget.com/ai/1x-neo-is-a-20000-home-robot-that-will-learn-chores-via-teleoperation-040252200.html).

Real-world tests agree. When WSJ reporter Joanna Stern tested NEO, operations like taking a bottle from the fridge, loading dishes, and tidying were actually performed by a person in another room wearing a VR headset; [the on-site video](https://www.youtube.com/watch?v=f3c4mQty_so) shows this. Wired later asked 1X, and the company acknowledged that the public content includes both autonomous runs and human-controlled footage, [used to show the hardware's capability ceiling](https://www.wired.com/story/the-1x-neo-robot-has-freaky-fast-fingers/).

As of July 16, 2026, [RoboZaps' audit](https://blog.robozaps.com/b/1x-neo-review) still found no verified consumer delivery case.

Unitree G1, though starting around $16,000, is essentially a development platform, not an appliance you take home and it works. [The Robot Report's product coverage](https://www.therobotreport.com/unitree-robotics-unveils-g1-humanoid-for-16k) shows the EDU and dexterous-hand versions cost significantly more.

So today a consumer can buy robot hardware, a development platform, and some robot services, but not a mature general-purpose household robot.

## Rather than asking "how many more years," ask how many gates it's passed

Vendors and academics differ widely on when household robots will mature.

In a 2026 Boao Forum discussion, [SenseTime's Wang Xiaogang estimated about 2 years, Unitree's Wang Xingxing two to three, and Star Dynamics' Chen Jianyu about 5](https://www.guancha.cn/xiongyoujun/2026_03_27_811581.shtml); while vivo's Shao Hao and Tsinghua's Zhao Mingguo both leaned toward about 10 years. Baidu's Shen Dou may be closer to reality: embodied intelligence may not have a clear "ChatGPT moment," and progress may be incremental.

More meaningful than a time prediction is looking at validation metrics. RoboZaps' ["Gates, not years"](https://blog.robozaps.com/b/future-of-humanoid-robots) can be distilled into six questions:

1. **Repeatability**: can it still complete stably after a change of environment;
2. **Human supervision**: how many tasks need teleoperation and human takeover;
3. **Endurance**: how long it can work in one run;
4. **Safety**: is there force limiting, e-stop, and accident response;
5. **Economics**: counting maintenance, support, insurance, and labor, what's the real cost;
6. **Scale**: if ten units run well, can ten thousand still hold up.

These six questions are closer to product reality than "is it an AGI robot in two years."

## The real change in 2026 is that robots started being validated

If you simplify embodied intelligence into "can" and "can't," it's easy to go to one of two extremes: one side thinks robots only dance, the other thinks robots will handle all housework in two or three years.

The current evidence supports neither.

The more accurate state is:

Motion control is already strong; industrial scenarios are moving from demo to real deployment; fine manipulation is improving fast, but stability clearly lags; home environments mostly remain at display, media tests, small-scale pilots, consumer pre-orders, and the "robot + remote human" hybrid model.

So whether a robot can cook and do laundry depends on how you define "can."

If the standard is completing an action once at a launch event, then many robots already can.

If the standard is that an ordinary consumer can buy one, put it in their home, and every day it autonomously, safely, and stably cooks, does laundry, washes dishes, and folds clothes, without relying on engineers or remote operators, then as of August 2026 the answer is still no.

The case closest to real-home work right now is a pilot like Wuhan Shiguang S1; the closest to a consumer product is the 1X NEO, but it still explicitly retains Expert Mode. Industrial scenarios have gone much further: Figure counts by parts at BMW, Digit counts by totes at GXO, and Chinese manufacturers are counting output by the thousand or ten-thousand.

That may be the most important dividing line for embodied intelligence in 2026:

> **Factories are already asking "how much work can a robot do in a day," while homes are still asking "is this demo actually autonomous."**

2026 isn't the year household robots truly matured, but it may be a more important milestone: robots are starting to move from "looks impressive" into a phase of "must prove it can work with real operating data."
