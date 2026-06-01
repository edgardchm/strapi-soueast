'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/modelo-version-import/preview',
      handler: 'modelo-version-import.preview',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/modelo-version-import/confirm',
      handler: 'modelo-version-import.confirm',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
