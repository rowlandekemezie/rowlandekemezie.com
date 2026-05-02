export const site = {
  author: {
    email: 'rowlandresource@gmail.com',
    github: 'rowlandekemezie',
    links: [
      {
        label: 'GitHub',
        url: 'https://github.com/rowlandekemezie',
      },
      {
        label: 'Twitter',
        url: 'https://twitter.com/rowlandekemezie',
      },
      {
        label: 'Email',
        url: 'mailto:rowland.ekemezie@gmail.com',
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
  return `/posts/${trimSlashes(slug)}/`;
}

export function kebabCase(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function postSlugFromEntry(entry: { data: { slug?: string; title: string } }) {
  return kebabCase(entry.data.slug ?? entry.data.title);
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
