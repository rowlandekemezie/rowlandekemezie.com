declare const articlePathBrand: unique symbol;
declare const progressPercentBrand: unique symbol;

export type ArticlePath = string & {
  readonly [articlePathBrand]: 'ArticlePath';
};

export type ProgressPercent = number & {
  readonly [progressPercentBrand]: 'ProgressPercent1To79';
};

export type StoredReadingRecord =
  | {
      readonly kind: 'progress';
      readonly percent: ProgressPercent;
      readonly updatedAt: number;
    }
  | {
      readonly kind: 'read';
      readonly source: 'automatic' | 'manual';
      readonly updatedAt: number;
    };

export type ReadingView =
  | { readonly kind: 'unread' }
  | { readonly kind: 'progress'; readonly percent: ProgressPercent }
  | { readonly kind: 'read' };

export interface ReadingCandidate {
  readonly path: ArticlePath;
  readonly title: string;
}

export type HomeReadingChoice =
  | {
      readonly kind: 'continue';
      readonly article: ReadingCandidate;
      readonly percent: ProgressPercent;
    }
  | { readonly kind: 'next'; readonly article: ReadingCandidate }
  | { readonly kind: 'complete'; readonly article: ReadingCandidate };

export const readingStoragePrefix = 'rowland.reading.v1:article:';

export function createArticlePath(value: unknown): ArticlePath | null {
  if (
    typeof value !== 'string' ||
    !/^\/posts\/(?:[a-z0-9][a-z0-9-]*\/)+$/i.test(value)
  ) {
    return null;
  }

  return value as ArticlePath;
}

export function createProgressPercent(value: unknown): ProgressPercent | null {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > 79
  ) {
    return null;
  }

  return value as ProgressPercent;
}

function isUpdatedAt(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseStoredReadingRecord(
  value: unknown
): StoredReadingRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  if (!isUpdatedAt(value.updatedAt)) return null;

  if (value.kind === 'progress') {
    const percent = createProgressPercent(value.percent);
    return percent === null
      ? null
      : { kind: 'progress', percent, updatedAt: value.updatedAt };
  }

  if (
    value.kind === 'read' &&
    (value.source === 'automatic' || value.source === 'manual')
  ) {
    return { kind: 'read', source: value.source, updatedAt: value.updatedAt };
  }

  return null;
}

export function parseStoredReadingRecordJson(
  value: string | null
): StoredReadingRecord | null {
  if (value === null) return null;

  try {
    return parseStoredReadingRecord(JSON.parse(value));
  } catch {
    return null;
  }
}

export function readingStorageKey(path: ArticlePath): string {
  return `${readingStoragePrefix}${encodeURIComponent(path)}`;
}

export function isReadingStorageKey(value: string | null): value is string {
  return value !== null && value.startsWith(readingStoragePrefix);
}

export function readingView(
  record: StoredReadingRecord | undefined
): ReadingView {
  if (!record) return { kind: 'unread' };
  if (record.kind === 'read') return { kind: 'read' };
  return { kind: 'progress', percent: record.percent };
}

export function statusLabel(record: StoredReadingRecord | undefined): string {
  const view = readingView(record);
  if (view.kind === 'progress') return `${view.percent}% read`;
  return view.kind === 'read' ? 'Read' : 'Unread';
}

export function observeReading(
  record: StoredReadingRecord | undefined,
  measuredPercent: number,
  reachedEnd: boolean,
  updatedAt: number
): StoredReadingRecord | undefined {
  if (record?.kind === 'read') return record;
  if (reachedEnd || measuredPercent >= 80) {
    return { kind: 'read', source: 'automatic', updatedAt };
  }

  if (!Number.isFinite(measuredPercent) || measuredPercent <= 0) return record;
  const bucket = Math.max(1, Math.min(75, Math.floor(measuredPercent / 5) * 5));
  const percent = createProgressPercent(bucket);
  if (
    percent === null ||
    (record?.kind === 'progress' && percent <= record.percent)
  )
    return record;

  return { kind: 'progress', percent, updatedAt };
}

export function markUnread(): undefined {
  return undefined;
}

export function selectHomeReadingChoice(
  candidates: readonly ReadingCandidate[],
  records: ReadonlyMap<ArticlePath, StoredReadingRecord>
): HomeReadingChoice | null {
  const inProgress = candidates
    .map(article => ({ article, record: records.get(article.path) }))
    .filter(
      (
        entry
      ): entry is {
        article: ReadingCandidate;
        record: Extract<StoredReadingRecord, { kind: 'progress' }>;
      } => entry.record?.kind === 'progress'
    )
    .sort((left, right) => right.record.updatedAt - left.record.updatedAt)[0];

  if (inProgress) {
    return {
      kind: 'continue',
      article: inProgress.article,
      percent: inProgress.record.percent
    };
  }

  const unread = candidates.find(
    article => records.get(article.path) === undefined
  );
  if (unread) return { kind: 'next', article: unread };

  const latest = candidates[0];
  return latest ? { kind: 'complete', article: latest } : null;
}
