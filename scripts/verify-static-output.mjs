import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve(process.cwd(), 'dist');

const requiredFiles = [
  'index.html',
  'logos/logo-1024.png',
  'logos/logo-48.png',
  'rss.xml',
  'robots.txt',
  'sitemap.xml',
  'tags/index.html',
  'categories/index.html',
  'bold-mage/index.html',
];

for (const relativePath of requiredFiles) {
  const absolutePath = resolve(distDir, relativePath);

  if (!existsSync(absolutePath)) {
    throw new Error(`Missing expected build artifact: ${relativePath}`);
  }
}

const home = readFileSync(resolve(distDir, 'index.html'), 'utf8');
const rss = readFileSync(resolve(distDir, 'rss.xml'), 'utf8');
const sitemap = readFileSync(resolve(distDir, 'sitemap.xml'), 'utf8');
const robots = readFileSync(resolve(distDir, 'robots.txt'), 'utf8');

const assertions = [
  ['Home page includes the favicon asset path', home.includes('/logos/logo-48.png')],
  ['Home page does not reference a missing rowland.jpeg asset', !home.includes('/rowland.jpeg')],
  ['RSS contains the site feed title', rss.includes('<title>Rowland I. Ekemezie</title>')],
  ['RSS contains a canonical post URL', rss.includes('https://rowlandekemezie.com/bold-mage/')],
  ['Sitemap contains the site root URL', sitemap.includes('<loc>https://rowlandekemezie.com/</loc>')],
  ['Sitemap contains a taxonomy URL', sitemap.includes('<loc>https://rowlandekemezie.com/tags/programming/</loc>')],
  ['Robots references the canonical sitemap URL', robots.includes('Sitemap: https://rowlandekemezie.com/sitemap.xml')],
];

for (const [description, passed] of assertions) {
  if (!passed) {
    throw new Error(`Static output verification failed: ${description}`);
  }
}

console.log('Static output verification passed.');
