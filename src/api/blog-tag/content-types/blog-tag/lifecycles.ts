const BLOG_TAG_UID = 'api::blog-tag.blog-tag'

async function getRelatedBlogPostDocumentIds(strapi, where: Record<string, unknown>) {
  const entry = await strapi.db.query(BLOG_TAG_UID).findOne({
    where,
    populate: {
      blog_posts: {
        select: ['documentId'],
      },
    },
  })

  return (entry?.blog_posts ?? [])
    .map((post) => post?.documentId)
    .filter((documentId): documentId is string => typeof documentId === 'string' && documentId.length > 0)
}

export default {
  async afterUpdate(event) {
    const documentId = event.result?.documentId

    if (!documentId) {
      return
    }

    await strapi.service('api::blog-post.search-index').reindexByTagDocumentId(documentId)
  },

  async beforeDelete(event) {
    event.state = event.state ?? {}
    event.state.relatedDocumentIds = await getRelatedBlogPostDocumentIds(strapi, event.params?.where ?? {})
  },

  async afterDelete(event) {
    const relatedDocumentIds = event.state?.relatedDocumentIds ?? []

    if (relatedDocumentIds.length === 0) {
      return
    }

    await strapi.service('api::blog-post.search-index').reindexBlogPosts(relatedDocumentIds)
  },
}
