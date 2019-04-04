import React from 'react';
import { graphql } from 'gatsby';
import Layout from 'components/Layout';
import Page from 'components/Page';

const PageTemplate = ({ data: { site, markdownRemark } }) => {
  const { title: siteTitle, subtitle: siteSubtitle } = site.siteMetadata;

  const {
    tags: keywords,
    title: pageTitle,
    description: pageDescription
  } = markdownRemark.frontmatter;

  const { html: pageBody } = markdownRemark;

  const metaDescription = pageDescription !== null ? pageDescription : siteSubtitle;

  const isAboutPage = pageTitle === 'Meet Rowland I. Ekemezie';

  return (
    <Layout
      title={`${pageTitle} - ${siteTitle}`}
      description={metaDescription}
      keywords={keywords}
    >
      <Page title={pageTitle} isAboutPage={isAboutPage}>
        <div dangerouslySetInnerHTML={{ __html: pageBody }} />
      </Page>
    </Layout>
  );
};

export const query = graphql`
  query PageBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        subtitle
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      frontmatter {
        title
        date
        description
        tags
      }
    }
  }
`;

export default PageTemplate;
