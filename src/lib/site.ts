export const site = {
  author: {
    avatar: 'https://avatars2.githubusercontent.com/u/15085641?s=300&v=4',
    email: 'rowlandresource@gmail.com',
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
        label: 'Email',
        url: 'mailto:rowland.ekemezie@gmail.com',
      },
      {
        label: 'RSS',
        url: '/rss.xml',
      },
    ],
    location: 'Lagos, Nigeria',
    name: 'Rowland I. Ekemezie',
    summary:
      'Automated systems enthusiast, addictive learner, human capital development advocate, writer, and software engineer.',
    twitter: 'rowlandekemezie',
  },
  description:
    "Hi I'm Rowland. I'm an Automated systems enthusiast, human capital development advocate; Software Engineer and everything in between",
  logo: '/logos/logo-1024.png',
  title: 'Rowland I. Ekemezie',
  titleAlt: 'Rowlandbits — Blog by Rowland Ekemezie',
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

export function pageRoute(page: number) {
  return `/page/${page}/`;
}

export function aboutRoute() {
  return '/pages/about/';
}

export function tagRoute(tag: string) {
  return `/tags/${kebabCase(tag)}/`;
}
