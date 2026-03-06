/**
 * blog-comment core router (Strapi v5)
 * CRUD chuẩn — chỉ dành cho Strapi Admin (RBAC kiểm soát truy cập).
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::blog-comment.blog-comment');
