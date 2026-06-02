'use strict';

module.exports = {
  async getPage(ctx) {
    ctx.body = {
      message: 'Import Excel Page - Use the admin panel instead',
    };
  },
};
