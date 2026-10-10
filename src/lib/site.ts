export const site = {
  author: {
    email: 'hello@rowlandekemezie.com',
    github: 'rowlandekemezie',
    links: [
      {
        label: 'Twitter',
        url: 'https://twitter.com/rowlandekemezie',
      },
      {
        label: 'GitHub',
        url: 'https://github.com/rowlandekemezie',
      },
      {
        label: 'LinkedIn',
        url: 'https://www.linkedin.com/in/rowlandekemezie/',
      },
      {
        label: 'Email',
        url: 'mailto:hello@rowlandekemezie.com',
      },
      {
        label: 'RSS',
        url: '/rss.xml',
      },
    ],
    location: 'Vancouver, BC, Canada',
    name: 'Rowland I. Ekemezie',
    summary:
      'Software engineer, writer, and systems thinker focused on reliable product systems, technical clarity, and high-leverage team practices.',
    twitter: 'rowlandekemezie',
  },
  description:
    "Hi, I'm Rowland. I build reliable software systems, write about engineering practice, and care deeply about the human systems that shape strong teams.",
  logo: '/logos/logo-1024.png',
  positioning:
    'Engineering leader, systems builder, and product-minded technologist building software and teams for real-world complexity.',
  title: 'Rowland I. Ekemezie',
  url: 'https://rowlandekemezie.com',
};

export function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '');
}

export function postRouteFromSlug(slug: string) {
  if (slug.startsWith('/')) {
    return `/${trimSlashes(slug)}/`;
  }

  if (slug.startsWith('posts/')) {
    return `/${trimSlashes(slug)}/`;
  }

  return `/posts/${trimSlashes(slug)}/`;
}

export function kebabCase(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function postSlugFromEntry(entry: { data: { slug?: string; title: string } }) {
  if (entry.data.slug) {
    return trimSlashes(entry.data.slug);
  }

  return kebabCase(entry.data.title);
}

export function postRouteFromEntry(entry: { data: { slug?: string; title: string } }) {
  return postRouteFromSlug(postSlugFromEntry(entry));
}

export function categoryRoute(category: string) {
  return `/categories/${kebabCase(category)}/`;
}

export function seriesRoute(seriesSlug: string) {
  return `/series/${trimSlashes(seriesSlug)}/`;
}

export function aboutRoute() {
  return '/about/';
}

export function tagRoute(tag: string) {
  return `/tags/${kebabCase(tag)}/`;
}
