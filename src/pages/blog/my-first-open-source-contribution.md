---
title: "My First Real Open Source Contribution"
date: "2026-01-02"
description: "From closed PR to submitted fix: contributing to Stylelint with AI assistance, and what I learned about open source culture along the way."
layout: ../../layouts/BlogPost.astro
---

For years, I've been a consumer of open source software. Every project I build stands on the shoulders of giants—Astro, React, TypeScript, Bun, and countless other tools that make modern web development possible. But I've never made a *real* contribution back to the ecosystem.

That changes now.

## Why Now?

Building this site with Astro and Bun has been eye-opening. These tools align so closely with my philosophy of web development:

- **Fast by default** - No unnecessary complexity
- **Developer experience first** - Tools should be delightful to use
- **Modern standards** - Embrace the platform, don't fight it

I want to give back to the projects that enable this kind of development.

## The Projects I'm Considering

### Option 1: e18e - Ecosystem Performance Initiative

**Why it matters to me:**
The [e18e project](https://e18e.dev/) represents exactly the kind of front-end development philosophy I believe in. Their mission is to improve the JavaScript ecosystem through three core pillars:

- **Cleanup** - Removing redundant dependencies and bloat
- **Speedup** - Enhancing performance across packages
- **Levelup** - Creating modern alternatives to outdated tools

This aligns perfectly with my focus on fast-by-default development, minimal complexity, and embracing modern standards.

**What does an e18e contribution look like?**

Here's a perfect example: [Jest PR #15922](https://github.com/jestjs/jest/pull/15922) replaced `micromatch` with the lighter `picomatch` across the entire Jest codebase. The result:
- Removed 5+ packages from the dependency tree
- Eliminated transitive dependencies
- Reduced bundle size
- Improved code consistency by using a shared utility function
- Zero breaking changes

This is **exactly** the kind of impact I want to make.

**Potential contribution ideas:**
- Identify heavy dependencies that can be replaced with lighter alternatives
- Document dependency reduction opportunities in popular packages
- Create benchmarks comparing alternative libraries
- Submit PRs removing redundant dependencies (like the micromatch → picomatch example)
- Write migration guides for swapping bloated deps with modern equivalents

**Community:**
- [GitHub Organization](https://github.com/e18e)
- Active Discord for collaboration
- Comprehensive documentation
- MIT licensed and welcoming to new contributors

### Option 2: Bun

**Why it matters:**
This entire site runs on Bun. The performance compared to Node.js is remarkable, and the DX improvements are genuinely meaningful.

**Potential contributions:**
- Documentation for edge cases I've encountered
- Examples and guides for common patterns
- Test coverage improvements

### Option 3: Astro

**Why it matters:**
Astro's islands architecture is brilliant. Partial hydration is the future of web performance.

**Potential contributions:**
- Starter templates
- Integration improvements
- Documentation for advanced patterns

## My Approach

I'm not trying to reinvent the wheel or do deep ecosystem analysis. Instead, I want to contribute to projects I already use and trust:

**Projects I use daily at work:**
- **Jest** - Our entire test suite runs on it
- **ESLint** - Lints every file I write
- **lint-staged** - Runs on every commit via Husky

**The e18e community has already done the research.** They've identified opportunities, created umbrella issues, and documented successful PR patterns. I just need to:

1. Pick a project I actually use
2. Look for an e18e umbrella issue tracking improvements to that project
3. Follow the existing PR examples
4. Submit a similar improvement

For example: I use **lint-staged** daily via Husky hooks. Rather than migrating to alternatives, I could review lint-staged's dependencies for lighter alternatives - just like Jest did with micromatch → picomatch. If there's a way to make a tool I use every day faster and lighter, why not contribute that improvement?

## What I'm Learning

Even planning this contribution has been educational:

- **Reading other people's code** teaches you patterns you'd never discover alone
- **Understanding project structure** reveals architectural decisions and their tradeoffs
- **Community engagement** shows how successful OSS projects actually work

## Specific Opportunities

Since I want to contribute to projects I actually use, here's what I'm considering:

### Option 1: Jest improvements
Jest already had a successful e18e contribution ([PR #15922](https://github.com/jestjs/jest/pull/15922) - micromatch → picomatch). Are there other dependencies in Jest that could be modernized? I'd need to check the e18e umbrella issues to see if any track Jest dependencies.

### Option 2: ESLint ecosystem
ESLint is another massive project I use daily. The e18e [ecosystem-issues](https://github.com/e18e/ecosystem-issues) tracker has an "ESLint dependencies & performance" umbrella issue ([#205](https://github.com/e18e/ecosystem-issues/issues/205)) that might have opportunities.

### Option 3: Improve lint-staged performance
I use `lint-staged` daily at work via Husky hooks. Instead of migrating to alternatives, I could improve lint-staged itself by:
- Reviewing lint-staged's dependencies for lighter alternatives
- Looking for opportunities similar to Jest's micromatch → picomatch swap
- Running benchmarks to prove bundle size and performance improvements
- Submitting a PR to lint-staged with measurable impact

This follows the exact pattern of the Jest PR: find a heavy dependency within a project I use, replace it with a lighter alternative, prove the improvement with data.

## Next Steps

- [ ] Join the e18e Discord community
- [ ] Pick a target project (Jest, ESLint, or lint-staged)
- [ ] Analyze the project's dependency tree for heavy dependencies
- [ ] Check e18e umbrella issues for known improvement opportunities
- [ ] Fork the project and swap a heavy dependency for a lighter alternative
- [ ] Run tests, verify all checks pass
- [ ] Benchmark the improvement (bundle size, dependency count, install time)
- [ ] Submit PR with before/after metrics
- [ ] Document the experience for others to follow

## Update: The Contribution

**2026-01-01**: I completed the micromatch → picomatch migration for lint-staged!

### What I Did

Following the exact pattern from the [Jest PR #15922](https://github.com/jestjs/jest/pull/15922), I:

1. **Analyzed lint-staged's dependencies** - Found that lint-staged was using micromatch for glob pattern matching in [`lib/generateTasks.js`](https://github.com/lint-staged/lint-staged/blob/main/lib/generateTasks.js)

2. **Made the swap** - Replaced micromatch with picomatch:
   - Updated `package.json`: `micromatch@^4.0.8` → `picomatch@^4.0.2`
   - Converted the micromatch API call to picomatch's matcher function pattern
   - Removed unnecessary options (`cwd`, `posixSlashes`, `strictBrackets`)
   - Kept essential options (`dot: true`, `matchBase: !pattern.includes('/')`)

3. **Ran all tests** - All 343 tests passed with 100% code coverage across 66 test files

4. **Verified the impact**:
   - Micromatch removed as a runtime dependency (now only used by devDependencies)
   - Picomatch was already in the dependency tree via vitest and other tools
   - Net result: Cleaner dependency tree, lighter package

### The Key Learning

The tricky part was understanding picomatch's API. Micromatch returns an array of matched strings, while picomatch returns a matcher function. The solution:

```javascript
// Before (micromatch):
const matches = micromatch(filePaths, pattern, options)

// After (picomatch):
const isMatch = picomatch(pattern, options)
const matches = filePaths.filter((filepath) => isMatch(filepath))
```

**Important**: Wrap the matcher in an arrow function when passing to `.filter()` - otherwise the filter's extra arguments (index, array) interfere with matching.

### What Happened Next

I opened a PR to lint-staged, but then discovered [issue #1644](https://github.com/lint-staged/lint-staged/issues/1644) where the maintainer had previously expressed their preference: *"I won't accept external contributions for [dependency replacements]. I need to feel comfortable with choices like these, and thus prefer to do it myself."*

Respecting the maintainer's wishes, I closed the PR myself and moved on. Open source is as much about respecting other developers' preferences as it is about code.

## Lessons Learned

1. **Check contribution culture first** - Before investing hours in a PR, look for signals about how the maintainer handles external contributions. Check recent issues and PRs for their communication style.

2. **Some maintainers prefer ownership** - And that's valid. Dependency choices affect long-term maintenance, and some maintainers want to personally evaluate every swap.

3. **The work wasn't wasted** - I learned the micromatch → picomatch pattern, got 343 tests passing, and understood npm lockfile quirks. That knowledge transfers to the next project.

4. **Look for welcoming signals** - Projects with "good first issue" labels, active contributor discussions, and explicit contribution guidelines are better targets.

## Following Along

If you're considering making your first open source contribution, I encourage you to:

1. Pick a project you actually use
2. **Check their contribution culture before diving in**
3. Look for proven patterns (like the micromatch → picomatch swap)
4. Follow existing examples from similar PRs
5. Let the tests and data validate your work
6. Be gracious if the PR isn't accepted - move on to a more welcoming project

The open source community has given us so much. It's time to give back - to projects that want our help.

## Update: Success with Stylelint (with AI Assistance)

**2026-01-02**: After the lint-staged experience, I found a better target: [Stylelint](https://stylelint.io/).

### A Note on Process

I used [Claude Code](https://claude.ai/claude-code) for this. We worked on it together—Claude handled a lot of the exploration and boilerplate, I found the issue, pointed to the maintainer's approach, wrote some code, and made the judgment calls.

### Finding the Right Issue

We looked for projects with clear "good first issue" labels and welcoming contribution guidelines. Stylelint's [issue #3972](https://github.com/stylelint/stylelint/issues/3972) stood out:

> The `no-duplicate-selectors` rule doesn't detect that `.u-m\00002b {}` and `.u-m\+ {}` are duplicates.

Both selectors represent `.u-m+`, with different CSS escape formats. Open since 2019, with a maintainer's suggested approach in the comments.

### The Fix

We didn't invent the solution—a Stylelint maintainer had [pointed it out in 2024](https://github.com/stylelint/stylelint/issues/3972#issuecomment-2499543310). Claude implemented it.

The `postcss-selector-parser` library has a clever getter/setter pattern for class name nodes:

- The **getter** returns the unescaped value
- The **setter** re-escapes it in a normalized form

By doing `node.value = node.value` (self-assignment), we trigger this normalization. CSS escape sequences like `\00002b`, `\2b`, and `\+` all represent the same character, and this trick makes them compare as equal.

```javascript
function normalizeNodeEscaping(node) {
  if (parser.isClassName(node)) {
    // Self-assignment triggers the setter which normalizes escaping
    node.value = node.value;
  }
}
```

### The Result

- All 71 existing tests pass
- Added two test cases to verify the fix
- PR submitted: [#8953](https://github.com/stylelint/stylelint/pull/8953)

### Why This Worked (vs lint-staged)

1. **Clear maintainer guidance** - The solution was already outlined in the issue
2. **Welcoming contribution culture** - Stylelint has active external contributors
3. **Scoped fix** - Minimal change, not a sweeping dependency swap
4. **Test-driven** - Tests first, implementation second

### Lessons

1. **Read the issue comments** - The maintainer described the solution. We implemented it.

2. **Keep scope minimal** - Claude started adding extra features. I pulled it back to what the issue actually needed.

3. **Build systems matter** - Stylelint needs both `.mjs` and `.cjs` versions committed. Took us a bit to figure that out.

4. **Fix your environment first** - We spent time on fnm setup and broken VS Code symlinks before we could even commit.

## What's Next

The PR is submitted. We'll follow up on feedback, address any review comments, and see it through. What I've learned so far:

1. Find projects with welcoming contribution cultures
2. Look for issues where maintainers have already outlined the approach
3. Start small and focused
4. Let tests validate the work
5. Be prepared for build/CI requirements

More updates to come.

---

*Want to follow my journey? Subscribe to the [RSS feed](/rss.xml) or check back for updates.*
