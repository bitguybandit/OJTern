const multer = require('multer');
const { error } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('[SERVER ERROR]', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return error(res, {
        code: 'FILE_TOO_LARGE',
        message: 'The uploaded file exceeds the 10 MB size limit.'
      }, 400);
    }
    return error(res, {
      code: 'UPLOAD_ERROR',
      message: err.message
    }, 400);
  }

  if (err.code === 'INVALID_FILE_TYPE') {
    return error(res, {
      code: 'INVALID_FILE_TYPE',
      message: err.message
    }, 400);
  }

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const details = {};
    if (err.errors) {
      err.errors.forEach(e => {
        details[e.path] = e.message;
      });
    }
    return error(res, {
      code: 'VALIDATION_ERROR',
      message: err.message || 'Validation failed for one or more fields.',
      details
    }, 400);
  }

  const statusCode = err.status || err.statusCode || 500;
  return error(res, {
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected internal server error occurred.'
  }, statusCode);
};

module.exports = {
  errorHandler
};
