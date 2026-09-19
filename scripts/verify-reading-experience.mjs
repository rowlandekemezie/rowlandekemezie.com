import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const compiledDir = mkdtempSync(resolve(tmpdir(), 'rowland-reading-state-'));

function assert(condition, message) {
  if (!condition)
    throw new Error(`Reading experience verification failed: ${message}`);
}

try {
  execFileSync(
    'pnpm',
    [
      'exec',
      'tsc',
      'src/lib/reading-state.ts',
      '--target',
      'ES2022',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--outDir',
      compiledDir,
      '--skipLibCheck'
    ],
    { stdio: 'inherit' }
  );

  const state = await import(resolve(compiledDir, 'reading-state.js'));
  const first = state.createArticlePath('/posts/first-essay/');
  const second = state.createArticlePath('/posts/second-essay/');
  const third = state.createArticlePath('/posts/third-essay/');
  assert(first && second && third, 'canonical article paths parse');
  assert(
    state.createArticlePath('/posts/series/first-essay/'),
    'nested canonical article paths parse'
  );
  assert(
    state.createArticlePath('/posts/../first-essay/') === null,
    'traversal paths are rejected'
  );
  assert(
    state.createArticlePath('/posts/first-essay/?preview=1') === null,
    'query paths are rejected'
  );
  assert(
    state.createArticlePath('/posts/first-essay/#notes') === null,
    'hash paths are rejected'
  );
  assert(
    state.createArticlePath('/pages/about/') === null,
    'non-post paths are rejected'
  );
  assert(
    state.parseStoredReadingRecordJson('{nope') === null,
    'malformed JSON is rejected'
  );
  assert(
    state.parseStoredReadingRecord({
      kind: 'progress',
      percent: 80,
      updatedAt: 1
    }) === null,
    'invalid progress is rejected'
  );

  const progress = state.observeReading(undefined, 29, false, 10);
  assert(
    progress?.kind === 'progress' && progress.percent === 25,
    'progress is bucketed'
  );
  assert(
    state.observeReading(progress, 12, false, 11) === progress,
    'progress is monotonic'
  );
  assert(
    state.observeReading(progress, 80, false, 12)?.kind === 'read',
    '80 percent completes an article'
  );
  assert(
    state.observeReading(progress, 4, true, 13)?.kind === 'read',
    'article end completes an article'
  );
  assert(
    state.markRead(14).source === 'manual' && state.markUnread() === undefined,
    'manual read and unread transitions work'
  );

  const candidates = [
    { path: first, title: 'First' },
    { path: second, title: 'Second' },
    { path: third, title: 'Third' }
  ];
  const records = new Map([
    [first, state.markRead(1)],
    [second, state.observeReading(undefined, 35, false, 20)]
  ]);
  const continueChoice = state.selectHomeReadingChoice(candidates, records);
  assert(
    continueChoice?.kind === 'continue' &&
      continueChoice.article.path === second,
    'latest progress continues first'
  );
  records.delete(second);
  const nextChoice = state.selectHomeReadingChoice(candidates, records);
  assert(
    nextChoice?.kind === 'next' && nextChoice.article.path === second,
    'first unread follows completed work'
  );
  records.set(second, state.markRead(2));
  records.set(third, state.markRead(3));
  assert(
    state.selectHomeReadingChoice(candidates, records)?.kind === 'complete',
    'complete state uses the latest essay'
  );
  assert(
    state.isReadingStorageKey(state.readingStorageKey(first)),
    'owned article keys are in reset scope'
  );
  assert(
    !state.isReadingStorageKey('rowland.theme'),
    'unrelated keys are outside reset scope'
  );

  const home = readFileSync(resolve('dist', 'index.html'), 'utf8');
  const article = readFileSync(
    resolve(
      'dist',
      'posts',
      'improving-your-visual-review-with-percy',
      'index.html'
    ),
    'utf8'
  );
  assert(
    home.includes('data-reading-summary'),
    'home includes the enhanced reading summary'
  );
  assert(
    home.includes('data-reading-catalog') &&
      home.includes('data-article-path='),
    'home has a safe canonical reading catalog'
  );
  assert(
    home.includes('data-reading-toggle'),
    'feed rows include progressive reading controls'
  );
  assert(
    article.includes('data-reading-article') &&
      article.includes('data-reading-prose'),
    'article measures prose only'
  );
  assert(
    article.includes('data-reading-toggle'),
    'article has a manual reading control'
  );
  console.log('Reading experience verification passed.');
} finally {
  rmSync(compiledDir, { recursive: true, force: true });
}
