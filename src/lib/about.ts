import { site } from './site';

// The About page's copy, shared by src/pages/about.astro and the Markdown
// version at /about.md so the two cannot drift apart.

export const aboutIntro =
  'I build software systems and engineering organizations for products where reliability, integrations, payments, data flow, and operational clarity matter. I write to make the tradeoffs behind that work explicit and useful.';

export const howIWork = [
  'Turn ambiguous business problems into maintainable software with clear architecture and explicit tradeoffs.',
  'Build systems that are boring in production, elegant under the hood, and easy for teams to operate.',
  'Lead distributed teams with ownership, clarity, and leverage over busyness.',
];

export const whatIWriteAbout = [
  'Backend architecture, multi-tenant systems, and developer-friendly design.',
  'Financial infrastructure across payroll, accounting, and payments.',
  'AI-enabled operations, workflow automation, and engineering leadership.',
];

export function renderAboutMarkdown() {
  const absolute = (href: string) => (href.startsWith('http') ? href : new URL(href, site.url).toString());
  // The email address is obfuscated on the HTML page, so point to the contact page instead.
  const links = site.author.links
    .filter((link) => link.label !== 'Email')
    .map((link) => `- [${link.label}](${absolute(link.url)})`);

  return [
    `# ${site.author.name}`,
    `> ${site.positioning}`,
    `- Canonical URL: ${new URL('/about/', site.url).toString()}`,
    `- Location: ${site.author.location}`,
    `- Contact: ${new URL('/contact/', site.url).toString()}`,
    site.author.summary,
    aboutIntro,
    `## How I work\n\n${howIWork.map((item) => `- ${item}`).join('\n')}`,
    `## What I write about\n\n${whatIWriteAbout.map((item) => `- ${item}`).join('\n')}`,
    `## Elsewhere\n\n${links.join('\n')}`,
    `---\n\nFor writing, start at ${site.url}/ or ${site.url}/llms.txt.`,
  ]
    .join('\n\n')
    .concat('\n');
}
