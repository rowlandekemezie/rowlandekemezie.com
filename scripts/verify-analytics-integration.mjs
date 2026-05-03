import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = process.cwd();
const distDir = resolve(rootDir, 'dist');
const token = 'test-cloudflare-analytics-token';

execFileSync('yarn', ['build'], {
  cwd: rootDir,
  env: {
    ...process.env,
    PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN: token,
  },
  stdio: 'pipe',
});

const home = readFileSync(resolve(distDir, 'index.html'), 'utf8');
const topThirty = readFileSync(
  resolve(distDir, 'posts', 'top-30-things-i-learnt-at-gitstart', 'index.html'),
  'utf8'
);

const assertions = [
  ['Home page includes the Cloudflare Insights beacon asset', home.includes('https://static.cloudflareinsights.com/beacon.min.js')],
  ['Home page includes the configured analytics token', home.includes(token)],
  ['Post page includes the Cloudflare Insights beacon asset', topThirty.includes('https://static.cloudflareinsights.com/beacon.min.js')],
  ['Post page includes the configured analytics token', topThirty.includes(token)],
];

for (const [description, passed] of assertions) {
  if (!passed) {
    throw new Error(`Analytics integration verification failed: ${description}`);
  }
}

console.log('Analytics integration verification passed.');
