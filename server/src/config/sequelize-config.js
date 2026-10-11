const env = require('./env');

module.exports = {
  development: {
    username: env.DB.USER,
    password: env.DB.PASSWORD,
    database: env.DB.NAME,
    host: env.DB.HOST,
    port: env.DB.PORT,
    dialect: 'mysql',
    logging: false
  },
  test: {
    username: env.DB.USER,
    password: env.DB.PASSWORD,
    database: env.DB.NAME + '_test',
    host: env.DB.HOST,
    port: env.DB.PORT,
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: env.DB.USER,
    password: env.DB.PASSWORD,
    database: env.DB.NAME,
    host: env.DB.HOST,
    port: env.DB.PORT,
    dialect: 'mysql',
    logging: false
  }
};
