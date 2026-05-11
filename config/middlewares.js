const localOrigins = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

module.exports = ({ env }) => {
  const frontendUrl = (env('FRONTEND_URL') || '').trim();
  const fromEnv = (env('CORS_ORIGIN') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const origin = [
    ...new Set([
      ...localOrigins,
      'https://nimble-gaufre-3f7ca9.netlify.app',
      ...(frontendUrl ? [frontendUrl] : []),
      ...fromEnv,
    ]),
  ];

  return [
    'strapi::logger',
    'strapi::errors',
    'strapi::security',
    {
      name: 'strapi::cors',
      config: {
        origin,
        // Lista corta rompe el preflight: Chrome manda Cache-Control, Pragma, Sec-Fetch-*, etc.
        // [] → @koa/cors reutiliza Access-Control-Request-Headers del navegador.
        headers: [],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
        keepHeadersOnError: true,
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
