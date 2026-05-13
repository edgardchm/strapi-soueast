const path = require('path');

module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  const pool = {
    min: env.int('DATABASE_POOL_MIN', 2),
    max: env.int('DATABASE_POOL_MAX', 10),
  };

  const sslEnabled = env.bool('DATABASE_SSL', false);
  const sslOption = sslEnabled
    ? { rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false) }
    : undefined;

  /** Railway/Heroku: use DATABASE_URL alone so host/port from URL are not overridden by localhost defaults. */
  const postgresConnection = env('DATABASE_URL')
    ? {
        connectionString: env('DATABASE_URL'),
        ...(sslOption ? { ssl: sslOption } : {}),
      }
    : {
        host: env('DATABASE_HOST', env('PGHOST', 'localhost')),
        port: env.int('DATABASE_PORT', env.int('PGPORT', 5432)),
        database: env('DATABASE_NAME', env('PGDATABASE', 'strapi')),
        user: env('DATABASE_USERNAME', env('PGUSER', 'strapi')),
        password: env('DATABASE_PASSWORD', env('PGPASSWORD', 'strapi')),
        ...(sslOption ? { ssl: sslOption } : {}),
        schema: env('DATABASE_SCHEMA', 'public'),
      };

  const connections = {
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
    postgres: {
      connection: postgresConnection,
      pool,
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
