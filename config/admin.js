module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'someSecret'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'someSalt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'someSalt'),
    },
  },
});
