/**
 * category controller
 */

import { factories } from '@strapi/strapi'

const CATEGORY_UID = 'api::category.category'

export default factories.createCoreController(CATEGORY_UID, ({ strapi }) => ({
  async tree(ctx) {
    const data = await strapi.service(CATEGORY_UID).findTree()

    ctx.body = {
      data,
      meta: {
        totalRoots: data.length,
      },
    }
  },

  async breadcrumb(ctx) {
    const slug = String(ctx.params?.slug ?? '')
    if (!slug) {
      return ctx.badRequest('Thiếu slug danh mục.')
    }

    const data = await strapi.service(CATEGORY_UID).findBreadcrumbBySlug(slug)
    ctx.body = {
      data,
      meta: {
        slug,
        total: data.length,
      },
    }
  },
}))
