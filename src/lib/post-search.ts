export interface SearchPost {
  date: string;
  href: string;
  text: string;
  title: string;
}

export interface PostSearchCatalog {
  posts: SearchPost[];
}

function isSearchPost(value: unknown): value is SearchPost {
  return (
    typeof value === 'object' &&
    value !== null &&
    'date' in value &&
    typeof value.date === 'string' &&
    'href' in value &&
    typeof value.href === 'string' &&
    'text' in value &&
    typeof value.text === 'string' &&
    'title' in value &&
    typeof value.title === 'string'
  );
}

export function parsePostSearchCatalog(value: unknown): PostSearchCatalog {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('posts' in value) ||
    !Array.isArray(value.posts) ||
    !value.posts.every(isSearchPost)
  ) {
    throw new Error('Invalid post search catalog');
  }

  return { posts: value.posts };
}
