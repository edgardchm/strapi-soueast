'use strict';

module.exports = {
  collectionName: 'modelo_versions',
  info: {
    singularName: 'modelo-version',
    pluralName: 'modelo-versions',
    displayName: 'Versión de Modelo',
  },
  options: {
    increments: true,
    timestamps: true,
    draftAndPublish: true,
  },
  pluginOptions: {},
  attributes: {},
};
