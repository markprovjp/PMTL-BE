/**
 * category service
 */

import { factories } from '@strapi/strapi'

const CATEGORY_UID = 'api::category.category'

type FlatCategory = {
  id: number
  documentId: string
  uuid?: string | null
  name: string
  slug: string
  description?: string | null
  color?: string | null
  order?: number | null
  is_active?: boolean | null
  blog_posts?: null
  publishedAt?: string | null
  createdAt?: string
  updatedAt?: string
  parent?: {
    id?: number
    documentId?: string
    uuid?: string | null
    name?: string
    slug?: string
    createdAt?: string
    updatedAt?: string
    publishedAt?: string | null
  } | null
}

type CategoryTreeNode = FlatCategory & {
  depth: number
  children: CategoryTreeNode[]
}

export default factories.createCoreService(CATEGORY_UID, ({ strapi }) => ({
  async fetchActiveFlat(): Promise<FlatCategory[]> {
    return await strapi.documents(CATEGORY_UID).findMany({
      status: 'published',
      filters: {
        is_active: { $ne: false },
      },
      fields: ['documentId', 'uuid', 'name', 'slug', 'description', 'color', 'order', 'is_active', 'publishedAt', 'createdAt', 'updatedAt'],
      populate: {
        parent: {
          fields: ['documentId', 'uuid', 'name', 'slug', 'publishedAt', 'createdAt', 'updatedAt'],
        },
      },
      sort: ['order:asc', 'name:asc'],
      limit: 500,
    }) as FlatCategory[]
  },

  buildTree(flat: FlatCategory[]): CategoryTreeNode[] {
    const map = new Map<string, CategoryTreeNode>()

    for (const category of flat) {
      map.set(category.documentId, {
        ...category,
        blog_posts: null,
        depth: 0,
        children: [],
      })
    }

    const roots: CategoryTreeNode[] = []

    for (const node of map.values()) {
      const parentDocumentId = node.parent?.documentId
      if (parentDocumentId && map.has(parentDocumentId)) {
        const parentNode = map.get(parentDocumentId)!
        node.depth = parentNode.depth + 1
        parentNode.children.push(node)
      } else {
        roots.push(node)
      }
    }

    const sortNodes = (nodes: CategoryTreeNode[]) => {
      nodes.sort((a, b) => {
        const orderDelta = (a.order ?? 0) - (b.order ?? 0)
        if (orderDelta !== 0) return orderDelta
        return a.name.localeCompare(b.name, 'vi')
      })
      nodes.forEach((node) => sortNodes(node.children))
    }

    sortNodes(roots)
    return roots
  },

  async findTree() {
    const flat = await this.fetchActiveFlat()
    return this.buildTree(flat)
  },

  async findBreadcrumbBySlug(slug: string) {
    const flat = await this.fetchActiveFlat()
    const map = new Map(flat.map((category) => [category.documentId, category]))
    const current = flat.find((category) => category.slug === slug)

    if (!current) {
      return []
    }

    const breadcrumb: FlatCategory[] = [current]
    let cursor = current

    while (cursor.parent?.documentId) {
      const parent = map.get(cursor.parent.documentId)
      if (!parent) break
      breadcrumb.unshift(parent)
      cursor = parent
    }

    return breadcrumb
  },
}))
