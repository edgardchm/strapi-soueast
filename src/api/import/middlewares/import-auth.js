'use strict';

/**
 * Middleware de seguridad para endpoints de importación
 * Valida:
 * - Autenticación requerida (JWT)
 * - Solo administradores
 * - Validación de archivo (tipo y tamaño)
 */

module.exports = (options = {}) => {
  return async (ctx, next) => {
    const MAX_FILE_SIZE = parseInt(process.env.IMPORT_MAX_FILE_SIZE || 52428800); // 50MB

    // 1. Verificar autenticación
    if (!ctx.state.user) {
      return ctx.throw(401, 'Autenticación requerida para importar datos');
    }

    // 2. Verificar rol de administrador
    const isAdmin = ctx.state.user.role && (
      ctx.state.user.role.name === 'Super Admin' ||
      ctx.state.user.role.type === 'admin'
    );

    if (!isAdmin) {
      return ctx.throw(403, 'Solo administradores pueden importar datos');
    }

    // 3. Validación de archivo para POST /preview
    if (ctx.method === 'POST' && ctx.path === '/api/import/preview') {
      const file = ctx.request.files?.file;

      if (file) {
        // Validar tipo
        const ALLOWED_TYPES = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv',
          'application/json'
        ];

        if (!ALLOWED_TYPES.includes(file.mimetype)) {
          return ctx.throw(400, 'Solo .xlsx, .csv o .json permitidos');
        }

        // Validar tamaño
        if (file.size > MAX_FILE_SIZE) {
          const maxMB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(2);
          const fileMB = (file.size / 1024 / 1024).toFixed(2);
          return ctx.throw(400, `Archivo muy grande. Max: ${maxMB}MB, Actual: ${fileMB}MB`);
        }
      }
    }

    // 4. Agregar info de usuario
    ctx.state.importUser = {
      id: ctx.state.user.id,
      username: ctx.state.user.username,
      email: ctx.state.user.email
    };

    await next();
  };
};
