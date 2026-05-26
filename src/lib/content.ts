import { getCollection, type CollectionEntry } from 'astro:content';
import { kebabCase, postRouteFromSlug, postSlugFromEntry } from './site';

export type PageEntry = CollectionEntry<'pages'>;
export type PostEntry = CollectionEntry<'posts'>;
export type PostSeries = NonNullable<PostEntry['data']['series']>;

export interface SeriesGroup {
  posts: PostEntry[];
  slug: string;
  title: string;
}

export async function getPublishedPosts() {
  return (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => parsePostDate(b.data.date).getTime() - parsePostDate(a.data.date).getTime()
  );
}

export async function getPages() {
  return getCollection('pages');
}

export async function getPageBySlug(slug: string) {
  const pages = await getPages();
  return pages.find((page) => page.id.replace(/\.mdx?$/, '') === slug);
}

export function parsePostDate(value: string) {
  if (value.includes('T')) {
    return new Date(value);
  }

  const [day, month, year] = value.split('/').map((part) => Number.parseInt(part, 10));
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatPostDate(value: string) {
  return parsePostDate(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatPostMonthYear(value: string) {
  return parsePostDate(value).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function getPostExcerpt(post: PostEntry, maxLength = 180) {
  const text = (post.body ?? '')
    .replace(/^---[\s\S]*?---/, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export function getPostIdentifier(post: PostEntry) {
  return post.data.slug ?? post.data.title;
}

export function getPostPath(post: PostEntry) {
  return postRouteFromSlug(postSlugFromEntry(post));
}

export function getSeriesSlug(series: PostSeries) {
  return series.slug ? series.slug.replace(/^\/+|\/+$/g, '') : kebabCase(series.title);
}

export function getSeriesForPost(post: PostEntry) {
  const series = post.data.series;

  if (!series) {
    return undefined;
  }

  return {
    ...series,
    slug: getSeriesSlug(series),
  };
}

export function getPaginatedPosts(posts: PostEntry[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * perPage;

  return {
    currentPage,
    perPage,
    posts: posts.slice(start, start + perPage),
    totalPages,
  };
}

export function groupPostsByTag(posts: PostEntry[]) {
  const tags = new Map<string, PostEntry[]>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      const current = tags.get(tag) ?? [];
      current.push(post);
      tags.set(tag, current);
    }
  }

  return [...tags.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export function groupPostsByCategory(posts: PostEntry[]) {
  const categories = new Map<string, PostEntry[]>();

  for (const post of posts) {
    const category = post.data.category;

    if (!category) {
      continue;
    }

    const current = categories.get(category) ?? [];
    current.push(post);
    categories.set(category, current);
  }

  return [...categories.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export function sortSeriesPosts(posts: PostEntry[]) {
  return [...posts].sort((a, b) => {
    const aSeries = a.data.series;
    const bSeries = b.data.series;

    if (!aSeries || !bSeries) {
      return 0;
    }

    if (aSeries.order !== bSeries.order) {
      return aSeries.order - bSeries.order;
    }

    const dateDelta = parsePostDate(a.data.date).getTime() - parsePostDate(b.data.date).getTime();

    if (dateDelta !== 0) {
      return dateDelta;
    }

    return a.data.title.localeCompare(b.data.title);
  });
}

export function groupPostsBySeries(posts: PostEntry[]) {
  const seriesGroups = new Map<string, SeriesGroup>();

  for (const post of posts) {
    const series = getSeriesForPost(post);

    if (!series) {
      continue;
    }

    const current = seriesGroups.get(series.slug);

    if (current) {
      current.posts.push(post);
      continue;
    }

    seriesGroups.set(series.slug, {
      posts: [post],
      slug: series.slug,
      title: series.title,
    });
  }

  return [...seriesGroups.values()]
    .map((series) => ({
      ...series,
      posts: sortSeriesPosts(series.posts),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getSeriesBySlug(posts: PostEntry[], slug: string) {
  return groupPostsBySeries(posts).find((series) => series.slug === slug);
}

export function getSeriesPosition(post: PostEntry, seriesPosts: PostEntry[]) {
  return seriesPosts.findIndex((seriesPost) => getPostPath(seriesPost) === getPostPath(post));
}
