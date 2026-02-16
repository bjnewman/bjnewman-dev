---
title: "Recent Highlights: Vite Performance, Formal Specs, and Working with AI"
date: "2026-02-16"
description: "A merged Vite performance PR with rigorous benchmarks, two Claude Code plugins for formal specifications, and what I've learned about structured AI collaboration."
layout: ../../layouts/BlogPost.astro
---

Some quick thoughts this morning after more open source work this past week.

## Vite SSR Performance: Merged

[Vite PR #21632](https://github.com/vitejs/vite/pull/21632) landed today. The fix is four lines. The benchmark suite that proved it was necessary took considerably longer.

### The Problem

Vite's SSR module runner calls `isCircularImport` on every import edge — a depth-first traversal of the module graph to check for cycles that could cause deadlocks. The check is important during initial evaluation, but it also runs for modules that have *already* been fully evaluated. A resolved promise can't deadlock. The DFS was wasted work.

At 25K modules, this added 60-90 seconds to dev server startup. [Issue #20084](https://github.com/vitejs/vite/issues/20084) documented the pain.

### The Fix

```typescript
// fast path: already evaluated modules can't deadlock
if (mod.evaluated && mod.promise) {
  return this.processImport(await mod.promise, meta, metadata)
}
```

Skip the circular dependency check when a module is already evaluated. The check still runs during first evaluation, where cycles actually matter.

### The Benchmarking Approach

This is the part I want to talk about. An [earlier PR](https://github.com/vitejs/vite/pull/20085) attempted the same fix but stalled because the maintainer asked for concrete numbers. Fair enough — "it's faster" isn't a benchmark.

We built a proper benchmark:

**CPU profiling first.** Node's `--cpu-prof` flag generates profiles you can visualize in [speedscope](https://www.speedscope.app/). The flame graph showed `isCircularImport` dominating JavaScript execution time, with recursive DFS calls stacking across the entire profile. This confirmed *where* the time was going before we tried to fix it.

**Synthetic module graph.** We wrote a benchmark script that generates reproducible module graphs with configurable parameters: module count, average imports per module, and cycle density. Key details:

- **Seeded PRNG** (seed=42) for reproducibility — anyone running the benchmark gets identical results
- **Realistic graph topology** — chain for reachability, random cross-edges for density, back-edges for cycles
- **Uses Vite's public APIs** — `createServer` and `createServerModuleRunner` with a virtual plugin, not internal instrumentation

**Scaling analysis.** We ran the benchmark at multiple module counts to show the fix's behavior across scales:

| Modules | Before | After | Speedup |
|---------|--------|-------|---------|
| 100 | 3.9ms | 3.0ms | 1.3x |
| 500 | 33ms | 18ms | 1.8x |
| 1,000 | 124ms | 56ms | 2.2x |
| 5,000 | 2,650ms | 1,065ms | **2.5x** |

The speedup increases with graph size because the wasted DFS grows superlinearly — roughly quadratic with module count.

**The benchmark shipped with the PR.** The Vite maintainer [sapphi-red](https://github.com/sapphi-red) asked us to include the script in the repo so results could be tracked for regressions. That felt like validation of the approach: the benchmark was useful enough to keep.

### What Made This Work

Three things:

1. **Prove the problem before proposing the fix.** CPU profiles and flame graphs are hard to argue with. They show where time goes, not where you think it goes.

2. **Reproducible benchmarks over anecdotes.** A seeded PRNG means anyone can verify the numbers. Wall-clock measurements at multiple scales show the trend, not just a single data point.

3. **Use the project's own APIs.** The benchmark uses `createServer` and `createServerModuleRunner` — no monkey-patching internals. This makes the benchmark maintainable and trustworthy.

---

## Formal Specifications for AI Collaboration

Separately, I've been working on how I communicate with AI coding agents.

LLMs are imprecise by nature. That's the feature — they generalize, interpolate, handle ambiguity gracefully. But when you're giving an agent instructions like "always run tests before committing," that same flexibility works against you. The agent *usually* complies. "Usually" isn't good enough when you're trusting it with your git history.

The starting point was noticing that prose instructions drifted. I'd write rules in plain English, and the agent would interpret them loosely — especially across sessions where context was lost. But I also noticed that when the agent produced structured output on its own — Mermaid state diagrams, for instance — the reasoning around those outputs was tighter. That got me curious: what if the *inputs* were more structured too?

That led me down a rabbit hole into TLA+, Hoare logic, and Linear Temporal Logic — formal methods designed for specifying system behavior precisely. The research was encouraging.

### formalize-spec

[formalize-spec](https://github.com/bjnewman/formalize-spec) converts prose rules into formal notation. It's a [Claude Code](https://claude.ai/claude-code) plugin, though the notation itself is agent-agnostic. The notation draws from a few areas of computer science:

**Temporal invariants** (from Linear Temporal Logic):
```
G(edit(f) → f ∈ files_read)    — read before edit
G(commit → tests_pass)          — green before commit
G(pkg_cmd → uses_bun)           — use bun, not npm
```

**Hoare-style contracts** (preconditions and postconditions):
```
{bug_reported} fix {bug_resolved ∧ regression_test_exists}
  ORDERING: write_repro_test → verify_fail → fix → verify_pass
```

**Refinement types** (output constraints):
```
CommitMsg : {s | len(s) < 80 ∧ prefix(s) ∈ {feat,fix,refactor,...}}
```

LLMs can't mechanically verify formal logic — they're still pattern-matching, still imprecise. But structured notation is less ambiguous than prose, and that matters. Research backs this up — [HoarePrompt](https://arxiv.org/abs/2404.03471) found that Hoare-style triples improved correctness reasoning by 62-93% over natural language prompts. You can't make an LLM precise, but you can narrow the space of plausible interpretations.

### formalize-enforce

[formalize-enforce](https://github.com/bjnewman/formalize-enforce) is the companion plugin that goes further: it *mechanically blocks* tool calls that violate invariants. No prompt compliance required.

The architecture:

1. **Quint specs** (a TLA+-based language) define state machines with preconditions and transitions
2. **Agent hooks** intercept tool calls before they execute
3. If a precondition fails, the hook blocks the call and the agent gets a structured denial

Example: if the agent hasn't read a file yet, editing is blocked. If tests haven't passed since the last edit, committing is blocked. The agent can't forget or choose to skip these checks — they're enforced at the tool layer.

This is the difference between "please follow the rules" and "the rules are physically enforced." Both have their place, but for invariants I care deeply about (like testing before commits), mechanical enforcement removes an entire category of failure.

### Why This Matters

Working with AI agents across many sessions taught me that **context loss is the real enemy.** Sessions end, context windows compress, and the agent starts fresh with only the instructions you've written down. Formal notation survives this better than prose because there's less room for drift. `G(commit → tests_pass)` means exactly one thing. "Make sure to test before committing" leaves room for interpretation about what "test" means, what "before" means, and whether this is a strong or weak preference.

The combination of formal specs (narrowing interpretation) and mechanical enforcement (removing interpretation entirely) has made my workflow noticeably more reliable across agents. It doesn't make LLMs precise — nothing does. But it reduces the surface area where imprecision can hurt you.

---

## The Rest of the Open Source Work

The Vite PR was the big one — a few days of iteration getting the benchmarks right. But there were several smaller PRs opened for more straightforward modernization efforts: dependency swaps, ESM migrations, dropping legacy code. The kind of cleanup that's less dramatic but adds up across the ecosystem.

And then I had a physician-heal-thyself moment. I'd been spending evenings modernizing other people's projects while the open source app scaffolder and build tooling we use at work had its own pile of technical debt. So I switched focus there for a while. Same skills, closer to home.

---

## The Thread

These look like different projects — a Vite performance PR, a pair of specification plugins, a pile of ecosystem PRs. But they share a tension: **be as precise as you can, knowing that perfect precision isn't always possible.**

The Vite benchmarks are precise — seeded, reproducible, measurable. The formal specs are *aspirationally* precise — they narrow interpretation but can't eliminate it, because the thing reading them is an LLM. The ecosystem PRs are precise in a different way: small, focused, provable improvements.

You do what you can. You verify what you can. You accept that LLMs will always be trying to drift, and you build guardrails accordingly.

---

*Want to follow along? Subscribe to the [RSS feed](/rss.xml) or check back for updates.*
