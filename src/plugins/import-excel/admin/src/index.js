import pluginId from './pluginId';
import Initializer from './components/Initializer';
import PluginIcon from './components/PluginIcon';
import { App } from './pages';

export default {
  register(app) {
    // Agregar el menú al sidebar
    const menuItem = {
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'Importar Excel',
      },
      Component: App,
    };

    // Usar el método correcto de Strapi para agregar el menú
    app.menu.push(menuItem);

    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name: 'Importar Excel',
    });
  },

  bootstrap() {},
};
