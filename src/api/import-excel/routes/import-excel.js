module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/import-excel/page',
      handler: 'import-excel.getPage',
      config: {
        auth: false,
      },
    },
  ],
};
