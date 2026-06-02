import React from 'react';

console.log('🔧 Importar Excel: app.js loaded');

const ImportExcelPage = React.lazy(() => {
  console.log('🔧 Importar Excel: Loading ImportExcelPage component');
  return import('./extensions/import-excel/index.jsx');
});

export default {
  config: {
    menu: {
      links: [
        {
          to: '/admin/import-excel',
          icon: 'upload',
          intlLabel: {
            id: 'import-excel.menu.label',
            defaultMessage: 'Importar Excel',
          },
        },
      ],
    },
  },

  bootstrap(app) {
    console.log('🔧 Importar Excel: bootstrap() called');
  },
};
