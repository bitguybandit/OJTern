const app = require('./app');
const env = require('./config/env');
const { testConnection } = require('./config/db');

const startServer = async () => {
  const dbOk = await testConnection();
  if (!dbOk) {
    console.warn('⚠️ Warning: Database connection failed at startup. Retrying on query.');
  }

  app.listen(env.PORT, () => {
    console.log(`====================================================`);
    console.log(`  OJTerm Backend Server running on port ${env.PORT}`);
    console.log(`  Environment: ${env.NODE_ENV}`);
    console.log(`  API Base URL: http://localhost:${env.PORT}/api`);
    console.log(`====================================================`);
  });
};

startServer();
