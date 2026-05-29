'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/modelo-import/preview',
      handler: 'modelo-import.preview',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/modelo-import/confirm-precio-desde',
      handler: 'modelo-import.confirmPrecioDesde',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
