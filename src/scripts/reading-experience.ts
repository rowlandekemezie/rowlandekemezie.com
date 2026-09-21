import {
  createArticlePath,
  isReadingStorageKey,
  markUnread,
  observeReading,
  parseStoredReadingRecordJson,
  readingStorageKey,
  readingStoragePrefix,
  selectHomeReadingChoice,
  statusLabel,
} from '../lib/reading-state';
import type { ArticlePath, ReadingCandidate, StoredReadingRecord } from '../lib/reading-state';

const changeEvent = 'rowland:reading-change';
const probeKey = 'rowland.reading.v1:probe';
const readingNavigationKeys = new Set([
  'ArrowDown',
  'ArrowUp',
  'End',
  'Home',
  'PageDown',
  'PageUp',
  ' ',
  'Spacebar',
]);

type StorageMode = 'persistent' | 'memory';

function initializeReadingExperience() {
  if (window.__rowlandReadingExperience) return;
  window.__rowlandReadingExperience = true;

  const memory = new Map<ArticlePath, StoredReadingRecord>();
  let storageMode: StorageMode = canUseStorage() ? 'persistent' : 'memory';
  let observationPaused = false;
  let measurementFrame = 0;

  function canUseStorage(): boolean {
    try {
      window.localStorage.setItem(probeKey, '1');
      window.localStorage.removeItem(probeKey);
      return true;
    } catch {
      return false;
    }
  }

  function readPersistent(key: string): { readonly kind: 'value'; readonly value: string | null } | { readonly kind: 'blocked' } {
    try {
      return { kind: 'value', value: window.localStorage.getItem(key) };
    } catch {
      storageMode = 'memory';
      return { kind: 'blocked' };
    }
  }

  function writePersistent(key: string, value: string | undefined): boolean {
    try {
      if (value === undefined) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
      return true;
    } catch {
      storageMode = 'memory';
      return false;
    }
  }

  function recordFor(path: ArticlePath): StoredReadingRecord | undefined {
    if (storageMode === 'memory') return memory.get(path);
    const stored = readPersistent(readingStorageKey(path));
    if (stored.kind === 'blocked') return memory.get(path);
    const record = parseStoredReadingRecordJson(stored.value);
    if (record) memory.set(path, record);
    else memory.delete(path);
    return record ?? undefined;
  }

  function saveRecord(path: ArticlePath, record: StoredReadingRecord | undefined) {
    memory.delete(path);
    if (record) memory.set(path, record);

    if (storageMode === 'persistent') {
      const key = readingStorageKey(path);
      writePersistent(key, record ? JSON.stringify(record) : undefined);
    }

    window.dispatchEvent(new CustomEvent(changeEvent, { detail: { path } }));
  }

  function candidates(): ReadingCandidate[] {
    return Array.from(document.querySelectorAll('[data-reading-candidate]')).flatMap((element) => {
      if (!(element instanceof HTMLElement)) return [];
      const path = createArticlePath(element.dataset.articlePath);
      const title = element.dataset.articleTitle;
      return path && title ? [{ path, title }] : [];
    });
  }

  function renderStatus(element: HTMLElement, record: StoredReadingRecord | undefined) {
    const isRead = record?.kind === 'read';
    element.dataset.readingState = record?.kind ?? 'unread';
    element.querySelectorAll('[data-reading-status]').forEach((status) => {
      status.textContent = statusLabel(record);
    });
    element.querySelectorAll('[data-reading-completion]').forEach((completion) => {
      if (completion instanceof HTMLElement) completion.hidden = !isRead;
    });
    element.querySelectorAll('[data-reading-toggle]').forEach((toggle) => {
      if (toggle instanceof HTMLButtonElement) {
        toggle.hidden = !isRead;
        toggle.textContent = 'Mark unread';
      }
    });
  }

  function renderArticleStates() {
    document.querySelectorAll('[data-article-path]').forEach((element) => {
      if (!(element instanceof HTMLElement)) return;
      const path = createArticlePath(element.dataset.articlePath);
      if (path) renderStatus(element, recordFor(path));
    });
  }

  function renderSummary() {
    const summary = document.querySelector('[data-reading-summary]');
    if (!(summary instanceof HTMLElement)) return;
    const catalog = candidates();
    const records = new Map<ArticlePath, StoredReadingRecord>();
    catalog.forEach((candidate) => {
      const record = recordFor(candidate.path);
      if (record) records.set(candidate.path, record);
    });
    const completed = catalog.reduce(
      (count, candidate) => count + (records.get(candidate.path)?.kind === 'read' ? 1 : 0),
      0
    );
    const count = summary.querySelector('[data-reading-count]');
    if (count instanceof HTMLElement) {
      count.textContent = `Read ${completed} / ${catalog.length}`;
      count.hidden = false;
    }
    const progress = summary.querySelector('[data-reading-progress]');
    if (progress instanceof HTMLElement) {
      progress.setAttribute('aria-valuemax', String(catalog.length));
      progress.setAttribute('aria-valuenow', String(completed));
      progress.setAttribute('aria-valuetext', `${completed} of ${catalog.length} articles read`);
      progress.hidden = false;
    }
    const progressFill = summary.querySelector('[data-reading-progress-fill]');
    if (progressFill instanceof HTMLElement) {
      const completion = catalog.length === 0 ? 0 : completed / catalog.length;
      progressFill.style.transform = `scaleX(${completion})`;
    }
    const choice = selectHomeReadingChoice(
      catalog,
      records
    );
    const message = summary.querySelector('[data-reading-summary-message]');
    if (!(message instanceof HTMLElement) || !choice) return;

    const link = document.createElement('a');
    link.href = choice.article.path;
    if (choice.kind === 'continue') link.textContent = `Continue ${choice.article.title}`;
    if (choice.kind === 'next') link.textContent = `Next unread: ${choice.article.title}`;
    if (choice.kind === 'complete') link.textContent = 'Revisit the latest essay';
    message.replaceChildren(link);
    if (choice.kind === 'continue') message.append(` with ${choice.percent}% read`);
    if (choice.kind === 'complete') message.prepend('All caught up. ');

    const reset = summary.querySelector('[data-reading-reset]');
    if (reset instanceof HTMLButtonElement) reset.hidden = records.size === 0;
    const notice = summary.querySelector('[data-reading-storage-note]');
    if (notice instanceof HTMLElement) notice.hidden = storageMode === 'persistent';
    const savedNote = summary.querySelector('[data-reading-saved-note]');
    if (savedNote instanceof HTMLElement) savedNote.hidden = storageMode !== 'persistent';
  }

  function renderAll() {
    renderArticleStates();
    renderSummary();
  }

  function measureArticle() {
    measurementFrame = 0;
    if (observationPaused) return;
    const root = document.querySelector('[data-reading-article]');
    const prose = root?.querySelector('.prose[data-reading-prose]');
    if (!(root instanceof HTMLElement) || !(prose instanceof HTMLElement)) return;
    const path = createArticlePath(root.dataset.articlePath);
    if (!path) return;

    const rect = prose.getBoundingClientRect();
    const readingLine = window.innerHeight * 0.36;
    const reachedEnd = rect.bottom <= readingLine;
    const percent = ((readingLine - rect.top) / Math.max(rect.height, 1)) * 100;
    const current = recordFor(path);
    const next = observeReading(current, percent, reachedEnd, Date.now());
    if (next !== current) saveRecord(path, next);
  }

  function scheduleMeasurement() {
    if (measurementFrame) return;
    measurementFrame = window.requestAnimationFrame(measureArticle);
  }

  function resumeObservation(event: Event) {
    if (!event.isTrusted) return;
    observationPaused = false;
    scheduleMeasurement();
  }

  function resetHistory() {
    if (storageMode === 'persistent') {
      try {
        for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
          const key = window.localStorage.key(index);
          if (isReadingStorageKey(key)) writePersistent(key, undefined);
        }
      } catch {
        storageMode = 'memory';
      }
    }
    memory.clear();
    window.dispatchEvent(new CustomEvent(changeEvent));
  }

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('[data-reading-reset]')) {
      resetHistory();
      return;
    }
    const toggle = target.closest('[data-reading-toggle]');
    const article = toggle?.closest('[data-article-path]');
    if (!(article instanceof HTMLElement)) return;
    const path = createArticlePath(article.dataset.articlePath);
    if (!path) return;
    const record = recordFor(path);
    if (record?.kind !== 'read') return;
    observationPaused = article.hasAttribute('data-reading-article');
    saveRecord(path, markUnread());
  });

  window.addEventListener(changeEvent, renderAll);
  window.addEventListener('storage', (event) => {
    if (!isReadingStorageKey(event.key)) return;
    let decodedPath: string;
    try {
      decodedPath = decodeURIComponent(event.key.slice(readingStoragePrefix.length));
    } catch {
      return;
    }
    const path = createArticlePath(decodedPath);
    if (!path) return;
    const record = parseStoredReadingRecordJson(event.newValue);
    if (record) memory.set(path, record);
    else {
      memory.delete(path);
      const currentArticle = document.querySelector('[data-reading-article]');
      if (
        currentArticle instanceof HTMLElement &&
        createArticlePath(currentArticle.dataset.articlePath) === path
      ) {
        observationPaused = true;
      }
    }
    renderAll();
  });
  window.addEventListener('scroll', () => {
    if (!observationPaused) scheduleMeasurement();
  }, { passive: true });
  window.addEventListener('wheel', resumeObservation, { passive: true });
  window.addEventListener('touchmove', resumeObservation, { passive: true });
  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const isEditable =
      target instanceof HTMLElement &&
      (target.isContentEditable || target.matches('input, textarea, select'));
    if (!isEditable && readingNavigationKeys.has(event.key)) resumeObservation(event);
  });
  window.addEventListener('resize', scheduleMeasurement);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') measureArticle();
  });

  renderAll();
  scheduleMeasurement();
}

declare global {
  interface Window {
    __rowlandReadingExperience?: boolean;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeReadingExperience, { once: true });
} else {
  initializeReadingExperience();
}
