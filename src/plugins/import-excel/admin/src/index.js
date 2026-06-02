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

    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'Importar Excel',
      },
      Component: async () => {
        const component = await import(
          /* webpackChunkName: "import-excel" */ './pages/App'
        );
        return component;
      },
      permissions: [],
    });
  },

  bootstrap(app) {},
};
