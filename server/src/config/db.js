const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.DB.NAME, env.DB.USER, env.DB.PASSWORD, {
  host: env.DB.HOST,
  port: env.DB.PORT,
  dialect: 'mysql',
  logging: env.NODE_ENV === 'development' ? false : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    freezeTableName: true
  }
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('✗ Unable to connect to MySQL database:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  Sequelize,
  testConnection
};
