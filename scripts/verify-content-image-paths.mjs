import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const rootDir = process.cwd();
const contentDir = resolve(rootDir, 'content');
const publicDir = resolve(rootDir, 'public');
const staticDir = resolve(rootDir, 'static');
const markdownImagePattern = /!\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)/g;

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(absolutePath));
    } else if (entry.isFile() && absolutePath.endsWith('.md')) {
      files.push(absolutePath);
    }
  }

  return files;
}

function isRemoteAsset(value) {
  return /^(https?:)?\/\//.test(value) || value.startsWith('data:');
}

function resolveLocalAsset(markdownFile, assetPath) {
  if (assetPath.startsWith('/')) {
    const publicPath = resolve(publicDir, `.${assetPath}`);
    const staticPath = resolve(staticDir, `.${assetPath}`);
    return existsSync(publicPath) || existsSync(staticPath);
  }

  return existsSync(resolve(dirname(markdownFile), assetPath));
}

const markdownFiles = walk(contentDir);
const unresolvedAssets = [];

for (const markdownFile of markdownFiles) {
  const body = readFileSync(markdownFile, 'utf8');
  const matches = body.matchAll(markdownImagePattern);

  for (const match of matches) {
    const assetPath = match[1];

    if (isRemoteAsset(assetPath)) {
      continue;
    }

    if (!resolveLocalAsset(markdownFile, assetPath)) {
      unresolvedAssets.push({
        file: markdownFile.replace(`${rootDir}/`, ''),
        assetPath,
      });
    }
  }
}

if (unresolvedAssets.length > 0) {
  throw new Error(
    `Unresolved local markdown image paths:\n${unresolvedAssets
      .map(({ file, assetPath }) => `- ${file}: ${assetPath}`)
      .join('\n')}`
  );
}

console.log('Content image path verification passed.');
