'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/sucursal-import/preview',
      handler: 'sucursal-import.preview',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/sucursal-import/confirm',
      handler: 'sucursal-import.confirm',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
