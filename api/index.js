const { app, startServer, ensureData } = require('../src/backend/academy/server');

ensureData();

if (require.main === module) {
  startServer();
}

module.exports = app;
