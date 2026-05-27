'use strict';

module.exports = {
  /**
   * POST /api/import/preview
   * Recibe archivo, valida estructura y retorna preview sin guardar
   */
  async preview(ctx) {
    try {
      // Validar que venga archivo
      const file = ctx.request.files?.file;
      if (!file) {
        return ctx.throw(400, 'Se requiere un archivo para importar');
      }

      // Log de auditoría
      strapi.log.info(`[IMPORT] Preview iniciado por ${ctx.state.importUser.username}`);

      // Response base (será completado en Fase 5)
      ctx.body = {
        importId: require('uuid').v4(),
        status: 'preview',
        message: 'Endpoint preview en desarrollo',
        filename: file.name,
        size: file.size,
        user: ctx.state.importUser.username,
        timestamp: new Date().toISOString()
      };
      ctx.status = 200;
    } catch (err) {
      strapi.log.error(`[IMPORT] Error en preview: ${err.message}`);
      ctx.throw(400, err.message);
    }
  },

  /**
   * POST /api/import/confirm/:importId
   * Confirma y ejecuta importación definitiva
   */
  async confirm(ctx) {
    try {
      const { importId } = ctx.params;

      if (!importId) {
        return ctx.throw(400, 'importId es requerido');
      }

      strapi.log.info(`[IMPORT] Confirm de ${importId} por ${ctx.state.importUser.username}`);

      ctx.body = {
        importId,
        status: 'pending',
        message: 'Endpoint confirm en desarrollo',
        user: ctx.state.importUser.username,
        timestamp: new Date().toISOString()
      };
      ctx.status = 200;
    } catch (err) {
      strapi.log.error(`[IMPORT] Error en confirm: ${err.message}`);
      ctx.throw(400, err.message);
    }
  },

  /**
   * GET /api/import/status/:importId
   */
  async status(ctx) {
    try {
      const { importId } = ctx.params;

      if (!importId) {
        return ctx.throw(400, 'importId es requerido');
      }

      ctx.body = {
        importId,
        status: 'pending',
        message: 'Endpoint status en desarrollo'
      };
      ctx.status = 200;
    } catch (err) {
      ctx.throw(400, err.message);
    }
  },

  /**
   * GET /api/import/logs
   */
  async logs(ctx) {
    try {
      strapi.log.info(`[IMPORT] Logs solicitados por ${ctx.state.importUser.username}`);

      ctx.body = {
        status: 'pending',
        message: 'Endpoint logs en desarrollo',
        user: ctx.state.importUser.username
      };
      ctx.status = 200;
    } catch (err) {
      ctx.throw(400, err.message);
    }
  }
};
