import React from 'react';
import { withPrefix, Link } from 'gatsby';
import ToggleSwitch from 'components/ToggleSwitch';
import styles from './Author.module.scss';

const Author = ({
  author, isIndex, isDark, toggleTheme
}) => (
  <div className={styles['author']}>
    <div className={styles['author__toggle-switch']}>
      <Link to="/" className={styles['author__link']}>
        <img
          src={withPrefix(author.photo)}
          className={styles['author__photo']}
          width="75"
          height="75"
          alt={author.name}
        />
      </Link>
      <ToggleSwitch isDark={isDark} onChange={toggleTheme} />
    </div>

    {isIndex ? (
      <h1 className={styles['author__title']}>
        <Link className={styles['author__title-link']} to="/">
          {author.name}
        </Link>
      </h1>
    ) : (
      <h2 className={styles['author__title']}>
        <Link className={styles['author__title-link']} to="/">
          {author.name}
        </Link>
      </h2>
    )}
    <p className={styles['author__subtitle']}>{author.bio}</p>
  </div>
);

export default Author;
