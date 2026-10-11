const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB: {
    HOST: process.env.DB_HOST || '127.0.0.1',
    PORT: parseInt(process.env.DB_PORT || '3306', 10),
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    NAME: process.env.DB_NAME || 'ojterm'
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'super_secret_ojterm_jwt_key_dutertech_2026',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
  },
  SMTP: {
    HOST: process.env.SMTP_HOST || 'smtp.ethereal.email',
    PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    USER: process.env.SMTP_USER || '',
    PASS: process.env.SMTP_PASS || '',
    FROM: process.env.SMTP_FROM || 'OJTerm System <noreply@ojterm.local>'
  },
  UPLOAD_DIR: path.resolve(__dirname, '..', '..', 'uploads')
};
