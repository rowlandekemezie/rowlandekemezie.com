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
  focus: [
    'Software engineering',
    'Technical writing',
    'Learning systems',
  ],
  logo: '/logos/logo-1024.png',
  positioning:
    'Engineering leader, systems builder, and product-minded technologist building software and teams for real-world complexity.',
  practiceAreas: [
    {
      title: 'Build calmer software systems',
      summary:
        'I care about product engineering that reduces noise: clearer review loops, steadier delivery, and systems that stay legible as they grow.',
    },
    {
      title: 'Turn engineering work into useful writing',
      summary:
        'Writing is part of the work. I use essays, notes, and documentation to make technical decisions easier to share, teach, and revisit.',
    },
    {
      title: 'Design learning loops for people and teams',
      summary:
        'I am drawn to the overlap between education, mentorship, and engineering leadership, where better learning systems produce better teams.',
    },
  ],
  title: 'Rowland I. Ekemezie',
  titleAlt: 'Rowlandbits — Blog by Rowland Ekemezie',
  url: 'https://rowlandekemezie.com',
};

export const systemPillars = [
  {
    id: 'build',
    label: 'Build',
    blurb: 'Turning ambiguous ideas into practical systems, shipping paths, and reliable execution.',
    prompts: ['System design', 'Execution loops', 'Product shape'],
  },
  {
    id: 'write',
    label: 'Write',
    blurb: 'Writing as a way to sharpen decisions, explain tradeoffs, and leave useful traces behind.',
    prompts: ['Essays', 'Working notes', 'Documentation as leverage'],
  },
  {
    id: 'think',
    label: 'Think',
    blurb: 'Connecting technical details to broader patterns in people, process, and long-term learning.',
    prompts: ['Synthesis', 'Operating principles', 'Systems perspective'],
  },
  {
    id: 'lead',
    label: 'Lead',
    blurb: 'Supporting teams through clarity, teaching, and stronger feedback loops around craft.',
    prompts: ['Mentorship', 'Review quality', 'Human systems'],
  },
] as const;

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
