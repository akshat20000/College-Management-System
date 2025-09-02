// Base error class
class ErrorHandler extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
class UnauthorizedError extends ErrorHandler {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

class ForbiddenError extends ErrorHandler {
  constructor(message = 'Forbidden access') {
    super(message, 403);
  }
}

class NotFoundError extends ErrorHandler {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ValidationError extends ErrorHandler {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

module.exports = {
  ErrorHandler,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError
};
