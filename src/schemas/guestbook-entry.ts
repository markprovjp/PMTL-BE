import { z } from 'zod'

/**
 * Guestbook Entry submission schema
 * Validates public input for POST /guestbook-entries/submit
 * Dùng shared trên BE (controller) + FE (client validation)
 */

export const GuestbookEntrySubmitSchema = z.object({
  author_name: z
    .string()
    .min(2, 'Tên phải tối thiểu 2 ký tự')
    .max(100, 'Tên tối đa 100 ký tự')
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

  content: z
    .string()
    .min(10, 'Nội dung phải tối thiểu 10 ký tự')
    .max(2000, 'Nội dung tối đa 2000 ký tự')
    .trim(),
})

export type GuestbookEntrySubmitInput = z.infer<typeof GuestbookEntrySubmitSchema>

/**
 * Utility: Validate guestbook entry submission
 * Dùng trong controller để validate request body
 */
export function validateGuestbookEntrySubmit(data: unknown) {
  return GuestbookEntrySubmitSchema.safeParse(data)
}
