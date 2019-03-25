import React from 'react';
import Helmet from 'react-helmet';
import styles from './Layout.module.scss';

const Layout = ({
  children,
  title,
  description,
  keywords
}) => (
  <div className={styles.layout}>
    <Helmet
      title={title}
      meta={[
        { name: 'description', content: description },
        { name: 'keywords', content: keywords.join() }
      ]}
    >
      <html lang="en" />
      <script src="https://js.tito.io/v1" async />
      <noscript>This site runs best with JavaScript enabled.</noscript>
    </Helmet>
    {children}
  </div>
);

export default Layout;
