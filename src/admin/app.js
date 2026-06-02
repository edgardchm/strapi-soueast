import React, { useState, useEffect } from 'react';

console.log('🔧 Importar Excel: app.js loaded');

// Wrapper que carga dinámicamente el componente (sin React.lazy)
function ImportExcelWrapper() {
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        const mod = await import('./extensions/import-excel/index.jsx');
        setComponent(() => mod.default);
      } catch (error) {
        console.error('❌ Error loading ImportExcelPage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, []);

  if (loading) {
    return React.createElement('div', null, 'Cargando...');
  }

  if (!Component) {
    return React.createElement('div', null, 'Error al cargar el componente');
  }

  return React.createElement(Component);
}

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
