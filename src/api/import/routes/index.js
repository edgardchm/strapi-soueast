'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/import/preview',
      handler: 'api::import.import.preview',
      config: {
        auth: true,
        policies: ['api::import.import-auth'],
        description: 'Carga y valida archivo para importación, retorna preview sin guardar',
        tag: 'import',
        middlewares: ['api::import.import-auth']
      }
    },
    {
      method: 'POST',
      path: '/import/confirm/:importId',
      handler: 'api::import.import.confirm',
      config: {
        auth: true,
        policies: ['api::import.import-auth'],
        description: 'Confirma y ejecuta importación definitiva',
        tag: 'import',
        middlewares: ['api::import.import-auth']
      }
    },
    {
      method: 'GET',
      path: '/import/status/:importId',
      handler: 'api::import.import.status',
      config: {
        auth: true,
        policies: ['api::import.import-auth'],
        description: 'Obtiene estado de una importación',
        tag: 'import',
        middlewares: ['api::import.import-auth']
      }
    },
    {
      method: 'GET',
      path: '/import/logs',
      handler: 'api::import.import.logs',
      config: {
        auth: true,
        policies: ['api::import.import-auth'],
        description: 'Lista logs de importaciones para auditoría',
        tag: 'import',
        middlewares: ['api::import.import-auth']
      }
    }
  ]
};
