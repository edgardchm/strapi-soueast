const path = require('path');

module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');
  // Railway Postgres: preferí referenciar DATABASE_URL del servicio (conexión interna).
  // Si solo definiste DATABASE_PUBLIC_URL en el panel, también funciona como fallback.
  const postgresUrl =
    env('DATABASE_URL') || env('DATABASE_PUBLIC_URL') || env('POSTGRES_URL') || '';

  const connections = {
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
    postgres: {
      connection: postgresUrl
        ? {
            connectionString: postgresUrl,
            // Sin esto, `pg` suele respetar sslmode de la URL. Si falla el cert del host, definí DATABASE_SSL=true.
            ...(env.bool('DATABASE_SSL', false)
              ? {
                  ssl: {
                    rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
                  },
                }
              : {}),
          }
        : {
            host: env('DATABASE_HOST', 'localhost'),
            port: env.int('DATABASE_PORT', 5432),
            database: env('DATABASE_NAME', 'strapi'),
            user: env('DATABASE_USERNAME', 'strapi'),
            password: env('DATABASE_PASSWORD', 'strapi'),
            ssl: env.bool('DATABASE_SSL', false)
              ? { rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false) }
              : false,
            schema: env('DATABASE_SCHEMA', 'public'),
          },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
  };

  if (
    client === 'postgres' &&
    !postgresUrl &&
    ['localhost', '127.0.0.1', '::1'].includes(env('DATABASE_HOST', 'localhost'))
  ) {
    throw new Error(
      'Postgres: falta DATABASE_URL (recomendado en Railway: referencia ${{TuPostgres.DATABASE_URL}}) o DATABASE_PUBLIC_URL / POSTGRES_URL. Dentro del contenedor localhost:5432 no es tu base.'
    );
  }

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
