import React from 'react';
import get from 'lodash/get';
import { graphql } from 'gatsby';
import Layout from 'components/Layout';
import Post from 'components/Post';
import SEO from 'components/Seo';

const PostTemplate = ({
  data: { site, markdownRemark }
}) => {
  const { title: siteTitle, subtitle: siteSubtitle } = site.siteMetadata;

  const {
    tags: keywords,
    title: postTitle,
    description: postDescription
  } = markdownRemark.frontmatter;

  const metaDescription = postDescription !== null ? postDescription : siteSubtitle;

  return (
    <Layout
      title={`${postTitle} - ${siteTitle}`}
      description={metaDescription}
      keywords={keywords}
    >
      <SEO
        title={markdownRemark.frontmatter.title}
        description={markdownRemark.frontmatter.description}
        slug={markdownRemark.fields.slug}
        image={get(markdownRemark, 'frontmatter.image.childImageSharp.fluid.src')}
      />
      <Post
        post={markdownRemark}
        timeToRead={markdownRemark.timeToRead}
        twitterHandle={site.siteMetadata.author.contacts.twitter}
        url={`${site.siteMetadata.url}${markdownRemark.fields.slug}`}
        editLink={`content/${markdownRemark.fields.slug
        }index.md`}
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
        image {
          childImageSharp {
            fluid {
              src
            }
          }
        }
      }
    }
  }
`;

export default PostTemplate;
