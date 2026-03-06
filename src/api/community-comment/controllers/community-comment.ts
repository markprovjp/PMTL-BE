/**
 * community-comment controller (Strapi v5)
 *
 * Custom handlers:
 *  POST /community-comments/submit          — gửi bình luận chờ duyệt (rate-limited)
 *  POST /community-comments/like/:documentId — tăng lượt thích nguyên tử
 */
import { factories } from '@strapi/strapi';
import { createHash } from 'node:crypto';
import { atomicIncrementField } from '../../../utils/strapi-helpers';
import { createLogger } from '../../../utils/logger';

const COMMENT_UID = 'api::community-comment.community-comment';
const POST_UID = 'api::community-post.community-post';

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
   * POST /api/community-comments/submit
   * Chấp nhận postDocumentId (string) + tuỳ chọn parentDocumentId (string).
   */
  async createComment(ctx) {
    const log = createLogger(strapi, 'community-comment');
    const rawIp: string =
      (ctx.request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      ctx.request.ip ??
      'unknown';
    const ipHash = hashIp(rawIp);

    if (checkCooldown(ipHash)) {
      ctx.status = 429;
      ctx.body = { error: 'Bạn gửi bình luận quá nhanh. Vui lòng chờ 1 phút.' };
      return;
    }

    const body = ctx.request.body as Record<string, unknown>;
    const { postDocumentId, content, author_name, author_avatar, parentDocumentId } = body;

    if (!content || typeof content !== 'string' || content.trim().length < 1) {
      return ctx.badRequest('Nội dung bình luận không được trống.');
    }
    if (!author_name || typeof author_name !== 'string' || author_name.trim().length < 1) {
      return ctx.badRequest('Thiếu tên tác giả.');
    }
    if (!postDocumentId || typeof postDocumentId !== 'string') {
      return ctx.badRequest('Thiếu postDocumentId.');
    }

    const cleanContent = stripHtml(content).slice(0, 2000);
    const cleanName = stripHtml(String(author_name)).slice(0, 100);

    // Lấy user id từ JWT header nếu đã đăng nhập
    const authUserId: number | null = (ctx.state?.user?.id) ?? null;

    try {
      // Xác nhận bài viết tồn tại và đã publish
      const post = await (strapi.documents as any)(POST_UID).findOne({
        documentId: postDocumentId,
        status: 'published',
        fields: ['documentId'],
      });
      if (!post) return ctx.notFound('Không tìm thấy bài viết.');

      const data: any = {
        content: cleanContent,
        author_name: cleanName,
        ...(author_avatar ? { author_avatar: String(author_avatar).slice(0, 500) } : {}),
        ...(authUserId ? { user: authUserId } : {}),
        post: { connect: [{ documentId: postDocumentId }] },
        likes: 0,
      };

      // Bình luận lồng: kết nối qua quan hệ parent
      if (parentDocumentId && typeof parentDocumentId === 'string') {
        data.parent = { connect: [{ documentId: parentDocumentId }] };
      }

      const entity = await (strapi.documents as any)(COMMENT_UID).create({ data });
      recordCooldown(ipHash);

      ctx.status = 201;
      ctx.body = { data: entity, message: 'Bình luận đang chờ duyệt!' };
    } catch (err) {
      log.error('createComment failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server khi gửi bình luận.' };
    }
  },

  // POST /api/community-comments/like/:documentId — tăng like nguyên tử
  async likeComment(ctx) {
    const { documentId } = ctx.params as any;
    const log = createLogger(strapi, 'community-comment');

    try {
      const existing = await (strapi.documents as any)(COMMENT_UID).findOne({
        documentId,
        status: 'published',
        fields: ['documentId'],
      });
      if (!existing) return ctx.notFound('Không tìm thấy bình luận');

      const newLikes = await atomicIncrementField(strapi, COMMENT_UID, documentId, 'likes');
      ctx.body = { likes: newLikes };
    } catch (err) {
      log.error('likeComment failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server' };
    }
  },
}));
