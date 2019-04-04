import React from 'react';
import { graphql } from 'gatsby';
import Layout from 'components/Layout';
import Sidebar from 'components/Sidebar';
import Feed from 'components/Feed';
import Page from 'components/Page';
import Pagination from 'components/Pagination';

const PAGE_LIMIT = 4;
const IndexTemplate = ({ data, pageContext }) => {
  const {
    tags: keywords,
    title: siteTitle,
    subtitle: siteSubtitle
  } = data.site.siteMetadata;

  const {
    currentPage,
    hasNextPage,
    hasPrevPage,
    prevPagePath,
    nextPagePath
  } = pageContext;

  const { edges } = data.allMarkdownRemark;
  const pageTitle = currentPage > 0 ? `Posts - Page ${currentPage} - ${siteTitle}` : siteTitle;

  return (
    <Layout title={pageTitle} description={siteSubtitle} keywords={keywords}>
      <Sidebar isIndex />
      <Page>
        <Feed edges={edges} />
        {edges.length > PAGE_LIMIT ? (
          <Pagination
            prevPagePath={prevPagePath}
            nextPagePath={nextPagePath}
            hasPrevPage={hasPrevPage}
            hasNextPage={hasNextPage}
          />
        ) : null}
      </Page>
    </Layout>
  );
};

export const query = graphql`
  query IndexTemplate($postsLimit: Int!, $postsOffset: Int!) {
    site {
      siteMetadata {
        title
        subtitle
      }
    }
    allMarkdownRemark(
      limit: $postsLimit
      skip: $postsOffset
      filter: { frontmatter: { template: { eq: "post" }, draft: { ne: true } } }
      sort: { order: DESC, fields: [frontmatter___date] }
    ) {
      edges {
        node {
          fields {
            slug
            categorySlug
          }
          timeToRead
          frontmatter {
            title
            date(formatString: "MMMM YYYY")
            category
            description
            tags
          }
        }
      }
    }
  }
`;

export default IndexTemplate;
