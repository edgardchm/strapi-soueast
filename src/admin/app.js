import React from 'react';
import UploadIcon from './extensions/UploadIcon';
import ImportExcelPage from './extensions/import-excel/index.jsx';

console.log('🔧 Importar Excel: app.js loaded');

// Wrapper simple con React.memo para que Strapi lo reconozca
const ImportExcelWrapper = React.memo(() => {
  console.log('🔧 Importar Excel: ImportExcelWrapper rendering');
  return React.createElement(ImportExcelPage);
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
        icon: UploadIcon,
        intlLabel: {
          id: 'import-excel.menu.label',
          defaultMessage: 'Importar Excel',
        },
        Component: ImportExcelWrapper, // ✅ Componente wrapper directo
      });
      console.log('✅ Importar Excel: Menu link added successfully');
    } catch (error) {
      console.error('❌ Importar Excel: Error adding menu link:', error);
    }
  },
};
