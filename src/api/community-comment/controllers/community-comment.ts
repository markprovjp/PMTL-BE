/**
 * community-comment controller (Strapi v5)
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::community-comment.community-comment', ({ strapi }) => ({
  // POST /api/community-comments/submit - Gửi bình luận mới
  async createComment(ctx) {
    const { postId, content, author_name, author_country, author_avatar, parent_comment } =
      ctx.request.body as any;

    if (!content || !author_name || !postId) {
      return ctx.badRequest('Thiếu thông tin: content, author_name, postId');
    }

    try {
      let documentPostId = postId;

      // 1. Resolve postId to documentId (if numeric)
      if (!isNaN(Number(postId))) {
        const results = await strapi.db.query('api::community-post.community-post').findMany({
          where: { id: Number(postId) },
        });
        if (results && results.length > 0) {
          documentPostId = (results[0] as any).documentId;
        } else {
          return ctx.notFound(`Không tìm thấy bài viết với ID: ${postId}`);
        }
      }

      const entity = await strapi.documents('api::community-comment.community-comment').create({
        data: {
          content,
          author_name,
          author_country: author_country || 'Việt Nam',
          author_avatar,
          post: { connect: [{ documentId: documentPostId }] } as any,
          parent_id: Number(parent_comment || 0),
          likes: 0,
        },
      });

      ctx.status = 201;
      ctx.body = { data: entity, message: 'Bình luận đang chờ duyệt!' };
    } catch (error) {
      console.error('[CommunityComment submit] error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server khi gửi bình luận' };
    }
  },

  // POST /api/community-comments/like/:id - Tăng like
  async likeComment(ctx) {
    const { id } = ctx.params as any;

    try {
      // 1. Tìm bằng documentId
      let existing = await strapi.documents('api::community-comment.community-comment').findOne({
        documentId: id,
        status: 'published',
      });

      // 2. Thử tìm bằng integer id
      if (!existing && !isNaN(Number(id))) {
        const results = await strapi.db.query('api::community-comment.community-comment').findMany({
          where: { id: Number(id) },
        });
        if (results && results.length > 0) {
          const documentId = (results[0] as any).documentId;
          existing = await strapi.documents('api::community-comment.community-comment').findOne({
            documentId,
            status: 'published',
          });
        }
      }

      if (!existing) return ctx.notFound('Không tìm thấy bình luận');

      const updated = await strapi.documents('api::community-comment.community-comment').update({
        documentId: existing.documentId,
        status: 'published',
        data: { likes: (existing.likes || 0) + 1 },
      });

      ctx.body = { likes: (updated as any).likes };
    } catch (error) {
      console.error('[CommunityComment like] error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server' };
    }
  },

  async testFind(ctx) {
    const comments = await strapi.documents('api::community-comment.community-comment').findMany({
      populate: ['post'],
      status: 'published'
    });
    ctx.body = comments;
  }
}));
