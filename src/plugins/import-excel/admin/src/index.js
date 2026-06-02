import pluginId from './pluginId';
import Initializer from './components/Initializer';
import PluginIcon from './components/PluginIcon';

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'Importar Excel',
      },
      Component: async () => {
        const { default: ImportExcelPage } = await import('../../../../../../admin/extensions/import-excel/index.jsx');
        return ImportExcelPage;
      },
    });

    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name: 'Importar Excel',
    });
  },

  bootstrap(app) {},

  async registerTrads(app) {},
};
