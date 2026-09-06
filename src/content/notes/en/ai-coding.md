---
title: 'AI Coding: From Chat to an Agent-Driven Workflow'
slug: ai-coding
lang: en
description: The point of AI coding is not to treat AI as a chat window, but to let an agent work inside a real project, accumulate compounding assets, and use a test-and-feedback loop to guarantee quality.
date: 2026-09-06T00:00:00+08:00
topic: AI Engineering
tags: [AI Coding, Agent, Workflow]
featured: false
draft: false
---

# AI Coding: From Chat to an Agent-Driven Workflow

The most common mistake when coding with AI is treating it like a slightly smarter chat window. The genuinely useful approach is to let an agent work inside a real project and turn every task into an asset that compounds over time. This post records the approach I've settled on, in four parts: the mindset shift, asset accumulation, workflow engineering, and the quality loop.

## 1. The mindset shift — from chat to agent

### Don't treat AI as just a chat window

Chat mode is fine for Q&A, explanation, and polishing, but it's not suited to complex projects. Complex tasks require AI to read files, modify code, run tests, and inspect results — not just hand back an answer in a dialog box.

### Let AI work inside a real project environment

The core of AI coding is letting the agent work inside the project directory. It should be able to read the full context — code, docs, configs, tests, and historical rules — rather than relying on you to manually paste a few fragments.

### The goal is not to finish one task, but to change the workflow

The real value is not "this time AI finished it for me," but that after this task is done, the next similar task can be done faster, more reliably, and with less dependence on you.

## 2. Building compounding AI assets

### Long-term personal assets

Distill the experience you accumulate from long-term AI use: common rules, prompts, skills, MCP, debugging methods, code review rules, project templates, and so on.

Keep these in a dedicated folder, collecting and iterating on them over time, to form your own AI coding toolbox.

### Project-context assets

Every project should have a manual that AI can read, such as `AGENTS.md`, `CLAUDE.md`, `rules.md`, or `README.md`.

Document the project architecture, directory structure, tech stack, testing methods, commit conventions, deployment process, common pitfalls, and which files should not be changed casually.

### Task-derived assets

After every completed task, try to leave behind reusable things: test scripts, shared components, unified configs, requirement docs, implementation notes, acceptance criteria, and debug records.

These assets mean the next task of the same kind doesn't start from zero.

## 3. Engineering the requirement-to-implementation process

### Clarify requirements before writing code

Don't have AI implement immediately. First let it ask about the background, goals, constraints, missing context, and risk points. The clearer the requirements, the less rework later.

### Document first

Write requirements into `PRD.md`, `change_request.md`, or a requirements doc, rather than keeping them only in chat history.

The doc should state clearly: what problem is being solved, why it's being done, what is in scope, what is out of scope, impact area, acceptance criteria, and testing approach.

### Use Plan Mode for big requirements

If a requirement is large or hard, have AI break it into a plan first. Ask it to state which modules need changing, how many steps, how each step is verified, and what risks may arise. You review the plan, then let it execute.

### Let the agent dispatch subtasks

For even larger tasks, let the main agent split up subagents on its own — one reading code, one writing tests, one implementing, one reviewing. You don't need to micromanage every detail; your job is to define the goal and acceptance criteria clearly.

## 4. Using a test-and-feedback loop to guarantee quality

### Tests first

The most important thing in AI coding is defining what "done" means. So write down the acceptance criteria and testing approach before implementation, so AI knows how to judge whether it got it right.

### Let AI run the loop itself

The ideal flow is: AI modifies code, runs tests, sees a failure, reads the error, locates the problem, fixes it, tests again, until it passes.

This is far more efficient than "AI writes a bit, human checks a bit."

### Fix bugs at the source

If AI gets something wrong, don't just correct it repeatedly in the chat. Go back to the source: is the requirements doc unclear, is a rules file missing, are tests not covering it, or was the context wrong?

Then fix the corresponding doc, rules, tests, or project description. That way this debug session becomes a long-term asset too.

### Use a second task to check for compounding

The first AI coding session may not be especially fast. The key is whether, on a second similar requirement, you can directly reuse existing docs, rules, tests, and project structure.

If the second time you still have to explain a lot from scratch, it means the first time didn't really accumulate any assets.
