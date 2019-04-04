import React from 'react';
import { graphql, StaticQuery } from 'gatsby';
import ReactDisqusComments from 'react-disqus-comments';

export const PureComments = ({ data: { site, markdownRemark } }) => {
  const { url, title, disqusShortname } = site.siteMetadata;

  if (!disqusShortname) {
    return null;
  }

  return (
    <ReactDisqusComments
      shortname={disqusShortname}
      identifier={title}
      title={title}
      url={`${url}${markdownRemark.fields.slug}`}
    />
  );
};

export const Comments = (props) => (
  <StaticQuery
    query={graphql`
      query CommentsQuery {
        site {
          siteMetadata {
            disqusShortname
            url
            title
          }
        }
        markdownRemark {
          fields {
            slug
          }
        }
      }
    `}
    render={(data) => <PureComments {...props} data={data} />}
  />
);

export default Comments;
