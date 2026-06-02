import pluginId from './pluginId';
import Initializer from './components/Initializer';
import PluginIcon from './components/PluginIcon';
import { App } from './pages';

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'Importar Excel',
      },
    });

    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name: 'Importar Excel',
    });
  },

  bootstrap(app) {
    // Register the route for the plugin
    app.createHref(`/plugins/${pluginId}`, {
      title: 'Importar Excel',
      component: App,
    });
  },
};
