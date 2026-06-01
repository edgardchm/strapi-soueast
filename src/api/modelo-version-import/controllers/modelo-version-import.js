'use strict';

const fs = require('fs');

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
      console.log('Preview: file keys =', Object.keys(file));
      const filename = file.name || file.originalName || file.filename || 'unknown';
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
      if (!file || !file.path) {
        console.log('Preview: Archivo inválido - no se encontró ruta temporal');
        return ctx.badRequest('Archivo inválido: no se encontró ruta temporal del archivo');
      }
      const fileBuffer = fs.readFileSync(file.path);
      console.log('Preview: fileBuffer size =', fileBuffer ? fileBuffer.length : 'undefined');
      console.log('Preview: fileBuffer type =', typeof fileBuffer);
      console.log('Preview: fileBuffer is Buffer =', Buffer.isBuffer(fileBuffer));
      console.log('Preview: first 20 bytes =', fileBuffer.slice(0, 20).toString('hex'));

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
      const filename = file.name || file.originalName || file.filename || 'unknown';

      if (!filename.match(/\.(xlsx|xls)$/i)) {
        return ctx.badRequest('Invalid file format. Only .xlsx or .xls allowed.');
      }

      if (file.size > 5 * 1024 * 1024) {
        return ctx.badRequest('File too large. Maximum 5MB allowed.');
      }

      const importToken = ctx.request.headers['x-import-token'];
      if (!file || !file.path) {
        return ctx.badRequest('Archivo inválido: no se encontró ruta temporal del archivo');
      }
      const fileBuffer = fs.readFileSync(file.path);
      console.log('Confirm: fileBuffer size =', fileBuffer ? fileBuffer.length : 'undefined');
      console.log('Confirm: fileBuffer type =', typeof fileBuffer);
      console.log('Confirm: fileBuffer is Buffer =', Buffer.isBuffer(fileBuffer));

      const service = strapi.service(
        'api::modelo-version-import.modelo-version-import'
      );
      console.log('Confirm: Llamando a confirmFile...');
      const result = await service.confirmFile(fileBuffer, importToken);
      console.log('Confirm: Result =', JSON.stringify(result).substring(0, 200));

      if (result.statusCode === 403) {
        console.log('Confirm: Rechazando con 403');
        return ctx.forbidden(result.error);
      }

      if (!result.ok) {
        console.log('Confirm: Error en resultado', result);
        return ctx.internalServerError(result);
      }

      console.log('Confirm: Éxito, enviando resultado');
      ctx.send(result);
    } catch (error) {
      console.error('Confirm Error:', error.message, error.stack);
      ctx.internalServerError({
        ok: false,
        type: 'modelo-version-confirm',
        error: error.message,
        details: error.stack,
      });
    }
  },
};
