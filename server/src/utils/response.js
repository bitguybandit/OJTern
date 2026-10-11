/**
 * Standard API response helper
 * success -> { success: true, data: <payload> }
 * error   -> { success: false, error: { code, message, details? } }
 */

const success = (res, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

const error = (res, { code = 'BAD_REQUEST', message = 'An error occurred', details = null }, statusCode = 400) => {
  const payload = {
    code,
    message
  };
  if (details !== null && details !== undefined) {
    payload.details = details;
  }
  return res.status(statusCode).json({
    success: false,
    error: payload
  });
};

module.exports = {
  success,
  error
};
