import { z } from 'zod'

/**
 * Blog Comment submission schema
 * Validates public input for POST /blog-comments/submit
 * Dùng shared trên BE (controller) + FE (client validation)
 */

export const BlogCommentSubmitSchema = z.object({
  content: z
    .string()
    .min(5, 'Bình luận phải tối thiểu 5 ký tự')
    .max(1000, 'Bình luận tối đa 1000 ký tự')
    .trim(),

  authorName: z
    .string()
    .min(2, 'Tên phải tối thiểu 2 ký tự')
    .max(100, 'Tên tối đa 100 ký tự')
    .trim(),

  authorCountry: z
    .string()
    .max(50, 'Quốc gia tối đa 50 ký tự')
    .trim()
    .optional(),

  authorAvatar: z
    .string()
    .url('Ảnh đại diện phải là URL hợp lệ')
    .optional()
    .or(z.literal('')),

  postSlug: z
    .string()
    .min(1, 'Slug bài viết là bắt buộc')
    .max(200, 'Slug tối đa 200 ký tự'),

  parentDocumentId: z
    .string()
    .optional(),
})

export type BlogCommentSubmitInput = z.infer<typeof BlogCommentSubmitSchema>

/**
 * Utility: Validate blog comment submission
 * Dùng trong controller để validate request body
 */
export function validateBlogCommentSubmit(data: unknown) {
  return BlogCommentSubmitSchema.safeParse(data)
}
