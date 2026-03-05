/**
 * Lightweight logger wrapper backed by strapi.log.
 * Usage: const log = createLogger(strapi, 'my-controller');
 */
export function createLogger(strapi: any, prefix: string) {
  return {
    info:  (msg: string) => strapi.log.info(`[${prefix}] ${msg}`),
    warn:  (msg: string) => strapi.log.warn(`[${prefix}] ${msg}`),
    error: (msg: string, err?: unknown) => strapi.log.error(`[${prefix}] ${msg}`, err),
  };
}
