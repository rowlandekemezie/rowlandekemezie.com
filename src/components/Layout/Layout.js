import React from 'react';
import Helmet from 'react-helmet';
import Footer from 'components/Footer';
import classNames from 'classnames/bind';
import { ThemeProvider, ThemeContext } from 'utils/hooks';
import ScrollProgress from 'components/ScrollProgress';
import styles from './Layout.module.scss';

const cx = classNames.bind(styles);


const Layout = ({
  children,
  title,
  description,
  keywords
}) => (
    <ThemeProvider>
      <ThemeContext.Consumer>
        {({ isDark, toggleTheme }) => {
          const layoutClass = cx({
            layout: true,
            layout__blackbg: isDark
          });
          return (
            <div className={layoutClass}>
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
                  {React.Children.map(children, (child) => (
                    React.cloneElement(child, { isDark, toggleTheme })
                  ))}
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
          );
        }}
      </ThemeContext.Consumer>
    </ThemeProvider>
);

export default Layout;
