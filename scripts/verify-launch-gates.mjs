import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve(process.cwd(), 'dist');

const routes = {
  about: 'pages/about/index.html',
  home: 'index.html',
  percy: 'posts/improving-your-visual-review-with-percy/index.html',
  topThirty: 'posts/top-30-things-i-learnt-at-gitstart/index.html',
};

const sizeBudgetBytes = {
  about: 12_000,
  home: 18_000,
  percy: 35_000,
  topThirty: 35_000,
};

function readRoute(route) {
  return readFileSync(resolve(distDir, route), 'utf8');
}

function routeSize(route) {
  return statSync(resolve(distDir, route)).size;
}

const home = readRoute(routes.home);
const about = readRoute(routes.about);
const topThirty = readRoute(routes.topThirty);
const percy = readRoute(routes.percy);

const assertions = [
  ['Home HTML stays within the size budget', routeSize(routes.home) <= sizeBudgetBytes.home],
  ['About HTML stays within the size budget', routeSize(routes.about) <= sizeBudgetBytes.about],
  ['Top 30 article HTML stays within the size budget', routeSize(routes.topThirty) <= sizeBudgetBytes.topThirty],
  ['Percy article HTML stays within the size budget', routeSize(routes.percy) <= sizeBudgetBytes.percy],
  ['Home emits a canonical URL', home.includes('<link rel="canonical" href="https://rowlandekemezie.com/">')],
  ['About page emits a canonical URL', about.includes('<link rel="canonical" href="https://rowlandekemezie.com/pages/about/">')],
  ['Top 30 article emits article Open Graph type', topThirty.includes('<meta property="og:type" content="article">')],
  ['Top 30 article emits BlogPosting JSON-LD', topThirty.includes('"@type":"BlogPosting"')],
  ['Top 30 article emits a Twitter image', topThirty.includes('<meta name="twitter:image" content="https://rowlandekemezie.com/_astro/')],
  ['Percy article emits article Open Graph type', percy.includes('<meta property="og:type" content="article">')],
  ['Percy article emits BlogPosting JSON-LD', percy.includes('"@type":"BlogPosting"')],
  ['Percy article emits a Twitter image', percy.includes('<meta name="twitter:image" content="https://rowlandekemezie.com/_astro/')],
];

for (const [description, passed] of assertions) {
  if (!passed) {
    throw new Error(`Launch gate verification failed: ${description}`);
  }
}

console.log('Launch gate verification passed.');
