const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const routes = require('./routes');
const { errorHandler } = require('./middleware/error');
const { error } = require('./utils/response');

const app = express();

// Global middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// 404 Handler for undefined routes
app.use((req, res) => {
  return error(res, {
    code: 'ROUTE_NOT_FOUND',
    message: `Cannot ${req.method} ${req.originalUrl}`
  }, 404);
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
