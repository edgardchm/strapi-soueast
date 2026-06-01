'use strict';

module.exports = {
  async preview(ctx) {
    try {
      const files = ctx.request.files;

      if (!files || !files.file) {
        return ctx.badRequest('No file provided');
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const filename = file.originalName || file.filename;

      if (!filename.match(/\.(xlsx|xls)$/i)) {
        return ctx.badRequest('Invalid file format. Only .xlsx or .xls allowed.');
      }

      if (file.size > 5 * 1024 * 1024) {
        return ctx.badRequest('File too large. Maximum 5MB allowed.');
      }

      const fileBuffer = file.buffer || require('fs').readFileSync(file.path);
      const service = strapi.service('api::modelo-version-import.modelo-version-import');
      const result = await service.previewFile(fileBuffer);

      ctx.send(result);
    } catch (error) {
      ctx.internalServerError({
        ok: false,
        type: 'modelo-version-preview',
        error: error.message,
      });
    }
  },

  async confirm(ctx) {
    try {
      const files = ctx.request.files;

      if (!files || !files.file) {
        return ctx.badRequest('No file provided');
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const filename = file.originalName || file.filename;

      if (!filename.match(/\.(xlsx|xls)$/i)) {
        return ctx.badRequest('Invalid file format. Only .xlsx or .xls allowed.');
      }

      if (file.size > 5 * 1024 * 1024) {
        return ctx.badRequest('File too large. Maximum 5MB allowed.');
      }

      const importToken = ctx.request.headers['x-import-token'];
      const fileBuffer = file.buffer || require('fs').readFileSync(file.path);

      const service = strapi.service(
        'api::modelo-version-import.modelo-version-import'
      );
      const result = await service.confirmFile(fileBuffer, importToken);

      if (result.statusCode === 403) {
        return ctx.forbidden(result.error);
      }

      if (!result.ok) {
        return ctx.internalServerError(result);
      }

      ctx.send(result);
    } catch (error) {
      ctx.internalServerError({
        ok: false,
        type: 'modelo-version-confirm',
        error: error.message,
      });
    }
  },
};
