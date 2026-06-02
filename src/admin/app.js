import React from 'react';

console.log('🔧 Importar Excel: app.js loaded');

const ImportExcelPage = React.lazy(() => {
  console.log('🔧 Importar Excel: Loading ImportExcelPage component');
  return import('./extensions/import-excel/index.jsx');
});

export default {
  config: {
    tutorials: false,
    notifications: { releases: false },
  },

  bootstrap(app) {
    console.log('🔧 Importar Excel: bootstrap() called');

    try {
      console.log('🔧 Importar Excel: Calling app.addMenuLink()');
      app.addMenuLink({
        to: '/admin/import-excel',
        icon: 'upload',
        intlLabel: {
          id: 'import-excel.menu.label',
          defaultMessage: 'Importar Excel',
        },
        Component: ImportExcelPage, // ✅ Agregar el componente aquí
      });
      console.log('✅ Importar Excel: Menu link added successfully');
    } catch (error) {
      console.error('❌ Importar Excel: Error adding menu link:', error);
    }
  },
};
