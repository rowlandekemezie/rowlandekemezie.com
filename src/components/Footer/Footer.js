import React from 'react';
import Subscribe from 'components/Form';
import Contacts from 'components/Sidebar/Contacts';
import { StaticQuery, graphql } from 'gatsby';
import styles from './Footer.module.scss';

const Footer = () => (
    <StaticQuery
      query={graphql`
        query {  
          site {
              siteMetadata {
                url
                author {
                  contacts {
                    twitter
                    github
                    rss
                  }
                }
              }
            }
          }`
      }
      render={({ site }) => (
        <footer className={styles['footer']}>
        <div className={styles['footer__wrapper']}>
          <div className={styles['footer__subscribe']}>
            <Subscribe />
          </div>
          <div className={styles['footer__socials']}>
            <Contacts contacts={site.siteMetadata.author.contacts} />
            <p className={styles['footer__copyright']}>
              <span>&copy; 2019 rowlandekemezie</span>
            </p>
          </div>
        </div>
      </footer>
      )}
    />

);


export default Footer;