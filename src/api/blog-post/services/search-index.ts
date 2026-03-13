const BLOG_POST_UID = 'api::blog-post.blog-post'
const REINDEX_BATCH_SIZE = 100
const FIND_BATCH_SIZE = 500

function dedupeDocumentIds(documentIds: string[]) {
  return Array.from(new Set(documentIds.filter(Boolean)))
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export default ({ strapi }) => ({
  async withRetry<T>(label: string, task: () => Promise<T>, retries = 2): Promise<T> {
    let lastError: unknown

    for (let attempt = 1; attempt <= retries + 1; attempt += 1) {
      try {
        return await task()
      } catch (error) {
        lastError = error

        if (attempt > retries) {
          break
        }

        strapi.log.warn(
          `[Search Index] ${label} failed on attempt ${attempt}/${retries + 1}. Retrying...`
        )
        await sleep(attempt * 250)
      }
    }

    throw lastError
  },

  getPluginServices() {
    const plugin = strapi.plugin('meilisearch')

    return {
      meilisearch: plugin.service('meilisearch'),
      contentType: plugin.service('contentType'),
    }
  },

  async fetchPublishedBlogPostDocumentIds(filters: Record<string, unknown>) {
    const documentIds: string[] = []
    let start = 0

    while (true) {
      const entries = await strapi.documents(BLOG_POST_UID).findMany({
        status: 'published',
        filters,
        fields: ['documentId'],
        sort: ['publishedAt:desc'],
        start,
        limit: FIND_BATCH_SIZE,
      })

      const batch = Array.isArray(entries) ? entries : entries ? [entries] : []

      documentIds.push(
        ...batch
          .map((entry) => entry?.documentId)
          .filter((documentId): documentId is string => typeof documentId === 'string' && documentId.length > 0)
      )

      if (batch.length < FIND_BATCH_SIZE) {
        break
      }

      start += FIND_BATCH_SIZE
    }

    return dedupeDocumentIds(documentIds)
  },

  async reindexBlogPost(documentId: string) {
    return this.reindexBlogPosts([documentId])
  },

  async reindexBlogPosts(documentIds: string[]) {
    const uniqueDocumentIds = dedupeDocumentIds(documentIds)

    if (uniqueDocumentIds.length === 0) {
      return { updated: 0, deleted: 0 }
    }

    const { meilisearch, contentType } = this.getPluginServices()
    const entriesQuery = meilisearch.entriesQuery({ contentType: BLOG_POST_UID })

    let updated = 0
    let deleted = 0

    for (let index = 0; index < uniqueDocumentIds.length; index += REINDEX_BATCH_SIZE) {
      const batchIds = uniqueDocumentIds.slice(index, index + REINDEX_BATCH_SIZE)
      const entries = []
      const missingDocumentIds: string[] = []

      for (const documentId of batchIds) {
        const entry = await this.withRetry(`fetch ${BLOG_POST_UID} ${documentId}`, async () =>
          contentType.getEntry({
            contentType: BLOG_POST_UID,
            documentId,
            entriesQuery: { ...entriesQuery },
          })
        )

        if (entry) {
          entries.push(entry)
        } else {
          missingDocumentIds.push(documentId)
        }
      }

      if (entries.length > 0) {
        await this.withRetry(`update ${entries.length} ${BLOG_POST_UID} entries`, async () =>
          meilisearch.updateEntriesInMeilisearch({
            contentType: BLOG_POST_UID,
            entries,
          })
        )
        updated += entries.length
      }

      if (missingDocumentIds.length > 0) {
        await this.withRetry(`delete ${missingDocumentIds.length} ${BLOG_POST_UID} entries`, async () =>
          meilisearch.deleteEntriesFromMeiliSearch({
            contentType: BLOG_POST_UID,
            documentIds: missingDocumentIds,
          })
        )
        deleted += missingDocumentIds.length
      }
    }

    strapi.log.info(
      `[Search Index] Reindexed ${BLOG_POST_UID}: updated=${updated}, deleted=${deleted}.`
    )

    return { updated, deleted }
  },

  async reindexAllBlogPosts() {
    const { meilisearch } = this.getPluginServices()

    await this.withRetry(`full rebuild ${BLOG_POST_UID}`, async () =>
      meilisearch.updateContentTypeInMeiliSearch({ contentType: BLOG_POST_UID })
    )

    strapi.log.info(`[Search Index] Full rebuild enqueued for ${BLOG_POST_UID}.`)

    return { rebuilt: true }
  },

  async reindexByCategoryDocumentId(documentId: string) {
    const blogPostDocumentIds = await this.fetchPublishedBlogPostDocumentIds({
      categories: {
        documentId: {
          $eq: documentId,
        },
      },
    })

    return this.reindexBlogPosts(blogPostDocumentIds)
  },

  async reindexByTagDocumentId(documentId: string) {
    const blogPostDocumentIds = await this.fetchPublishedBlogPostDocumentIds({
      tags: {
        documentId: {
          $eq: documentId,
        },
      },
    })

    return this.reindexBlogPosts(blogPostDocumentIds)
  },
})
