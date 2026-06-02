import pluginId from './pluginId';
import Initializer from './components/Initializer';

export default {
  register(app) {
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name: 'Importar Excel',
    });

    // Intentar agregar el menú con configuración mínima
    try {
      app.addMenuLink({
        to: `/plugins/${pluginId}`,
        icon: 'upload', // Usar string en lugar de componente
        intlLabel: {
          id: `${pluginId}.plugin.name`,
          defaultMessage: 'Importar Excel',
        },
        Component: async () => {
          const component = await import('./pages/App');
          return component;
        },
        permissions: [],
      });
    } catch (error) {
      console.error('Error registering menu link:', error);
    }
  },

  bootstrap(app) {},
};
