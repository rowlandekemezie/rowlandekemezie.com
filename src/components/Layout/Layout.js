import React from 'react';
import Helmet from 'react-helmet';
import Footer from 'components/Footer';
import styles from './Layout.module.scss';

const Layout = ({
  children,
  title,
  description,
  keywords
}) => (
  <>
    <div className={styles.layout}>
      <Helmet
        title={title}
        meta={[
          { name: 'description', content: description },
          { name: 'keywords', content: (keywords || []).join() }
        ]}
      >
        <html lang="en" />
        <noscript>This site runs best with JavaScript enabled.</noscript>
      </Helmet>
      {children}
    </div>
    <Footer />
  </>
);

export default Layout;
