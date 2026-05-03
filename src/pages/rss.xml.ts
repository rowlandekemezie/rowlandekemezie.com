import rss from '@astrojs/rss';
import { getPostExcerpt, getPostPath, getPublishedPosts, parsePostDate } from '../lib/content';
import { site } from '../lib/site';

export async function GET(context: { site?: URL }) {
  const posts = await getPublishedPosts();

  return rss({
    title: site.title,
    description: site.description,
    site: context.site ?? site.url,
    customData: `<language>en-us</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? getPostExcerpt(post),
      link: getPostPath(post),
      pubDate: parsePostDate(post.data.date),
      categories: [...(post.data.category ? [post.data.category] : []), ...post.data.tags],
    })),
  });
}
