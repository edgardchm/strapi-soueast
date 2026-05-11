const path = require('path');

module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  const connections = {
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
    postgres: {
      connection: env('DATABASE_URL')
        ? {
            connectionString: env('DATABASE_URL'),
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

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
