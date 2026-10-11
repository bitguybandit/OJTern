const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');
const { sequelize } = require('../models');

async function runMigrations() {
  console.log('--- Starting Database Migration ---');

  // 1. Ensure database exists
  try {
    const connection = await mysql.createConnection({
      host: env.DB.HOST,
      port: env.DB.PORT,
      user: env.DB.USER,
      password: env.DB.PASSWORD
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.DB.NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.end();
    console.log(`✓ Database '${env.DB.NAME}' confirmed/created.`);
  } catch (err) {
    console.error('✗ Error ensuring database exists:', err.message);
    process.exit(1);
  }

  // 2. Connect via Sequelize
  await sequelize.authenticate();
  const queryInterface = sequelize.getQueryInterface();

  // 3. Ensure SequelizeMeta table exists
  await queryInterface.createTable('SequelizeMeta', {
    name: {
      type: sequelize.Sequelize.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true
    }
  }).catch(() => {});

  const [executedRows] = await sequelize.query('SELECT name FROM SequelizeMeta');
  const executedNames = new Set(executedRows.map(r => r.name));

  // 4. Read migration files
  const migrationsDir = path.resolve(__dirname, '..', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.js'))
    .sort();

  for (const file of files) {
    if (!executedNames.has(file)) {
      console.log(`Applying migration: ${file}...`);
      const migration = require(path.join(migrationsDir, file));
      try {
        await migration.up(queryInterface, sequelize.Sequelize);
        await sequelize.query('INSERT INTO SequelizeMeta (name) VALUES (?)', {
          replacements: [file]
        });
        console.log(`✓ Successfully applied: ${file}`);
      } catch (migrationErr) {
        console.error(`✗ Failed migration ${file}:`, migrationErr.message);
        throw migrationErr;
      }
    } else {
      console.log(`- Already executed: ${file}`);
    }
  }

  console.log('✓ All database migrations applied successfully.');
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = runMigrations;
