'use strict';

module.exports = {
  async preview(ctx) {
    try {
      // 1. Validar que venga archivo
      if (!ctx.request.files || !ctx.request.files.file) {
        return ctx.badRequest('Se requiere un archivo Excel');
      }

      const file = ctx.request.files.file;

      // 2. Validar extensión
      const validExtensions = ['.xlsx', '.xls'];
      const filename = file.name.toLowerCase();
      const hasValidExt = validExtensions.some(ext => filename.endsWith(ext));

      if (!hasValidExt) {
        return ctx.badRequest('Solo se aceptan archivos .xlsx o .xls');
      }

      // 3. Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        return ctx.badRequest(
          `El archivo no puede superar 5MB (actual: ${sizeMB}MB)`
        );
      }

      // 4. Llamar al service
      const preview = await strapi
        .service('api::modelo-import.modelo-import')
        .preview(file);

      // 5. Retornar preview JSON
      ctx.body = {
        ok: true,
        type: 'modelo-precios-preview',
        summary: preview.summary,
        detectedHeaderRow: preview.detectedHeaderRow,
        detectedHeaders: preview.detectedHeaders,
        fieldMapping: preview.fieldMapping,
        rows: preview.rows,
        errors: preview.errors,
        errorSummary: preview.errorSummary,
      };
    } catch (error) {
      strapi.log.error('Error en preview modelo-import:', error);
      ctx.throw(400, error.message);
    }
  },

  async confirmPrecioDesde(ctx) {
    try {
      // 0. Validar token secreto para proteger confirm
      const importToken = ctx.request.headers['x-import-token'];
      const expectedToken = process.env.IMPORT_SECRET_TOKEN;

      if (!expectedToken) {
        return ctx.internalServerError('IMPORT_SECRET_TOKEN no configurado en el servidor');
      }

      if (!importToken || importToken !== expectedToken) {
        return ctx.forbidden('No autorizado para confirmar importación. Token inválido o ausente.');
      }

      // 1. Validar que venga archivo
      if (!ctx.request.files || !ctx.request.files.file) {
        return ctx.badRequest('Se requiere un archivo Excel');
      }

      const file = ctx.request.files.file;

      // 2. Validar extensión
      const validExtensions = ['.xlsx', '.xls'];
      const filename = file.name.toLowerCase();
      const hasValidExt = validExtensions.some(ext => filename.endsWith(ext));

      if (!hasValidExt) {
        return ctx.badRequest('Solo se aceptan archivos .xlsx o .xls');
      }

      // 3. Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        return ctx.badRequest(
          `El archivo no puede superar 5MB (actual: ${sizeMB}MB)`
        );
      }

      // 4. Llamar al service
      const result = await strapi
        .service('api::modelo-import.modelo-import')
        .confirmPrecioDesde(file);

      // 5. Retornar resultado
      ctx.body = {
        ok: true,
        type: 'modelo-confirm-precio-desde',
        summary: result.summary,
        updated: result.updated,
        skipped: result.skipped,
        errors: result.errors,
      };
    } catch (error) {
      strapi.log.error('Error en confirmPrecioDesde modelo-import:', error);
      ctx.throw(400, error.message);
    }
  },
};
