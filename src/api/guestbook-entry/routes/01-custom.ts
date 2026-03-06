/**
 * 01-custom.ts — Guestbook-entry custom routes (Strapi v5)
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/guestbook-entries/submit',
      handler: 'guestbook-entry.submit',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'GET',
      path: '/guestbook-entries/list',
      handler: 'guestbook-entry.list',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'GET',
      path: '/guestbook-entries/archive/:year/:month',
      handler: 'guestbook-entry.archive',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
