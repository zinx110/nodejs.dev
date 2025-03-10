import { graphql } from 'gatsby';
import React from 'react';
import Article from '../components/Article';
import Layout from '../components/Layout';
import { BlogPageData, BlogPageContext } from '../types';

import '../styles/article-reader.scss';
import '../styles/learn.scss';
import RecentPosts from '../components/RecentPosts';

interface Props {
  data: BlogPageData;
  pageContext: BlogPageContext;
}
const BlogLayout = ({
  data,
  pageContext: { next, previous, relativePath },
}: Props): JSX.Element => {
  const {
    blog: {
      frontmatter: { title, blogAuthors },
      body,
      excerpt,
      fields: { date },
    },
    recent,
  } = data;

  const { edges: recentPosts } = recent;

  const recentPostsWithoutCurrent = recentPosts.filter(
    post => post.node.frontmatter.title !== title
  );

  return (
    <Layout title={title} description={excerpt}>
      <main className="grid-container blog-container">
        <RecentPosts posts={recentPostsWithoutCurrent} />
        <Article
          title={title}
          body={body}
          next={next}
          authors={blogAuthors}
          previous={previous}
          relativePath={relativePath}
          blog
          date={date}
        />
      </main>
    </Layout>
  );
};
export default BlogLayout;

export const query = graphql`
  query BlogBySlug($slug: String!) {
    blog: mdx(fields: { slug: { eq: $slug } }) {
      body
      excerpt(pruneLength: 500)
      frontmatter {
        title
        blogAuthors {
          id
          name
          website
        }
      }
      fields {
        slug
        date(formatString: "MMMM DD, YYYY")
      }
    }
    recent: allMdx(
      limit: 10
      filter: {
        fileAbsolutePath: { regex: "/blog/" }
        frontmatter: { title: { ne: "mock" } }
      }
      sort: { fields: fields___date, order: DESC }
    ) {
      edges {
        node {
          frontmatter {
            title
          }
          fields {
            slug
          }
        }
      }
    }
  }
`;
