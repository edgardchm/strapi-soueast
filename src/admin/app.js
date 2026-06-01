import React from 'react';

const ImportExcelPage = React.lazy(() =>
  import('./extensions/import-excel/pages/ImportExcelPage').then(module => ({
    default: module.ImportExcelPage
  }))
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
          Component: ImportExcelPage,
        },
      ],
    },
  },
  bootstrap: () => {},
};
