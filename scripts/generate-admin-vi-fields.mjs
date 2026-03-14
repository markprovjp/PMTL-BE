import fs from 'fs'
import path from 'path'

const appRoot = path.resolve(process.cwd())
const apiDir = path.join(appRoot, 'src', 'api')
const componentsDir = path.join(appRoot, 'src', 'components')
const usersPermissionsUserSchema = path.join(
  appRoot,
  'src',
  'extensions',
  'users-permissions',
  'content-types',
  'user',
  'schema.json'
)
const translationsPath = path.join(appRoot, 'src', 'admin', 'extensions', 'translations', 'vi.json')

const fixedTranslationMap = new Map([
  ['System · Audit Log', 'Hệ thống · Nhật ký kiểm tra'],
  ['System · Content History', 'Hệ thống · Lịch sử nội dung'],
  ['System · Request Guard', 'Hệ thống · Chốt chống lặp'],
  ['User', 'Người dùng'],
  ['Users', 'Người dùng'],
  ['Users & Permissions', 'Người dùng & Phân quyền'],
  ['global.users', 'Người dùng'],
  ['content-manager.content-types.api::audit-log.audit-log', 'Hệ thống · Nhật ký kiểm tra'],
  ['content-manager.content-types.api::content-history.content-history', 'Hệ thống · Lịch sử nội dung'],
  ['content-manager.content-types.api::request-guard.request-guard', 'Hệ thống · Chốt chống lặp'],
  ['content-manager.content-types.plugin::users-permissions.user', 'Người dùng'],
  ['Create an entry', 'Tạo bản ghi mới'],
  ['Create new entry', 'Tạo bản ghi mới'],
  ['More actions', 'Tác vụ khác'],
  ['Add an entry', 'Thêm bản ghi'],
  ['Press spacebar to grab and re-order', 'Nhấn phím cách để kéo và sắp xếp lại'],
  ['Regenerate', 'Tạo lại'],
  ['Import File', 'Nhập tệp'],
  ['Export', 'Xuất'],
  ['draft', 'Bản nháp'],
  ['published', 'Đã xuất bản'],
  ['DRAFT', 'BẢN NHÁP'],
  ['PUBLISHED', 'ĐÃ XUẤT BẢN'],
])

const baseMap = new Map([
  ['title', 'Tiêu đề'],
  ['name', 'Tên'],
  ['slug', 'Slug'],
  ['seo', 'SEO'],
  ['description', 'Mô tả'],
  ['content', 'Nội dung'],
  ['shortExcerpt', 'Tóm tắt'],
  ['excerpt', 'Trích đoạn'],
  ['body', 'Nội dung'],
  ['summary', 'Tóm tắt'],
  ['coverImage', 'Ảnh bìa'],
  ['cover_image', 'Ảnh bìa'],
  ['thumbnail', 'Ảnh đại diện'],
  ['image', 'Ảnh'],
  ['images', 'Hình ảnh'],
  ['gallery', 'Bộ sưu tập'],
  ['video_url', 'Link video'],
  ['audio_url', 'Link audio'],
  ['sourceName', 'Nguồn'],
  ['sourceUrl', 'Đường dẫn nguồn'],
  ['sourceTitle', 'Tiêu đề nguồn'],
  ['seriesKey', 'Mã chuỗi'],
  ['seriesNumber', 'Số thứ tự chuỗi'],
  ['url', 'Đường dẫn'],
  ['pdf_url', 'Link PDF'],
  ['file', 'Tệp'],
  ['files', 'Tệp đính kèm'],
  ['attached_files', 'Tệp đính kèm'],
  ['avatar', 'Ảnh đại diện'],
  ['author', 'Tác giả'],
  ['authorName', 'Tên tác giả'],
  ['author_name', 'Tên tác giả'],
  ['authorAvatar', 'Ảnh tác giả'],
  ['author_avatar', 'Ảnh tác giả'],
  ['user', 'Người dùng'],
  ['author_country', 'Quốc gia tác giả'],
  ['userId', 'ID người dùng'],
  ['user_id', 'ID người dùng'],
  ['post', 'Bài đăng'],
  ['replies', 'Phản hồi'],
  ['badge', 'Huy hiệu'],
  ['ipHash', 'Mã băm IP'],
  ['entryType', 'Loại mục'],
  ['questionCategory', 'Danh mục câu hỏi'],
  ['isAnswered', 'Đã trả lời'],
  ['approvalStatus', 'Trạng thái duyệt'],
  ['adminReply', 'Phản hồi quản trị'],
  ['message', 'Nội dung nhắn'],
  ['moderationStatus', 'Trạng thái kiểm duyệt'],
  ['reportCount', 'Số lượt báo cáo'],
  ['lastReportReason', 'Lý do báo cáo gần nhất'],
  ['isHidden', 'Ẩn nội dung'],
  ['spamScore', 'Điểm spam'],
  ['isOfficialReply', 'Phản hồi chính thức'],
  ['isFavorite', 'Đã yêu thích'],
  ['isPinned', 'Đã ghim'],
  ['pinned', 'Ghim'],
  ['keywords', 'Từ khóa'],
  ['translatorHan', 'Hán dịch'],
  ['translatorViet', 'Việt dịch'],
  ['reviewer', 'Khảo dịch'],
  ['subtitle', 'Phụ đề'],
  ['highlight', 'Điểm nhấn'],
  ['sub', 'Mô tả ngắn'],
  ['buttonText', 'Nhãn nút'],
  ['buttonLink', 'Liên kết nút'],
  ['enabled', 'Bật'],
  ['fullName', 'Họ và tên'],
  ['avatar_url', 'Ảnh đại diện'],
  ['dharmaName', 'Pháp danh'],
  ['provider', 'Nhà cung cấp'],
  ['resetPasswordToken', 'Token đặt lại mật khẩu'],
  ['confirmationToken', 'Token xác nhận'],
  ['tags', 'Thẻ'],
  ['categories', 'Chuyên mục'],
  ['category', 'Chuyên mục'],
  ['parent', 'Danh mục cha'],
  ['children', 'Danh mục con'],
  ['type', 'Loại'],
  ['kind', 'Loại'],
  ['status', 'Trạng thái'],
  ['isActive', 'Kích hoạt'],
  ['is_active', 'Kích hoạt'],
  ['isFeatured', 'Nổi bật'],
  ['featured', 'Nổi bật'],
  ['sortOrder', 'Thứ tự'],
  ['order', 'Thứ tự'],
  ['orderIndex', 'Thứ tự'],
  ['priority', 'Ưu tiên'],
  ['mode', 'Chế độ'],
  ['target', 'Mục tiêu'],
  ['max', 'Giới hạn'],
  ['timezone', 'Múi giờ'],
  ['notificationTypes', 'Loại thông báo'],
  ['quietHoursStart', 'Giờ yên lặng bắt đầu'],
  ['quietHoursEnd', 'Giờ yên lặng kết thúc'],
  ['reminderHour', 'Giờ nhắc'],
  ['reminderMinute', 'Phút nhắc'],
  ['endpoint', 'Endpoint'],
  ['p256dh', 'P256dh'],
  ['auth', 'Auth'],
  ['lastSentAt', 'Lần gửi gần nhất'],
  ['lastError', 'Lỗi gần nhất'],
  ['failedCount', 'Số lỗi'],
  ['successCount', 'Số thành công'],
  ['invalidCount', 'Số không hợp lệ'],
  ['processedCount', 'Số đã xử lý'],
  ['targetedCount', 'Số mục tiêu'],
  ['cursor', 'Con trỏ'],
  ['chunkSize', 'Kích thước lô'],
  ['payload', 'Payload'],
  ['kind', 'Loại'],
  ['planType', 'Loại lịch'],
  ['planItems', 'Mục trong lịch'],
  ['itemsProgress', 'Tiến độ mục'],
  ['startedAt', 'Bắt đầu lúc'],
  ['completedAt', 'Hoàn thành lúc'],
  ['isCompleted', 'Đã hoàn thành'],
  ['isRecurringLunar', 'Lặp theo âm lịch'],
  ['lunarMonth', 'Tháng âm'],
  ['lunarDay', 'Ngày âm'],
  ['solarDate', 'Ngày dương'],
  ['eventType', 'Loại sự kiện'],
  ['eventStatus', 'Trạng thái sự kiện'],
  ['relatedBlogs', 'Bài liên quan'],
  ['timeRules', 'Quy tắc thời gian'],
  ['openingPrayer', 'Lời nguyện mở đầu'],
  ['recommendedPresets', 'Preset đề xuất'],
  ['fileType', 'Loại tệp'],
  ['groupYear', 'Năm nhóm'],
  ['groupLabel', 'Nhãn nhóm'],
  ['isUpdating', 'Đang cập nhật'],
  ['isNew', 'Mới'],
  ['fileSizeMB', 'Dung lượng tệp (MB)'],
  ['menuIcon', 'Biểu tượng menu'],
  ['showInMenu', 'Hiển thị trong menu'],
  ['visualTheme', 'Chủ đề hiển thị'],
  ['blocks', 'Khối nội dung'],
  ['sections', 'Mục thành phần'],
  ['downloads', 'Tải xuống'],
  ['curated_posts', 'Bài chọn lọc'],
  ['related_posts', 'Bài liên quan'],
  ['rating', 'Đánh giá'],
  ['views', 'Lượt xem'],
  ['unique_views', 'Lượt xem duy nhất'],
  ['likes', 'Lượt thích'],
  ['commentCount', 'Số bình luận'],
  ['allowComments', 'Cho phép bình luận'],
  ['date', 'Ngày'],
  ['eventDate', 'Ngày sự kiện'],
  ['shotDate', 'Ngày chụp'],
  ['startDate', 'Ngày bắt đầu'],
  ['endDate', 'Ngày kết thúc'],
  ['time', 'Thời gian'],
  ['timeString', 'Thời gian'],
  ['location', 'Địa điểm'],
  ['country', 'Quốc gia'],
  ['address', 'Địa chỉ'],
  ['device', 'Thiết bị'],
  ['photographer', 'Nhiếp ảnh'],
  ['email', 'Email'],
  ['phone', 'Số điện thoại'],
  ['note', 'Ghi chú'],
  ['notes', 'Ghi chú'],
  ['details', 'Chi tiết'],
  ['duration', 'Thời lượng'],
  ['volumeNumber', 'Số tập'],
  ['bookStart', 'Quyển từ'],
  ['bookEnd', 'Quyển đến'],
  ['chapterNumber', 'Số phẩm'],
  ['openingText', 'Mở đầu'],
  ['endingText', 'Kết thúc'],
  ['estimatedReadMinutes', 'Thời gian đọc'],
  ['markerKey', 'Ký hiệu'],
  ['term', 'Thuật ngữ'],
  ['meaning', 'Giải nghĩa'],
  ['sutra', 'Bộ kinh'],
  ['volume', 'Tập'],
  ['chapter', 'Phẩm'],
  ['glossaries', 'Chú giải'],
  ['volumes', 'Tập'],
  ['chapters', 'Phẩm'],
  ['anchorKey', 'Mốc'],
  ['charOffset', 'Vị trí'],
  ['scrollPercent', 'Phần trăm'],
  ['lastReadAt', 'Đọc lúc'],
  ['firstReadAt', 'Đọc lần đầu'],
  ['favoritedAt', 'Đánh dấu yêu thích lúc'],
  ['pinnedAt', 'Ghim lúc'],
  ['readCount', 'Số lần đọc'],
  ['excerptText', 'Trích đoạn'],
  ['excerpt', 'Trích đoạn'],
  ['noteText', 'Ghi chú'],
  ['guide_type', 'Loại hướng dẫn'],
  ['lunarEvent', 'Sự kiện âm lịch'],
  ['lunarEvents', 'Sự kiện âm lịch'],
  ['blog_posts', 'Bài viết blog'],
  ['comments', 'Bình luận'],
  ['color', 'Màu sắc'],
  ['audio', 'Âm thanh'],
  ['icon', 'Biểu tượng'],
  ['quote', 'Trích dẫn'],
  ['album', 'Album'],
  ['item', 'Mục'],
  ['link', 'Liên kết'],
  ['youtubeId', 'Mã YouTube'],
  ['plan', 'Kế hoạch'],
  ['tag', 'Nhãn'],
  ['logo', 'Logo'],
  ['year', 'Năm'],
  ['month', 'Tháng'],
  ['uuid', 'Mã định danh (UUID)'],
  ['targetDefault', 'Mục tiêu mặc định'],
  ['targetMin', 'Mục tiêu tối thiểu'],
  ['targetMax', 'Mục tiêu tối đa'],
  ['isOptional', 'Không bắt buộc'],
  ['scriptFile', 'Tệp bản kinh (PDF/Tài liệu)'],
  ['scriptPreviewImages', 'Ảnh xem trước bản kinh'],
  ['templateConfig', 'Cấu hình mẫu cá nhân'],
  ['sessionConfig', 'Cấu hình phiên hôm nay'],
  ['pageTitle', 'Tiêu đề trang'],
  ['pageDescription', 'Mô tả trang'],
  ['guidelinesTitle', 'Tiêu đề lưu ý'],
  ['guidelinesSummary', 'Tóm tắt lưu ý'],
  ['guidelineSections', 'Các mục lưu ý'],
  ['language', 'Ngôn ngữ'],
  ['speaker', 'Giảng sư'],
  ['step_number', 'Bước số'],
  ['video_url', 'Liên kết video'],
  ['audio_url', 'Liên kết âm thanh'],
  ['pdf_url', 'Liên kết PDF'],
  ['finishedAt', 'Kết thúc lúc'],
  ['payload', 'Dữ liệu tải'],
  ['endpoint', 'Điểm cuối'],
  ['auth', 'Mã xác thực'],
  ['p256dh', 'Khóa P256DH'],
  ['logo', 'Biểu trưng'],
  ['lucideName', 'Tên Lucide'],
  ['isActive', 'Đang hoạt động'],
  ['sortOrder', 'Thứ tự hiển thị'],
  ['notes', 'Ghi chú'],
  ['key', 'Mã khóa'],
  ['action', 'Hành động'],
  ['targetUid', 'UID nội dung'],
  ['targetDocumentId', 'Document ID mục tiêu'],
  ['targetId', 'ID mục tiêu'],
  ['targetLabel', 'Nhãn mục tiêu'],
  ['actorType', 'Loại tác nhân'],
  ['actorId', 'ID tác nhân'],
  ['actorDisplayName', 'Tên tác nhân'],
  ['requestMethod', 'Phương thức request'],
  ['requestPath', 'Đường dẫn request'],
  ['requestId', 'Request ID'],
  ['documentId', 'Mã tài liệu'],
  ['userAgent', 'Trình duyệt / User Agent'],
  ['changedFields', 'Các trường thay đổi'],
  ['metadata', 'Dữ liệu bổ sung'],
  ['versionNumber', 'Phiên bản'],
  ['snapshot', 'Ảnh chụp dữ liệu'],
  ['guardKey', 'Khóa guard'],
  ['scope', 'Phạm vi'],
  ['hits', 'Số lượt'],
  ['expiresAt', 'Hết hạn lúc'],
  ['lastSeenAt', 'Lần thấy gần nhất'],
  ['actorEmail', 'Email tác nhân'],
])

const enumMap = new Map([
  ['pending', 'Chờ xử lý'],
  ['processing', 'Đang xử lý'],
  ['completed', 'Hoàn tất'],
  ['failed', 'Thất bại'],
  ['approved', 'Đã duyệt'],
  ['visible', 'Hiển thị'],
  ['flagged', 'Bị gắn cờ'],
  ['hidden', 'Đã ẩn'],
  ['removed', 'Đã gỡ'],
  ['story', 'Chia sẻ'],
  ['feedback', 'Góp ý'],
  ['video', 'Video'],
  ['normal', 'Thông thường'],
  ['upcoming', 'Sắp diễn ra'],
  ['ongoing', 'Đang diễn ra'],
  ['ended', 'Đã kết thúc'],
  ['cancelled', 'Đã hủy'],
  ['daily', 'Hằng ngày'],
  ['special', 'Đặc biệt'],
  ['mantra', 'Thần chú'],
  ['sutra', 'Kinh'],
  ['prayer', 'Nghi thức'],
  ['daily_chant', 'Niệm hằng ngày'],
  ['broadcast', 'Phát thông báo'],
  ['content_update', 'Cập nhật nội dung'],
  ['event_reminder', 'Nhắc sự kiện'],
  ['community', 'Cộng đồng'],
  ['message', 'Lời nhắn'],
  ['question', 'Câu hỏi'],
  ['include', 'Bao gồm'],
  ['exclude', 'Loại trừ'],
  ['replace', 'Thay thế'],
  ['so-hoc', 'Sơ học'],
  ['phat-am', 'Phát âm'],
  ['thuc-hanh', 'Thực hành'],
  ['dharma-talk', 'Pháp thoại'],
  ['ceremony', 'Nghi lễ'],
  ['retreat', 'Khóa tu'],
  ['teaching', 'Giảng pháp'],
  ['practice', 'Thực hành'],
  ['reference', 'Tham khảo'],
  ['pdf', 'PDF'],
  ['mp3', 'MP3'],
  ['mp4', 'MP4'],
  ['zip', 'ZIP'],
  ['doc', 'DOC'],
  ['epub', 'EPUB'],
  ['html', 'HTML'],
  ['unknown', 'Không xác định'],
  ['khac', 'Khác'],
  ['buddha', 'Phật'],
  ['bodhisattva', 'Bồ Tát'],
  ['teacher', 'Tổ sư'],
  ['holiday', 'Ngày lễ'],
  ['fast', 'Ngày chay'],
  ['live', 'Đang diễn ra'],
  ['past', 'Đã diễn ra'],
  ['festival', 'Lễ hội'],
  ['webinar', 'Hội thảo trực tuyến'],
  ['liberation', 'Giải thoát'],
  ['enable', 'Bật'],
  ['disable', 'Tắt'],
  ['override_target', 'Ghi đè mục tiêu'],
  ['cap_max', 'Giới hạn tối đa'],
  ['step', 'Bước'],
  ['kinh-bai-tap', 'Kinh bài tập'],
  ['kinh_doanh', 'Kinh doanh'],
  ['hoa_sen', 'Hoa sen'],
  ['general', 'Chung'],
  ['social', 'Mạng xã hội'],
  ['navigation', 'Điều hướng'],
  ['content', 'Nội dung'],
  ['practice', 'Tu học'],
  ['create', 'Tạo mới'],
  ['update', 'Cập nhật'],
  ['delete', 'Xóa'],
  ['publish', 'Xuất bản'],
  ['unpublish', 'Gỡ xuất bản'],
  ['admin', 'Quản trị viên'],
  ['user', 'Người dùng'],
  ['guest', 'Khách'],
  ['system', 'Hệ thống'],
])

function normalizeKey(key) {
  return key.replace(/[\s-]/g, '_').trim()
}

function titleCase(input) {
  return input
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function humanizeField(field) {
  const normalized = normalizeKey(field)
  if (baseMap.has(field)) return baseMap.get(field)
  if (baseMap.has(normalized)) return baseMap.get(normalized)
  const spaced = normalized
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .toLowerCase()
  return titleCase(spaced)
}

function shouldReplace(current, field, nextLabel) {
  if (!current) return true
  const normalizedField = normalizeKey(field).toLowerCase()
  const normalizedCurrent = typeof current === 'string' ? normalizeKey(current).toLowerCase() : ''
  const looksUntranslated =
    normalizedCurrent === normalizedField ||
    normalizedCurrent === field.toLowerCase() ||
    normalizedCurrent === normalizeKey(field).toLowerCase()
  return looksUntranslated && current !== nextLabel
}

function shouldReplaceEnum(current, rawValue, enumLabel) {
  if (!current) return true
  const normalizedValue = normalizeKey(rawValue).toLowerCase()
  const normalizedCurrent = typeof current === 'string' ? normalizeKey(current).toLowerCase() : ''
  const normalizedLabel = normalizeKey(enumLabel).toLowerCase()
  const humanizedValue = normalizeKey(humanizeField(rawValue)).toLowerCase()
  const hasMappedEnum = enumMap.has(rawValue) || enumMap.has(normalizeKey(rawValue))
  const looksUntranslated =
    normalizedCurrent === normalizedValue ||
    normalizedCurrent === humanizedValue ||
    normalizedCurrent === rawValue.toLowerCase()
  if (hasMappedEnum && normalizedCurrent !== normalizedLabel) return true
  return looksUntranslated && normalizedCurrent !== normalizedLabel
}

function walkSchemas(dir) {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walkSchemas(full)
    if (entry.name === 'schema.json') return [full]
    return []
  })
}

const schemas = walkSchemas(apiDir)
const componentSchemas = walkSchemas(componentsDir)
const translations = fs.existsSync(translationsPath)
  ? JSON.parse(fs.readFileSync(translationsPath, 'utf8'))
  : {}

let added = 0
let updated = 0

for (const [key, value] of fixedTranslationMap.entries()) {
  if (translations[key] !== value) {
    if (translations[key]) {
      updated += 1
    } else {
      added += 1
    }
    translations[key] = value
  }
}

for (const schemaPath of schemas) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
  const uid = schema?.info?.singularName
  const plural = schema?.info?.pluralName
  if (!uid || !plural || !schema?.attributes) continue
  const apiKey = `api::${uid}.${uid}`
  const attrs = schema.attributes
  for (const field of Object.keys(attrs)) {
    const attr = attrs[field]
    const key = `content-manager.content-types.${apiKey}.${field}`
    const nextLabel = humanizeField(field)
    const current = translations[key]
    const normalizedField = normalizeKey(field).toLowerCase()
    const normalizedCurrent = typeof current === 'string' ? normalizeKey(current).toLowerCase() : ''
    const hasMappedLabel = baseMap.has(field) || baseMap.has(normalizeKey(field))
    const looksUntranslated =
      !current ||
      normalizedCurrent === normalizedField ||
      normalizedCurrent === field.toLowerCase() ||
      normalizedCurrent === normalizeKey(field).toLowerCase()

    if (!current) {
      translations[key] = nextLabel
      added += 1
    } else if (hasMappedLabel && current !== nextLabel) {
      // Force mapped labels so diacritics/wording stay consistent across schemas.
      translations[key] = nextLabel
      updated += 1
    } else if (looksUntranslated && current !== nextLabel) {
      translations[key] = nextLabel
      updated += 1
    }

    if (attr?.type === 'enumeration' && Array.isArray(attr.enum)) {
      for (const raw of attr.enum) {
        const value = String(raw)
        const enumLabel = enumMap.get(value) ?? enumMap.get(normalizeKey(value)) ?? humanizeField(value)
        const enumKeys = [
          `content-manager.content-types.${apiKey}.${field}.enum.${value}`,
          `content-manager.content-types.${apiKey}.${field}.${value}`,
          `${apiKey}.${field}.enum.${value}`,
          value,
        ]
        for (const enumKey of enumKeys) {
          const currentEnum = translations[enumKey]
          if (shouldReplaceEnum(currentEnum, value, enumLabel)) {
            translations[enumKey] = enumLabel
            added += currentEnum ? 0 : 1
            updated += currentEnum ? 1 : 0
          }
        }
      }
    }
  }
}

if (fs.existsSync(usersPermissionsUserSchema)) {
  const schema = JSON.parse(fs.readFileSync(usersPermissionsUserSchema, 'utf8'))
  const attrs = schema?.attributes ?? {}
  const apiKey = 'plugin::users-permissions.user'
  for (const field of Object.keys(attrs)) {
    const key = `content-manager.content-types.${apiKey}.${field}`
    const nextLabel = humanizeField(field)
    if (shouldReplace(translations[key], field, nextLabel)) {
      translations[key] = nextLabel
    }
  }
}

for (const schemaPath of componentSchemas) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
  const attrs = schema?.attributes ?? {}
  const rel = path.relative(componentsDir, schemaPath).replace(/\\/g, '/')
  const parts = rel.split('/')
  if (parts.length < 2) continue
  const compCategory = parts[0]
  const compName = parts[1].replace(/\.json$/, '')
  const keyVariants = [
    `content-manager.components.${compCategory}.${compName}`,
    `content-manager.components.${compCategory}.${compName.replace(/-/g, '_')}`,
    `content-manager.components.${compCategory}-${compName}`,
  ]
  for (const field of Object.keys(attrs)) {
    const nextLabel = humanizeField(field)
    for (const baseKey of keyVariants) {
      const key = `${baseKey}.${field}`
      if (shouldReplace(translations[key], field, nextLabel)) {
        translations[key] = nextLabel
      }
    }
  }
}

fs.writeFileSync(translationsPath, JSON.stringify(translations, null, 2), 'utf8')
console.log(`Generated ${added} labels, updated ${updated} -> ${translationsPath}`)
