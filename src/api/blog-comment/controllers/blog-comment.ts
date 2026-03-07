/**
 * blog-comment controller (Strapi v5)
 *
 * Custom handlers:
 *  POST /blog-comments/submit          — tạo bình luận chờ duyệt
 *  POST /blog-comments/like/:documentId — tăng lượt thích nguyên tử
 *  GET  /blog-comments/by-post/:slug   — lấy bình luận đã duyệt theo slug bài viết
 */
import { factories } from '@strapi/strapi';
import { createHash } from 'node:crypto';
import { atomicIncrementField } from '../../../utils/strapi-helpers';
import { createLogger } from '../../../utils/logger';
import { validateBlogCommentSubmit } from '../../../schemas/blog-comment';

const COMMENT_UID = 'api::blog-comment.blog-comment';
const POST_UID = 'api::blog-post.blog-post';

// In-memory rate limiter: ipHash → timestamp of last submit
const submitCooldown = new Map<string, number>();
const COOLDOWN_MS = 60_000; // 1 phút giữa hai lần gửi cùng IP

function checkCooldown(ipHash: string): boolean {
  const last = submitCooldown.get(ipHash);
  if (!last) return false;
  return Date.now() - last < COOLDOWN_MS;
}

function recordCooldown(ipHash: string): void {
  submitCooldown.set(ipHash, Date.now());
  if (submitCooldown.size > 5000) {
    const cutoff = Date.now() - COOLDOWN_MS * 10;
    for (const [k, v] of submitCooldown.entries()) {
      if (v < cutoff) submitCooldown.delete(k);
    }
  }
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

export default factories.createCoreController(COMMENT_UID, ({ strapi }) => ({
  /**
   * POST /api/blog-comments/submit
   * Tạo bình luận mới với trạng thái "pending".
   */
  async submit(ctx) {
    const log = createLogger(strapi, 'blog-comment');
    const rawIp: string =
      (ctx.request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      ctx.request.ip ??
      'unknown';
    const ipHash = hashIp(rawIp);

    if (checkCooldown(ipHash)) {
      ctx.status = 429;
      ctx.body = { error: 'Bạn gửi bình luận quá nhanh. Vui lòng chờ một phút.' };
      return;
    }

    const body = ctx.request.body as Record<string, unknown>;

    // Zod Validation
    const validation = validateBlogCommentSubmit(body);
    if (!validation.success) {
      return ctx.badRequest('Dữ liệu không hợp lệ', { errors: validation.error.format() });
    }

    const { postSlug, content, authorName, authorCountry, authorAvatar, parentDocumentId } = validation.data;

    // stripHtml as an extra safety measure (Zod does string validation, but not stripping tags)
    const cleanContent = stripHtml(content);
    const cleanName = stripHtml(String(authorName));

    try {
      // Tìm bài viết theo slug
      const posts = await (strapi.documents as any)(POST_UID).findMany({
        filters: { slug: { $eq: postSlug } },
        status: 'published',
        fields: ['documentId', 'id'],
      });
      if (!posts?.length) {
        return ctx.notFound('Không tìm thấy bài viết.');
      }
      const post = posts[0];

      // Xây dựng data (mặc định là draft trong v5 Document Service)
      const data: Record<string, unknown> = {
        authorName: cleanName,
        authorCountry,
        authorAvatar,
        content: cleanContent,
        post: { connect: [{ documentId: post.documentId }] },
      };

      if (parentDocumentId && typeof parentDocumentId === 'string') {
        const parents = await (strapi.documents(COMMENT_UID as any) as any).findMany({
          filters: { documentId: String(parentDocumentId) },
          fields: ['documentId'],
          limit: 1,
        });
        if (parents?.length > 0) {
          data['parent'] = { connect: [{ documentId: String(parentDocumentId) }] };
        }
      }

      const entity = await (strapi.documents as any)(COMMENT_UID).create({ data });
      recordCooldown(ipHash);

      ctx.status = 201;
      ctx.body = {
        data: { documentId: entity.documentId },
        message: 'Bình luận đã được gửi và đang chờ duyệt.',
      };
    } catch (err) {
      console.error("DEBUG COMMENT ERROR:", err);
      log.error('submit failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server khi gửi bình luận.' };
    }
  },

  /**
   * POST /api/blog-comments/like/:documentId
   * Tăng nguyên tử lượt thích cho bình luận đã duyệt.
   */
  async like(ctx) {
    const { documentId } = ctx.params as { documentId: string };
    const log = createLogger(strapi, 'blog-comment');

    try {
      const results = await (strapi.documents(COMMENT_UID as any) as any).findMany({
        filters: { documentId },
        status: 'published',
        fields: ['documentId', 'likes'],
        limit: 1,
      });
      const existing = results[0];
      if (!existing) {
        return ctx.notFound('Không tìm thấy bình luận.');
      }

      const newLikes = await atomicIncrementField(strapi, COMMENT_UID, documentId, 'likes');
      ctx.body = { ok: true, likes: newLikes };
    } catch (err) {
      log.error('like failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server.' };
    }
  },

  /**
   * GET /api/blog-comments/by-post/:slug
   * Trả về bình luận đã duyệt (dạng cây, phân trang theo top-level).
   * Query: ?page=1&pageSize=20
   */
  async byPost(ctx) {
    const { slug } = ctx.params as { slug: string };
    const page = Math.max(1, parseInt(String(ctx.query['page'] ?? '1'), 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(String(ctx.query['pageSize'] ?? '20'), 10)));
    const log = createLogger(strapi, 'blog-comment');

    try {
      // Tìm bài viết
      const posts = await (strapi.documents as any)(POST_UID).findMany({
        filters: { slug: { $eq: slug } },
        status: 'published',
        fields: ['documentId'],
      });
      if (!posts?.length) {
        return ctx.notFound('Không tìm thấy bài viết.');
      }
      const post = posts[0];

      // Lấy tất cả bình luận đã duyệt cho bài viết này (max 500)
      const allComments = await (strapi.documents as any)(COMMENT_UID).findMany({
        filters: {
          post: { documentId: { $eq: post.documentId } },
        },
        status: 'published',
        sort: ['createdAt:asc'],
        limit: 500,
        fields: ['documentId', 'authorName', 'content', 'likes', 'createdAt', 'updatedAt'],
        populate: {
          authorAvatar: { fields: ['url', 'formats', 'width', 'height', 'alternativeText'] },
          parent: { fields: ['documentId'] },
        },
      });

      // Phân tách top-level và replies
      const topLevel = (allComments as any[]).filter((c: any) => !c.parent);
      const replies = (allComments as any[]).filter((c: any) => !!c.parent);

      // Phân trang top-level
      const total = topLevel.length;
      const pageCount = Math.ceil(total / pageSize);
      const start = (page - 1) * pageSize;
      const paginatedTopLevel = topLevel
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(start, start + pageSize);

      // Gắn replies vào top-level (replies sắp xếp cũ nhất trước)
      const threaded = paginatedTopLevel.map((comment: any) => ({
        ...comment,
        parent: undefined,
        replies: replies
          .filter((r: any) => r.parent?.documentId === comment.documentId)
          .map((r: any) => ({ ...r, parent: undefined }))
          .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
      }));

      ctx.body = {
        data: threaded,
        meta: {
          pagination: { page, pageSize, pageCount, total },
        },
      };
    } catch (err) {
      log.error('byPost failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server.' };
    }
  },

  /**
   * GET /api/blog-comments/latest
   * Trả về N bình luận đã duyệt mới nhất (không phân trang, dùng cho sidebar).
   * Query: ?limit=5
   */
  async latest(ctx) {
    const limit = Math.min(20, Math.max(1, parseInt(String(ctx.query['limit'] ?? '5'), 10)));
    const log = createLogger(strapi, 'blog-comment');

    try {
      const comments = await (strapi.documents as any)(COMMENT_UID).findMany({
        filters: { parent: null },
        status: 'published',
        sort: ['createdAt:desc'],
        limit,
        fields: ['documentId', 'authorName', 'content', 'createdAt'],
        populate: {
          post: { fields: ['documentId', 'slug', 'title'] },
        },
      });

      ctx.body = { data: comments ?? [] };
    } catch (err) {
      log.error('latest failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server.' };
    }
  },
}));
