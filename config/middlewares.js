module.exports = ({ env }) => {
  const extraOrigins = String(env('FRONTEND_ORIGINS', ''))
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  /** Railway/Netlify suelen usar FRONTEND_URL; antes solo leíamos FRONTEND_ORIGINS. */
  const urlOrigins = String(env('FRONTEND_URL', ''))
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      try {
        return new URL(entry).origin;
      } catch {
        return '';
      }
    })
    .filter(Boolean);

  const staticAllow = new Set([
    'http://localhost:1337',
    'http://127.0.0.1:1337',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...extraOrigins,
    ...urlOrigins,
  ]);

  /**
   * CORS: localhost + FRONTEND_ORIGINS + FRONTEND_URL + *.netlify.app + *.up.railway.app
   */
  function corsOrigin(ctx) {
    const requestOrigin = ctx.request.get('Origin');
    // No devolver `true`: @koa/cors terminaría enviando ACAO inválido ("true").
    if (!requestOrigin) return '';
    if (staticAllow.has(requestOrigin)) return requestOrigin;
    try {
      const u = new URL(requestOrigin);
      if (u.protocol === 'https:' && u.hostname.endsWith('.netlify.app')) {
        return requestOrigin;
      }
      if (u.protocol === 'https:' && u.hostname.endsWith('.up.railway.app')) {
        return requestOrigin;
      }
    } catch (_) {
      /* ignore */
    }
    // Strapi 4.25 cors wrapper hace .split() sobre el retorno; `false` rompe el admin.
    return '';
  }

  return [
    'strapi::logger',
    'strapi::errors',
    'strapi::security',
    {
      name: 'strapi::cors',
      config: {
        origin: corsOrigin,
        // Sin `headers`: Strapi usa el default (@koa/cors) y refleja Access-Control-Request-Headers en el preflight.
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        keepHeaderOnError: true,
      },
    },
    'global::api-no-store',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};
