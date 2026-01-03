module.exports = {
  ci: {
    collect: {
      // Use the static build output
      staticDistDir: './dist',
      // URLs to test (relative to staticDistDir)
      url: [
        '/',
        '/about/',
        '/blog/',
        '/projects/',
        '/resume/',
      ],
      // Number of runs per URL for more stable results
      numberOfRuns: 1,
      // Use Playwright's Chromium (doesn't need macOS Automation permissions)
      chromePath: require('playwright').chromium.executablePath(),
      // Use desktop settings for more realistic local testing
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      // Performance budgets
      // Note: Local results may differ from production due to network/environment
      assertions: {
        // Core Web Vitals
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],

        // Specific metrics (desktop thresholds)
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 2500 }],
      },
    },
    upload: {
      // Store results locally (no external server needed)
      target: 'filesystem',
      outputDir: './.lighthouseci',
      reportFilenamePattern: '%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%',
    },
  },
};
