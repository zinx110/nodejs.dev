// Use in this file CommonJS syntax see https://www.gatsbyjs.org/docs/migrating-from-v1-to-v2/#convert-to-either-pure-commonjs-or-pure-es6
const path = require('path');
const createSlug = require('./util-node/createSlug');
const getNodeReleasesData = require('./util-node/getNodeReleasesData');
const getBannersData = require('./util-node/getBannersData');
const getNvmData = require('./util-node/getNvmData');
const createPagesQuery = require('./util-node/createPagesQuery');
const createDocPages = require('./util-node/createDocPages');
const redirects = require('./util-node/redirects');

const BLOG_POST_FILENAME_REGEX = /([0-9]+)-([0-9]+)-([0-9]+)-(.+)\.md$/;

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage, createRedirect } = actions;

  const result = await graphql(createPagesQuery);

  if (result.errors) {
    reporter.panicOnBuild('Error while running "createPages" GraphQL query.');
    return;
  }

  Object.keys(redirects).forEach(from => {
    createRedirect({
      fromPath: from,
      toPath: redirects[from],
      isPermanent: true,
    });
  });

  const docTemplate = path.resolve('./src/templates/learn.tsx');
  const blogTemplate = path.resolve('./src/templates/blog.tsx');

  const { edges } = result.data.allMdx;
  const docPages = createDocPages(edges);

  docPages.forEach(page => {
    // Blog Pages don't necessary need to be within the `blog` category
    // But actually inside /content/blog/ section of the repository
    if (page.realPath.match('/blog/')) {
      return createPage({
        path: page.slug,
        component: blogTemplate,
        context: page,
      });
    }

    if (page.category === 'learn') {
      createPage({
        path: `/learn/${page.slug}`,
        component: docTemplate,
        context: page,
      });

      createRedirect({
        fromPath: `/${page.slug}`,
        toPath: `/learn/${page.slug}`,
        isPermanent: true,
      });
    }

    if (page.slug === 'introduction-to-nodejs') {
      createPage({
        path: `/learn`,
        component: docTemplate,
        context: page,
      });
    }

    return null;
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  if (node.internal.type === 'Mdx') {
    const { createNodeField } = actions;
    const { fileAbsolutePath, parent, frontmatter } = node;

    const relativePath =
      parent && getNode(parent) ? getNode(parent).relativePath : '';

    let slug;

    if (fileAbsolutePath && fileAbsolutePath.includes('/blog/')) {
      const [, year, month, day, filename] =
        BLOG_POST_FILENAME_REGEX.exec(relativePath);

      slug = '/blog/';

      if (frontmatter.category) {
        slug += `${frontmatter.category}/`;
      }

      slug += `${year}/${month}/${day}/${filename}`;

      const date = new Date(year, month - 1, day);

      createNodeField({
        node,
        name: 'date',
        value: date.toJSON(),
      });
    } else slug = createSlug(frontmatter.title);

    createNodeField({
      node,
      name: 'slug',
      value: slug,
    });

    if (frontmatter.authors) {
      createNodeField({
        node,
        name: 'authors',
        value: frontmatter.authors.split(','),
      });
    }

    if (frontmatter.category) {
      createNodeField({
        node,
        name: 'categoryName',
        value: frontmatter.category,
      });
    }
  }
};

exports.sourceNodes = async ({
  actions: { createNode },
  createNodeId,
  createContentDigest,
  reporter: { activityTimer },
}) => {
  let activity = activityTimer('Fetching Node release data');
  activity.start();
  try {
    const nodeReleasesData = await getNodeReleasesData();

    const nodeReleasesMeta = {
      id: createNodeId('node-releases'),
      parent: null,
      children: [],
      internal: {
        type: 'NodeReleases',
        mediaType: 'application/json',
        content: JSON.stringify(nodeReleasesData),
        contentDigest: createContentDigest(nodeReleasesData),
      },
    };

    await createNode({
      ...nodeReleasesData,
      ...nodeReleasesMeta,
    });

    activity.end();
    activity = activityTimer('Fetching Banners');
    activity.start();

    const bannersData = await getBannersData();

    const bannersMeta = {
      id: createNodeId('banners'),
      parent: null,
      children: [],
      internal: {
        type: 'Banners',
        mediaType: 'application/json',
        content: JSON.stringify(bannersData),
        contentDigest: createContentDigest(bannersData),
      },
    };

    await createNode({
      ...bannersData,
      ...bannersMeta,
    });

    activity.end();
    activity = activityTimer('Fetching latest NVM version data');
    activity.start();

    const nvmData = await getNvmData();

    const nvmMeta = {
      id: createNodeId('nvm'),
      parent: null,
      children: [],
      internal: {
        type: 'Nvm',
        mediaType: 'application/json',
        content: JSON.stringify(nvmData),
        contentDigest: createContentDigest(nvmData),
      },
    };

    await createNode({
      ...nvmData,
      ...nvmMeta,
    });

    activity.end();
  } catch (err) {
    activity.panic(err);
  }
};
