import React, { useRef } from 'react';
import classNames from 'classnames/bind';
import { Link } from 'gatsby';
import ToggleSwitch from 'components/ToggleSwitch';
import { useTheme } from 'utils/hooks';
import styles from './Page.module.scss';

const cx = classNames.bind(styles);

const Page = ({ title, children, isAboutPage }) => {
  const pageRef = useRef();
  const { isDark, toggleTheme } = useTheme();

  const pageClass = cx({
    page: !isAboutPage,
    'page-about': isAboutPage
  });

  return (
    <div ref={pageRef} className={pageClass}>
      <div className={styles['page__inner']}>
        {isAboutPage && (
          <div className={styles['page__nav']}>
            <Link to="/" className={styles['page__home-button']}>
              ← Back
            </Link>
            <ToggleSwitch isDark={isDark} onChange={toggleTheme} />
          </div>
        )}
        {title && <h1 className={styles['page__title']}>{title}</h1>}
        <div className={styles['page__body']}>{children}</div>
      </div>
    </div>
  );
};

export default Page;
