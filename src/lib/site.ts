export const site = {
  author: {
    email: 'rowlandresource@gmail.com',
    github: 'rowlandekemezie',
    name: 'Rowland I. Ekemezie',
    photo: '/rowland.jpeg',
    twitter: 'rowlandekemezie',
  },
  description:
    "Hi I'm Rowland. I'm an Automated systems enthusiast, human capital development advocate; Software Engineer and everything in between",
  title: 'Rowland I. Ekemezie',
  url: 'https://rowlandekemezie.com',
};

export function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '');
}

export function postRouteFromSlug(slug: string) {
  return `/${trimSlashes(slug)}/`;
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

export function tagRoute(tag: string) {
  return `/tags/${kebabCase(tag)}/`;
}
