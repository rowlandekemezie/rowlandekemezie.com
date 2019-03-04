import React from 'react';
import { Link } from 'gatsby';
import Author from './Author';
import Comments from './Comments';
import Content from './Content';
import Meta from './Meta';
import Tags from './Tags';
import Share from '../Share'
import styles from './Post.module.scss';

const Post = ({ post, timeToRead, twitterHandle, url }) => {
  const {
    tags,
    title,
    date,
  } = post.frontmatter;

  const { html } = post;
  const { tagSlugs } = post.fields;

  return (
    <div className={styles['post']}>
      <Link className={styles['post__home-button']} to="/">All Articles</Link>

      <div className={styles['post__content']}>
        <Content body={html} title={title} date={date} timeToRead={timeToRead} />
      </div>

      <div className={styles['post__footer']}>
        <Tags tags={tags} tagSlugs={tagSlugs} />
      </div>

      <div className={styles['post__share']}>
        <Share
          url={url}
          title={title}
          twitterHandle={twitterHandle}
        />
      </div>

      <div className={styles['post__edit']}>
        <Link
          to="#"
        />
      </div>

      <div className={styles['post__comments']}>
        <Comments postSlug={post.fields.slug} postTitle={post.frontmatter.title} />
      </div>
    </div>
  );
};

export default Post;
