/**
 * types/generated/media.ts
 * Strapi Media types
 */

export interface StrapiMediaRef {
  id?: number
  documentId: string
  name: string
  alternativeText?: string
  caption?: string
  formats?: Record<string, any>
  url: string
  mime: string
  size: number
  width?: number
  height?: number
  provider: string
}
