import { Suspense, lazy } from 'react';

const ImportExcelPage = lazy(() => import('../../../../../../admin/extensions/import-excel/index.jsx'));

const Plugin = {
  register(app) {
    console.log('🔧 import-excel-admin: Registering plugin');

    app.registerPlugin({
      id: 'import-excel-admin',
      initializer: Initializer,
      isReady: false,
      name: 'import-excel-admin',
    });
  },

  bootstrap(app) {
    console.log('🔧 import-excel-admin: Bootstrap called');
  },
};

const Initializer = () => {
  console.log('🔧 import-excel-admin: Initializer rendering');
  return null;
};

export default Plugin;
