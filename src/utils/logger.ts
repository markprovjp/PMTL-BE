/**
 * Lightweight logger wrapper backed by strapi.log.
 * Usage: const log = createLogger(strapi, 'my-controller');
 */
export function createLogger(strapi: any, prefix: string) {
  const serialize = (value: any) => {
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }

    return value;
  };

  const format = (msg: string, data?: any) => {
    return data ? `[${prefix}] ${msg} ${JSON.stringify(serialize(data))}` : `[${prefix}] ${msg}`;
  };
  return {
    info: (msg: string, data?: any) => strapi.log.info(format(msg, data)),
    warn: (msg: string, data?: any) => strapi.log.warn(format(msg, data)),
    error: (msg: string, data?: any) => strapi.log.error(format(msg, data)),
  };
}
