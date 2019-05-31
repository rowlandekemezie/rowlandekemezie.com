import React from 'react';
import Helmet from 'react-helmet';
import Footer from 'components/Footer';
import { ThemeProvider } from 'utils/hooks';
import ScrollProgress from 'components/ScrollProgress';
import styles from './Layout.module.scss';

const Layout = ({
  children, title, description, keywords
}) => (
  <ThemeProvider>
    <div className={styles['layout']}>
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
      <div className={styles['layout__main']}>
        <>
          <ScrollProgress />
          {children}
        </>
      </div>
      <div className={styles['layout__scroll']}>
        <button
          className={styles['layout__scroll-button']}
          onClick={() => window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          })
          }
        >
          Scroll to Top
        </button>
      </div>
      <Footer />
    </div>
  </ThemeProvider>
);

export default Layout;
