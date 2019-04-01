import React from 'react';
import { graphql } from 'gatsby';
import Layout from 'components/Layout';
import Post from 'components/Post';
import SEO from 'components/Seo';

const PostTemplate = ({ data: { site, markdownRemark, allMarkdownRemark } }) => {
  const {
    title: siteTitle,
    subtitle: siteSubtitle
  } = site.siteMetadata;

  const {
    tags: keywords,
    title: postTitle,
    description: postDescription,
  } = markdownRemark.frontmatter;

  const metaDescription = postDescription !== null ? postDescription : siteSubtitle;

  return (
    <Layout title={`${postTitle} - ${siteTitle}`} description={metaDescription} keywords={keywords}>
      <SEO
        title={markdownRemark.frontmatter.title}
        description={markdownRemark.frontmatter.description}
        slug={markdownRemark.fields.slug}
        image={allMarkdownRemark.edges[0].node.frontmatter.image}
      />
      <Post
        post={markdownRemark}
        timeToRead={markdownRemark.timeToRead}
        twitterHandle={site.siteMetadata.author.contacts.twitter}
        url={`${site.siteMetadata.url}${markdownRemark.fields.slug}`}
        editLink={`content/${allMarkdownRemark.edges[0].node.parent.relativePath}`}
      />
    </Layout>
  );
};

export const query = graphql`
  query PostBySlug($slug: String!) {
    site {
      siteMetadata {
        author {
          name
          contacts {
            twitter
          }
        }
        disqusShortname
        subtitle
        title
        url
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      fields {
        tagSlugs
        slug
      }
      timeToRead
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        description
        tags
        title
      }
    }
    allMarkdownRemark (
    filter: { frontmatter: {slug: { eq: $slug}} }
    ) {
      edges {
        node {
          parent {
            ... on File {
              relativePath
            }
          }
          frontmatter {
            image
          }
        }
      }
    }
  }
`;

export default PostTemplate;
