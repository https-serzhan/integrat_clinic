const { app, startServer } = require('./src/backend/academy/server');

if (require.main === module) {
  startServer();
}

module.exports = app;
