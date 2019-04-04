import React from 'react';
import { graphql, StaticQuery } from 'gatsby';
import Socials from 'components/Socials';
import Author from './Author';
import Menu from './Menu';
import styles from './Sidebar.module.scss';

export const PureSidebar = ({ data, isIndex }) => {
  const { author, menu } = data.site.siteMetadata;

  return (
    <div className={styles['sidebar']}>
      <div className={styles['sidebar__inner']}>
        <Author author={author} isIndex={isIndex} />
        <Menu menu={menu} />
        <Socials contacts={author.contacts} />
      </div>
    </div>
  );
};

export const Sidebar = (props) => (
  <StaticQuery
    query={graphql`
      query SidebarQuery {
        site {
          siteMetadata {
            title
            subtitle
            menu {
              label
              path
            }
            author {
              name
              photo
              bio
              contacts {
                twitter
                github
                email
                rss
              }
            }
          }
        }
      }
    `}
    render={(data) => <PureSidebar {...props} data={data} />}
  />
);

export default Sidebar;
