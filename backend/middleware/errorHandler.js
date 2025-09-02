const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || 'An unknown error occurred';

  let errorResponse = {
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack, 
  };

  if (err.status) {
    res.status(err.status);
    errorResponse.message = err.message;
  } else {
    res.status(statusCode);
  }

  res.json(errorResponse);
};

module.exports = { errorHandler };