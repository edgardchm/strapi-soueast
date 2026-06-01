'use strict';

module.exports = {
  async preview(ctx) {
    try {
      console.log('Preview: Iniciando...');
      const files = ctx.request.files;
      console.log('Preview: files =', files ? Object.keys(files) : 'undefined');

      if (!files || !files.file) {
        console.log('Preview: No file provided');
        return ctx.badRequest('No file provided');
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const filename = file.originalName || file.filename || 'unknown';
      console.log('Preview: filename =', filename);

      if (!filename.match(/\.(xlsx|xls)$/i)) {
        console.log('Preview: Invalid format');
        return ctx.badRequest('Invalid file format. Only .xlsx or .xls allowed.');
      }

      if (file.size > 5 * 1024 * 1024) {
        console.log('Preview: File too large');
        return ctx.badRequest('File too large. Maximum 5MB allowed.');
      }

      console.log('Preview: Reading file...');
      const fileBuffer = file.buffer || require('fs').readFileSync(file.path);
      console.log('Preview: fileBuffer size =', fileBuffer ? fileBuffer.length : 'undefined');

      console.log('Preview: Getting service...');
      const service = strapi.service('api::modelo-version-import.modelo-version-import');
      console.log('Preview: Service obtained, calling previewFile...');

      const result = await service.previewFile(fileBuffer);
      console.log('Preview: Result obtained, sending...');

      ctx.send(result);
    } catch (error) {
      console.error('Preview Error:', error.message, error.stack);
      ctx.internalServerError({
        ok: false,
        type: 'modelo-version-preview',
        error: error.message || 'Unknown error',
        details: error.stack,
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
