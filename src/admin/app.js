import React from 'react';
import UploadIcon from './extensions/UploadIcon';

console.log('🔧 Importar Excel: app.js loaded');

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
        Component: async () => {
          // Función async que retorna el componente (patrón requerido por Strapi)
          const mod = await import(/* webpackChunkName: "import-excel-page" */ './extensions/import-excel/index.jsx');
          return mod.default;
        },
      });
      console.log('✅ Importar Excel: Menu link added successfully');
    } catch (error) {
      console.error('❌ Importar Excel: Error adding menu link:', error);
    }
  },
};
