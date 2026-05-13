import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve(process.cwd(), 'dist');

const requiredFiles = [
  'index.html',
  'logos/logo-1024.png',
  'logos/logo-48.png',
  'rss.xml',
  'robots.txt',
  'sitemap.xml',
  'page/1/index.html',
  'page/2/index.html',
  'pages/about/index.html',
  'tags/index.html',
  'tags/software-engineering/index.html',
  'categories/index.html',
  'categories/software/index.html',
  'posts/top-30-things-i-learnt-at-gitstart/index.html',
  'posts/improving-your-visual-review-with-percy/index.html',
];

for (const relativePath of requiredFiles) {
  const absolutePath = resolve(distDir, relativePath);

  if (!existsSync(absolutePath)) {
    throw new Error(`Missing expected build artifact: ${relativePath}`);
  }
}

const home = readFileSync(resolve(distDir, 'index.html'), 'utf8');
const pageOne = readFileSync(resolve(distDir, 'page', '1', 'index.html'), 'utf8');
const pageTwo = readFileSync(resolve(distDir, 'page', '2', 'index.html'), 'utf8');
const about = readFileSync(resolve(distDir, 'pages', 'about', 'index.html'), 'utf8');
const topThirty = readFileSync(
  resolve(distDir, 'posts', 'top-30-things-i-learnt-at-gitstart', 'index.html'),
  'utf8'
);
const percy = readFileSync(
  resolve(distDir, 'posts', 'improving-your-visual-review-with-percy', 'index.html'),
  'utf8'
);
const rss = readFileSync(resolve(distDir, 'rss.xml'), 'utf8');
const sitemap = readFileSync(resolve(distDir, 'sitemap.xml'), 'utf8');
const robots = readFileSync(resolve(distDir, 'robots.txt'), 'utf8');
const builtOutput = [home, pageOne, pageTwo, about, topThirty, percy, rss, sitemap, robots].join('\n');

const assertions = [
  ['Home page includes the favicon asset path', home.includes('/logos/logo-48.png')],
  ['Home page does not reference a missing rowland.jpeg asset', !home.includes('/rowland.jpeg')],
  ['Home page links to the imported GitStart article', home.includes('/posts/top-30-things-i-learnt-at-gitstart/')],
  ['Home page does not leak raw frontmatter image paths', !home.includes('src="./images/')],
  ['Home page includes generated Astro asset paths for cards', home.includes('/_astro/')],
  ['Page 1 archive includes pagination navigation', pageOne.includes('aria-label="Pagination"')],
  ['Page 2 archive renders the previous-page navigation', pageTwo.includes('← Prev')],
  ['About page is published under /pages/about/', about.includes('Meet Rowland I. Ekemezie')],
  ['About page preserves the real contact email', about.includes('rowlandresource@gmail.com')],
  ['Top 30 article exposes article Open Graph metadata', topThirty.includes('<meta property="og:type" content="article">')],
  ['Top 30 article exposes BlogPosting JSON-LD', topThirty.includes('"@type":"BlogPosting"')],
  ['Top 30 article uses the canonical imported post URL', topThirty.includes('https://rowlandekemezie.com/posts/top-30-things-i-learnt-at-gitstart/')],
  ['Top 30 article keeps the Disqus thread container', topThirty.includes('id="disqus_thread"')],
  ['Top 30 article keeps the slug-based Disqus identifier', topThirty.includes('this.page.identifier = "/posts/top-30-things-i-learnt-at-gitstart/";')],
  ['Top 30 article does not leak raw frontmatter image paths', !topThirty.includes('src="./images/')],
  ['Top 30 article links its heading anchors', topThirty.includes('href="#1-problem--patience-its-hard-to-solve-a-problem-you-dont-fully-understand"')],
  ['Percy article preserves heading self-links', percy.includes('href="#the-problem"') && percy.includes('aria-hidden="true"')],
  ['Percy article keeps the imported repository link', percy.includes('https://github.com/rowlandekemezie/rowlandekemezie.com')],
  ['Percy article uses generated Astro asset paths', percy.includes('/_astro/')],
  ['RSS contains the site feed title', rss.includes('<title>Rowland I. Ekemezie</title>')],
  ['RSS contains the imported GitStart post URL', rss.includes('https://rowlandekemezie.com/posts/top-30-things-i-learnt-at-gitstart/')],
  ['Sitemap contains the site root URL', sitemap.includes('<loc>https://rowlandekemezie.com/</loc>')],
  ['Sitemap contains the about page URL', sitemap.includes('<loc>https://rowlandekemezie.com/pages/about/</loc>')],
  ['Sitemap contains the imported GitStart post URL', sitemap.includes('<loc>https://rowlandekemezie.com/posts/top-30-things-i-learnt-at-gitstart/</loc>')],
  ['Sitemap contains the software engineering tag URL', sitemap.includes('<loc>https://rowlandekemezie.com/tags/software-engineering/</loc>')],
  ['Robots references the canonical sitemap URL', robots.includes('Sitemap: https://rowlandekemezie.com/sitemap.xml')],
  ['Build output contains no Universal Analytics identifier', !builtOutput.includes('UA-')],
  ['Build output contains no Google Analytics embed assets', !builtOutput.includes('google-analytics.com')],
];

for (const [description, passed] of assertions) {
  if (!passed) {
    throw new Error(`Static output verification failed: ${description}`);
  }
}

console.log('Static output verification passed.');
