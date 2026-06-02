import ImportButton from './extensions/import-excel/ImportButton';

export default {
  config: {
    tutorials: false,
    notifications: { releases: false },
  },
  bootstrap(app) {
    // Inyectar el botón de importación en el Content Manager
    app.injectContentManagerComponent('listView', 'actions', {
      name: 'import-excel-button',
      Component: ImportButton,
    });
  },
};
