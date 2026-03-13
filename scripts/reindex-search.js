const path = require('path')
const strapiFactory = require('@strapi/strapi')

const BLOG_POST_TARGET = 'blog-post'

function parseDocumentIdArg(argv) {
  const arg = argv.find((value) => value.startsWith('--documentId='))
  return arg ? arg.slice('--documentId='.length) : null
}

async function run() {
  const target = process.argv[2] || 'all'
  const documentId = parseDocumentIdArg(process.argv.slice(3))
  const appDir = process.cwd()
  const strapi = await strapiFactory
    .createStrapi({
      appDir,
      distDir: path.join(appDir, 'dist'),
    })
    .load()

  try {
    const searchIndexService = strapi.service('api::blog-post.search-index')

    if (target === BLOG_POST_TARGET) {
      if (documentId) {
        const result = await searchIndexService.reindexBlogPost(documentId)
        console.log(`[Search Index] Reindexed ${BLOG_POST_TARGET} documentId=${documentId}`, result)
        return
      }

      const result = await searchIndexService.reindexAllBlogPosts()
      console.log(`[Search Index] Full rebuild enqueued for ${BLOG_POST_TARGET}`, result)
      return
    }

    if (target === 'all') {
      const result = await searchIndexService.reindexAllBlogPosts()
      console.log('[Search Index] Full rebuild enqueued for all configured content types.', result)
      return
    }

    throw new Error(`Unsupported reindex target: ${target}`)
  } finally {
    await strapi.destroy()
  }
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('[Search Index] Reindex failed:', error)
      process.exit(1)
    })
}
