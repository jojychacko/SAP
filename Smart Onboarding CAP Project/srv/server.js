const cds = require('@sap/cds');
module.exports = cds.server;

const proxy = require('./chatgpt-proxy');

cds.on('bootstrap', async app => {
  await proxy(app); // Register your custom /chatgpt Express route
});
