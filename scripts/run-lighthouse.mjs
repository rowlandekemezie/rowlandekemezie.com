import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const DEFAULT_URL = 'http://127.0.0.1:4326/';
const LIGHTHOUSE_BIN = resolve(process.cwd(), 'node_modules', '.bin', 'lighthouse');
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
].filter(Boolean);

function resolveChromePath() {
  const chromePath = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
  if (!chromePath) {
    throw new Error(
      'Unable to locate Chrome. Set CHROME_PATH or install Google Chrome in /Applications.'
    );
  }

  return chromePath;
}

function formatScore(score) {
  return `${Math.round(score * 100)}`;
}

function main() {
  const url = process.argv[2] ?? DEFAULT_URL;
  const chromePath = resolveChromePath();
  const tempDir = mkdtempSync(join(tmpdir(), 'lighthouse-'));
  const outputPath = join(tempDir, 'report.json');

  try {
    const categoryArgs = CATEGORIES.flatMap((category) => [`--only-categories=${category}`]);

    execFileSync(
      LIGHTHOUSE_BIN,
      [
        url,
        `--chrome-path=${chromePath}`,
        ...categoryArgs,
        '--output=json',
        `--output-path=${outputPath}`,
        '--quiet',
        '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
      ],
      { stdio: 'inherit' }
    );

    const report = JSON.parse(readFileSync(outputPath, 'utf8'));
    const finalUrl = report.finalDisplayedUrl || report.finalUrl || url;

    if (finalUrl.includes('cloudflareaccess.com')) {
      console.error('\nLighthouse audited a Cloudflare Access login page instead of the target site.');
      console.error(`Requested URL: ${url}`);
      console.error(`Final URL:     ${finalUrl}`);
      console.error(
        'Make the preview public, use an authenticated browser session, or audit a local preview URL instead.'
      );
      process.exitCode = 2;
      return;
    }

    const scores = {
      performance: report.categories.performance.score,
      accessibility: report.categories.accessibility.score,
      bestPractices: report.categories['best-practices'].score,
      seo: report.categories.seo.score,
    };

    console.log('\nLighthouse scores');
    console.log(`Performance:    ${formatScore(scores.performance)}`);
    console.log(`Accessibility:  ${formatScore(scores.accessibility)}`);
    console.log(`Best Practices: ${formatScore(scores.bestPractices)}`);
    console.log(`SEO:            ${formatScore(scores.seo)}`);
    console.log(`Final URL:      ${finalUrl}`);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

main();
