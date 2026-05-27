'use strict';

module.exports = {
  collectionName: 'import_logs',
  info: {
    singularName: 'import-log',
    pluralName: 'import-logs',
    displayName: 'Log de Importación',
  },
  options: {
    increments: true,
    timestamps: true,
    draftAndPublish: false,
  },
  pluginOptions: {},
  attributes: {},
};
