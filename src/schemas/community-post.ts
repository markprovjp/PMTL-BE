import { z } from 'zod'

/**
 * Community Post submission schema
 * Validates public input for POST /community-posts/submit
 * Dùng shared trên BE (controller) + FE (client validation)
 */

export const CommunityPostSubmitSchema = z.object({
  title: z
    .string()
    .min(5, 'Tiêu đề phải tối thiểu 5 ký tự')
    .max(200, 'Tiêu đề tối đa 200 ký tự')
    .trim(),

  content: z
    .string()
    .min(10, 'Nội dung phải tối thiểu 10 ký tự')
    .max(5000, 'Nội dung tối đa 5000 ký tự')
    .trim(),

  type: z
    .enum(['cau-chuyen', 'cau-hoi', 'trai-nghiem'], {
      message: 'Loại bài phải là: câu chuyện, câu hỏi, hoặc trải nghiệm',
    })
    .default('cau-chuyen'),

  category: z
    .string()
    .max(50, 'Danh mục tối đa 50 ký tự')
    .trim()
    .optional(),

  author_name: z
    .string()
    .min(2, 'Tên tác giả phải tối thiểu 2 ký tự')
    .max(100, 'Tên tác giả tối đa 100 ký tự')
    .trim(),

  author_country: z
    .string()
    .max(50, 'Quốc gia tối đa 50 ký tự')
    .trim()
    .optional(),

  author_avatar: z
    .string()
    .url('Ảnh đại diện phải là URL hợp lệ')
    .optional()
    .or(z.literal('')),

  video_url: z
    .string()
    .url('URL video phải hợp lệ')
    .optional()
    .or(z.literal('')),

  tags: z
    .array(z.string().max(30, 'Mỗi thẻ tối đa 30 ký tự'))
    .max(10, 'Tối đa 10 thẻ')
    .optional(),

  cover_image: z
    .string()
    .url('Ảnh bìa phải là URL hợp lệ')
    .optional()
    .or(z.literal('')),
})

export type CommunityPostSubmitInput = z.infer<typeof CommunityPostSubmitSchema>

/**
 * Utility: Validate community post submission
 * Dùng trong controller để validate request body
 */
export function validateCommunityPostSubmit(data: unknown) {
  return CommunityPostSubmitSchema.safeParse(data)
}
