'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/sucursal-import/preview',
      handler: 'sucursal-import.preview',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/sucursal-import/confirm',
      handler: 'sucursal-import.confirm',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
