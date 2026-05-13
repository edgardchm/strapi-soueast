'use strict';

/**
 * Evita que navegadores/CDN sirvan JSON de la API desde caché tras cambios en Strapi.
 */
module.exports = (_config, _options) => {
  return async (ctx, next) => {
    await next();
    if (ctx.method === 'GET' && ctx.path.startsWith('/api/')) {
      ctx.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      ctx.set('Pragma', 'no-cache');
      ctx.set('Expires', '0');
    }
  };
};
