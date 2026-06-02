import React from 'react';

const ImportExcelPage = React.lazy(() =>
  import('./extensions/import-excel/index.jsx')
);

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
    // Registrar la ruta del componente
    app.injectContentManagerComponent('listView', 'actions', {
      name: 'import-excel-modal',
      Component: ImportExcelPage,
    });
  },
};
