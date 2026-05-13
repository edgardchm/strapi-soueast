module.exports = ({ env }) => {
  const extraOrigins = String(env('FRONTEND_ORIGINS', ''))
    .split(',')
    .map((s) => s.trim())
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
  ]);

  /**
   * CORS dinámico: localhost + FRONTEND_ORIGINS + cualquier https://*.netlify.app
   * (previews y sitios como nimble-gaufre-3f7ca9.netlify.app sin redeploy por URL).
   */
  function corsOrigin(ctx) {
    const requestOrigin = ctx.request.get('Origin');
    if (!requestOrigin) return true;
    if (staticAllow.has(requestOrigin)) return requestOrigin;
    try {
      const u = new URL(requestOrigin);
      if (u.protocol === 'https:' && u.hostname.endsWith('.netlify.app')) {
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
        // Incluir los mismos headers que usa fetch() en shared/services/strapiService.js
        // (Cache-Control / Pragma no son “simple”; sin esto el preflight falla en el navegador).
        headers: [
          'Content-Type',
          'Authorization',
          'Origin',
          'Accept',
          'Cache-Control',
          'Pragma',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
        keepHeaderOnError: true,
      },
    },
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};
