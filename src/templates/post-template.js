import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/Layout';
import Post from '../components/Post';

const PostTemplate = ({ data: { site, markdownRemark } }) => {
  const {
    title: siteTitle,
    subtitle: siteSubtitle
  } = site.siteMetadata;

  const {
    title: postTitle,
    description: postDescription,
  } = markdownRemark.frontmatter;

  const metaDescription = postDescription !== null ? postDescription : siteSubtitle;
  return (
    <Layout title={`${postTitle} - ${siteTitle}`} description={metaDescription}>
      <Post post={markdownRemark} timeToRead={markdownRemark.timeToRead} twitterHandle={site.siteMetadata.author.contacts.twitter} url={`${site.siteMetadata.url}${markdownRemark.fields.slug}`}/>
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
        date
        description
        tags
        title
      }
    }
  }
`;

export default PostTemplate;
