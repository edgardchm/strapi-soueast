import React from 'react';
import { lazy, Suspense } from 'react';

const ImportExcelPage = lazy(() => import('../../../../../../admin/extensions/import-excel/index.jsx'));

export default () => (
  <Suspense fallback={<div>Cargando...</div>}>
    <ImportExcelPage />
  </Suspense>
);
