import pluginId from './pluginId';
import Initializer from './components/Initializer';
import PluginIcon from './components/PluginIcon';

export default {
  register(app) {
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name: 'Importar Excel',
    });
  },

  bootstrap(app) {
    // Agregar menú al sidebar
    app.addMenuLink({
      to: '/plugins/import-excel',
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.menu.label`,
        defaultMessage: 'Importar Excel',
      },
    });
  },
};
