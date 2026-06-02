import React, { Suspense } from 'react';
import ImportExcelPage from './extensions/import-excel/index.jsx';

console.log('🔧 Importar Excel: app.js loaded');

// Wrapper con React.memo para que Strapi lo reconozca como componente válido
const ImportExcelWrapper = React.memo(() => (
  <Suspense fallback={<div>Cargando...</div>}>
    <ImportExcelPage />
  </Suspense>
));

ImportExcelWrapper.displayName = 'ImportExcelWrapper';

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
        Component: ImportExcelWrapper, // ✅ Componente wrapper directo
      });
      console.log('✅ Importar Excel: Menu link added successfully');
    } catch (error) {
      console.error('❌ Importar Excel: Error adding menu link:', error);
    }
  },
};
