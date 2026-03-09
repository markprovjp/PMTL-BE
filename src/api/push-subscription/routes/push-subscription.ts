/**
 * push-subscription routes (Strapi v5)
 *
 * Tất cả endpoints đều yêu cầu API Token:
 * - Không public → bảo vệ dữ liệu VAPID keys
 * - FE chỉ gọi server-side (Route Handler) với STRAPI_API_TOKEN
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/push-subscriptions/upsert',
      handler: 'push-subscription.upsert',
      config: { auth: false }, // Bảo vệ bằng STRAPI_API_TOKEN header ở FE
    },
    {
      method: 'DELETE',
      path: '/push-subscriptions/by-endpoint',
      handler: 'push-subscription.deleteByEndpoint',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/push-subscriptions',
      handler: 'push-subscription.find',
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/push-subscriptions/:documentId',
      handler: 'push-subscription.update',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/push-subscriptions/stats',
      handler: 'push-subscription.stats',
      config: { auth: false },
    },
  ],
};
