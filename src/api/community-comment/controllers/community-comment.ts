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

    log.info('createComment start', { postDocumentId, parentDocumentId, author_name });

    if (!content || typeof content !== 'string' || content.trim().length < 1) {
      return ctx.badRequest('Nội dung bình luận không được trống.');
    }
    if (!author_name || typeof author_name !== 'string' || author_name.trim().length < 1) {
      return ctx.badRequest('Thiếu tên tác giả.');
    }
    if (!postDocumentId || typeof postDocumentId !== 'string') {
      return ctx.badRequest('Thiếu bài viết (postDocumentId).');
    }

    const cleanContent = stripHtml(content).slice(0, 2000);
    const cleanName = stripHtml(String(author_name)).slice(0, 100);

    // Lấy user id từ JWT header nếu đã đăng nhập
    const authUserId: number | null = (ctx.state?.user?.id) ?? null;

    try {
      // 1. Xác nhận bài viết tồn tại và đã publish
      const postResults = await strapi.documents(POST_UID as any).findMany({
        filters: { documentId: postDocumentId },
        status: 'published',
        fields: ['id', 'documentId'],
        limit: 1,
      });

      const post = postResults[0];
      if (!post) {
        log.warn('Post not found or not published', { postDocumentId });
        return ctx.notFound('Không tìm thấy bài viết hoặc bài viết chưa được công khai.');
      }

      // 2. Nếu có reply (parent), xác nhận parent tồn tại và thuộc cùng post
      let parentId: number | null = null;
      if (parentDocumentId && typeof parentDocumentId === 'string') {
        const parentResults = await strapi.documents(COMMENT_UID as any).findMany({
          filters: { documentId: parentDocumentId },
          status: 'published',
          fields: ['id', 'documentId'],
          populate: { post: { fields: ['documentId'] } },
          limit: 1,
        });

        const parentComment = parentResults[0];
        if (!parentComment) {
          log.warn('Parent comment not found or not published', { parentDocumentId });
          return ctx.notFound('Không tìm thấy bình luận cha đang được hiển thị.');
        }

        // Kiểm tra parent có thuộc cùng bài viết không
        const parentPostId = parentComment.post?.documentId;
        if (parentPostId !== postDocumentId) {
          log.warn('Parent comment does not belong to this post', {
            parentDocumentId,
            expectedPost: postDocumentId,
            actualPost: parentPostId
          });
          return ctx.badRequest('Bình luận cha không thuộc về bài viết này.');
        }

        parentId = parentComment.id;
      }

      // 3. Chuẩn bị data cho entityService
      // Trong Strapi v5, Document Service đôi khi bị lỗi "locale null" khi connect 
      // draft document vào published document. Ta dùng entityService (id integer) để vượt qua.
      const data: any = {
        content: cleanContent,
        author_name: cleanName,
        author_avatar: author_avatar ? String(author_avatar).slice(0, 500) : undefined,
        user: authUserId,
        post: post.id,
        parent: parentId,
        likes: 0,
        publishedAt: null, // Mặc định là draft chờ duyệt
      };

      log.info('Creating community comment via entityService', {
        postId: post.id,
        parentId,
        author_name: cleanName
      });

      const entity = await (strapi as any).entityService.create(COMMENT_UID, {
        data,
      });

      recordCooldown(ipHash);

      ctx.status = 201;
      ctx.body = { data: entity, message: 'Bình luận đang chờ duyệt!' };
    } catch (err: any) {
      log.error('createComment failed', {
        error: err.message,
        stack: err.stack,
        postDocumentId,
        parentDocumentId
      });

      if (err.message?.includes('not found')) {
        ctx.status = 404;
        ctx.body = { error: 'Không tìm thấy dữ liệu liên quan (bài viết hoặc bình luận cha).' };
        return;
      }

      ctx.status = 500;
      ctx.body = { error: `Lỗi server khi gửi bình luận: ${err.message}` };
    }
  },

  // POST /api/community-comments/like/:documentId — tăng like nguyên tử
  async likeComment(ctx) {
    const { documentId } = ctx.params as any;
    const log = createLogger(strapi, 'community-comment');

    try {
      const results = await strapi.documents(COMMENT_UID as any).findMany({
        filters: { documentId },
        status: 'published',
        fields: ['documentId'],
        limit: 1,
      });
      const existing = results[0];
      if (!existing) return ctx.notFound('Không tìm thấy bình luận');

      const newLikes = await atomicIncrementField(strapi, COMMENT_UID, documentId, 'likes');
      ctx.body = { likes: newLikes };
    } catch (err: any) {
      log.error('likeComment failed', {
        error: err.message,
        documentId
      });
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server' };
    }
  },
}));
