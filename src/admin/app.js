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
    console.log('🔧 Available app methods:', Object.keys(app));

    try {
      // Intentar agregar el menú usando app.addMenuLink()
      if (app.addMenuLink) {
        console.log('🔧 Importar Excel: Calling app.addMenuLink()');
        app.addMenuLink({
          to: '/admin/import-excel',
          icon: 'upload',
          intlLabel: {
            id: 'import-excel.menu.label',
            defaultMessage: 'Importar Excel',
          },
        });
        console.log('✅ Importar Excel: Menu link added successfully');
      } else {
        console.error('❌ Importar Excel: app.addMenuLink() is not available');
      }
    } catch (error) {
      console.error('❌ Importar Excel: Error adding menu link:', error);
    }
  },
};
