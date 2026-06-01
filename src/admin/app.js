import React from 'react';

export default {
  config: {
    menu: {
      links: [
        {
          to: '/plugins/import-excel',
          icon: 'upload',
          intlLabel: {
            id: 'import-excel.menu.label',
            defaultMessage: 'Importar Excel',
          },
          Component: async () => {
            const { ImportExcelPage } = await import('./extensions/import-excel/pages/ImportExcelPage');
            return ImportExcelPage;
          },
        },
      ],
    },
  },
  bootstrap: () => {},
};
