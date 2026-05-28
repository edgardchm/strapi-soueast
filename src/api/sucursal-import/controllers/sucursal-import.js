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
        .service('api::sucursal-import.sucursal-import')
        .preview(file);

      // 5. Retornar preview JSON
      ctx.body = {
        ok: true,
        type: 'sucursal-preview',
        summary: preview.summary,
        rows: preview.rows,
        errors: preview.errors,
      };
    } catch (error) {
      strapi.log.error('Error en preview:', error);
      ctx.throw(400, error.message);
    }
  },

  async confirm(ctx) {
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

      // 4. Llamar al service para UPSERT
      const result = await strapi
        .service('api::sucursal-import.sucursal-import')
        .confirm(file);

      // 5. Retornar reporte de UPSERT
      ctx.body = {
        ok: true,
        type: 'sucursal-confirm',
        summary: result.summary,
        created: result.created,
        updated: result.updated,
        skipped: result.skipped,
        errors: result.errors,
      };
    } catch (error) {
      strapi.log.error('Error en confirm:', error);
      ctx.throw(400, error.message);
    }
  },
};
