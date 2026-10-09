// Playwright end-to-end test settings. Run with:  npm run test:e2e
// The tests start their own local server (tools/serve.js) on port 4173.
'use strict';

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests/e2e',
    timeout: 60000,
    expect: { timeout: 15000 },
    fullyParallel: true,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
    use: {
        baseURL: 'http://127.0.0.1:4173/',
        trace: 'retain-on-failure'
    },
    projects: [
        { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
        // phone emulation; only tests tagged @mobile run here
        { name: 'mobile-chromium', use: { ...devices['Pixel 7'] }, grep: /@mobile/ }
    ],
    webServer: {
        command: 'node tools/serve.js 4173',
        url: 'http://127.0.0.1:4173/',
        reuseExistingServer: !process.env.CI,
        timeout: 30000
    }
});
