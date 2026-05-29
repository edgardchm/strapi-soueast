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
  ],
};
