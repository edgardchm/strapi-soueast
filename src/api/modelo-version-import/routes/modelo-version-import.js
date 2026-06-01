'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/modelo-version-import/preview',
      handler: 'modelo-version-import.preview',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/modelo-version-import/confirm',
      handler: 'modelo-version-import.confirm',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
