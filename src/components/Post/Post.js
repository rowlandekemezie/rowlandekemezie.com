import React from 'react';
import { MdCreate } from 'react-icons/md';
import { Link } from 'gatsby';
import ToggleSwitch from 'components/ToggleSwitch';
import Share from 'components/Share';
import { useTheme } from 'utils/hooks';
import Comments from './Comments';
import Content from './Content';
import Tags from './Tags';
import styles from './Post.module.scss';

const Post = ({
  url, post, editLink, timeToRead, twitterHandle
}) => {
  const { tags, title, date } = post.frontmatter;
  const { isDark, toggleTheme } = useTheme();

  const { html } = post;
  const { tagSlugs } = post.fields;
  return (
    <div className={styles['post']}>
      <div className={styles['post__nav']}>
        <Link className={styles['post__home-button']} to="/">
          <span>All Posts</span>
        </Link>
        <ToggleSwitch isDark={isDark} onChange={toggleTheme} />
      </div>

      <div className={styles['post__content']}>
        <Content
          body={html}
          title={title}
          date={date}
          timeToRead={timeToRead}
        />
      </div>

      <div className={styles['post__footer']}>
        <Tags tags={tags} tagSlugs={tagSlugs} />
      </div>

      <div className={styles['post__share']}>
        <Share url={url} title={title} twitterHandle={twitterHandle} />
      </div>
      <div className={styles['post__edit']}>
        <a
          href={`https://mobile.twitter.com/search?q=${encodeURIComponent(
            url
          )}`}
          target="__blank"
          rel="noopener noreferrer"
        >
          Discuss on Twitter
        </a>
        {' • '}
        <a
          href={`https://github.com/rowlandekemezie/rowlandbits/edit/master/${editLink}`}
          target="__blank"
          rel="noopener noreferrer"
        >
          <MdCreate style={{ marginRight: '4px' }} />
          Edit post on Github
        </a>
      </div>

      <div className={styles['post__comments']}>
        <Comments
          postSlug={post.fields.slug}
          postTitle={post.frontmatter.title}
        />
      </div>
    </div>
  );
};

export default Post;
