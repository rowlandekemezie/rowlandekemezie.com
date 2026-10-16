import { formatPostDate, getPostPath, getSeriesForPost, type PostEntry } from './content';
import { site } from './site';

// Markdown served to agents that send `Accept: text/markdown` for an essay URL.
// It is built from the authored source, so it carries the article and nothing
// from the page chrome (navigation, scripts, newsletter form).

export function getPostMarkdownPath(post: PostEntry) {
  // /posts/<name>/ -> /posts/<name>.md
  return getPostPath(post).replace(/\/$/, '.md');
}

function toAbsoluteUrl(href: string) {
  if (/^(https?:|mailto:|#)/i.test(href)) {
    return href;
  }

  return new URL(href, site.url).toString();
}

export function cleanPostBody(body: string) {
  return (
    body
      // MDX module syntax has no meaning outside the Astro build.
      .replace(/^(import|export)\s.+$/gm, '')
      // Local images are fingerprinted at build time, so their source paths do not
      // resolve on the site. Keep the alt text so the description is not lost.
      .replace(/!\[([^\]]*)\]\((?!https?:)[^)]*\)/g, (_, alt: string) =>
        alt.trim() ? `*Image: ${alt.trim()}*` : ''
      )
      // Root-relative links become absolute so they still work out of context.
      .replace(/(?<!!)\[([^\]]*)\]\((\/[^)\s]*)\)/g, (_, text: string, href: string) => `[${text}](${toAbsoluteUrl(href)})`)
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

export function renderPostMarkdown(post: PostEntry) {
  const canonical = new URL(getPostPath(post), site.url).toString();
  const series = getSeriesForPost(post);
  const meta = [
    `- Author: ${site.title}`,
    `- Published: ${formatPostDate(post.data.date)}`,
    post.data.updated ? `- Updated: ${formatPostDate(post.data.updated)}` : undefined,
    `- Canonical URL: ${canonical}`,
    series ? `- Series: ${series.title}, part ${series.order}` : undefined,
    post.data.tags.length ? `- Tags: ${post.data.tags.join(', ')}` : undefined,
  ].filter(Boolean);

  const body = cleanPostBody(post.body ?? '');
  // Drop a leading image caption: the hero image is decoration, not content.
  const article = body.replace(/^\*Image: [^*]*\*\s*/, '');

  return [
    `# ${post.data.title}`,
    post.data.description ? `> ${post.data.description}` : undefined,
    meta.join('\n'),
    article,
    `---\n\nWhen quoting or summarizing, link to the canonical URL above and attribute the work to ${site.title}.`,
  ]
    .filter(Boolean)
    .join('\n\n')
    .concat('\n');
}
