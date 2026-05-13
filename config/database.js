const path = require('path');

function pickFirstNonEmpty(...candidates) {
  for (const c of candidates) {
    if (c !== undefined && c !== null && String(c).trim() !== '') {
      return String(c).trim();
    }
  }
  return '';
}

function isLoopbackHost(host) {
  const h = (host || '').trim().toLowerCase();
  return h === '' || h === 'localhost' || h === '127.0.0.1' || h === '::1';
}

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

  const databaseUrl = pickFirstNonEmpty(
    env('DATABASE_URL'),
    process.env.DATABASE_URL,
    env('DATABASE_PRIVATE_URL'),
    process.env.DATABASE_PRIVATE_URL,
    env('DATABASE_PUBLIC_URL'),
    process.env.DATABASE_PUBLIC_URL
  );

  const configuredHost = pickFirstNonEmpty(env('DATABASE_HOST'), process.env.DATABASE_HOST);
  const pgHost = pickFirstNonEmpty(env('PGHOST'), process.env.PGHOST);
  const host = !isLoopbackHost(configuredHost) ? configuredHost : pgHost || 'localhost';

  if (
    client === 'postgres' &&
    !databaseUrl &&
    isLoopbackHost(host) &&
    (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID)
  ) {
    throw new Error(
      'Strapi Postgres: seguís apuntando a localhost en Railway. Borrá la variable DATABASE_HOST (si dice localhost), ' +
        'y agregá DATABASE_URL / DATABASE_PRIVATE_URL / DATABASE_PUBLIC_URL (Reference al Postgres), o referenciá PGHOST/PGUSER/PGPASSWORD/PGDATABASE.'
    );
  }

  const postgresConnection = databaseUrl
    ? {
        connectionString: databaseUrl,
        ...(sslOption ? { ssl: sslOption } : {}),
      }
    : {
        host,
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
