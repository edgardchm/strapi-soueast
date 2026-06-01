'use strict';

module.exports = {
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
