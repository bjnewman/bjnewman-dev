#!/usr/bin/env bun
/**
 * Lighthouse audit script using Google PageSpeed Insights API
 * No local Chrome permissions needed - uses Google's servers
 *
 * Usage: bun run scripts/lighthouse.ts [--mobile|--desktop]
 */

const PAGES = [
  '/',
  '/about/',
  '/blog/',
  '/projects/',
  '/resume/',
];

const BASE_URL = 'https://bjnewman.dev';
const API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

interface LighthouseResult {
  page: string;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  fcp: number;
  lcp: number;
  cls: number;
  tbt: number;
}

async function runAudit(path: string, strategy: 'mobile' | 'desktop'): Promise<LighthouseResult> {
  const url = `${BASE_URL}${path}`;
  const apiUrl = `${API_URL}?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;

  console.log(`  Auditing ${path}...`);

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const categories = data.lighthouseResult.categories;
  const audits = data.lighthouseResult.audits;

  return {
    page: path,
    performance: Math.round(categories.performance.score * 100),
    accessibility: Math.round(categories.accessibility.score * 100),
    bestPractices: Math.round(categories['best-practices'].score * 100),
    seo: Math.round(categories.seo.score * 100),
    fcp: Math.round(audits['first-contentful-paint'].numericValue),
    lcp: Math.round(audits['largest-contentful-paint'].numericValue),
    cls: audits['cumulative-layout-shift'].numericValue,
    tbt: Math.round(audits['total-blocking-time'].numericValue),
  };
}

function formatScore(score: number): string {
  if (score >= 90) return `\x1b[32m${score}\x1b[0m`; // Green
  if (score >= 50) return `\x1b[33m${score}\x1b[0m`; // Yellow
  return `\x1b[31m${score}\x1b[0m`; // Red
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const strategy = args.includes('--desktop') ? 'desktop' : 'mobile';
  const singlePage = args.find(a => a.startsWith('/'));

  const pagesToAudit = singlePage ? [singlePage] : PAGES;

  console.log(`\n🔍 Running Lighthouse audits (${strategy})...\n`);

  const results: LighthouseResult[] = [];
  let hasFailure = false;

  for (let i = 0; i < pagesToAudit.length; i++) {
    const page = pagesToAudit[i];
    try {
      const result = await runAudit(page, strategy);
      results.push(result);

      // Check thresholds
      if (result.performance < 90 || result.accessibility < 90) {
        hasFailure = true;
      }

      // Rate limit: wait 2 seconds between requests (except for last one)
      if (i < pagesToAudit.length - 1) {
        await delay(2000);
      }
    } catch (error) {
      console.error(`  ❌ Failed to audit ${page}: ${error}`);
      hasFailure = true;
    }
  }

  // Print results table
  console.log('\n📊 Results:\n');
  console.log('┌────────────────┬──────┬───────┬───────┬─────┬─────────┬─────────┬───────┬─────────┐');
  console.log('│ Page           │ Perf │ A11y  │ Best  │ SEO │ FCP     │ LCP     │ CLS   │ TBT     │');
  console.log('├────────────────┼──────┼───────┼───────┼─────┼─────────┼─────────┼───────┼─────────┤');

  for (const r of results) {
    const page = r.page.padEnd(14);
    const perf = formatScore(r.performance).padStart(14);
    const a11y = formatScore(r.accessibility).padStart(15);
    const best = formatScore(r.bestPractices).padStart(15);
    const seo = formatScore(r.seo).padStart(13);
    const fcp = formatTime(r.fcp).padStart(7);
    const lcp = formatTime(r.lcp).padStart(7);
    const cls = r.cls.toFixed(3).padStart(5);
    const tbt = formatTime(r.tbt).padStart(7);

    console.log(`│ ${page} │ ${perf} │ ${a11y} │ ${best} │ ${seo} │ ${fcp} │ ${lcp} │ ${cls} │ ${tbt} │`);
  }

  console.log('└────────────────┴──────┴───────┴───────┴─────┴─────────┴─────────┴───────┴─────────┘');

  // Summary
  console.log('\n📈 Thresholds: Performance ≥90, Accessibility ≥90\n');

  if (hasFailure) {
    console.log('❌ Some pages did not meet thresholds\n');
    process.exit(1);
  } else {
    console.log('✅ All pages meet thresholds!\n');
  }
}

main().catch(console.error);
