/**
 * Custom API Error class
 * Extends Error to include status code and operational flag
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a Bad Request error (400)
 */
ApiError.badRequest = (message = 'Bad Request') => {
  return new ApiError(message, 400);
};

/**
 * Create an Unauthorized error (401)
 */
ApiError.unauthorized = (message = 'Unauthorized') => {
  return new ApiError(message, 401);
};

/**
 * Create a Forbidden error (403)
 */
ApiError.forbidden = (message = 'Forbidden') => {
  return new ApiError(message, 403);
};

/**
 * Create a Not Found error (404)
 */
ApiError.notFound = (message = 'Resource not found') => {
  return new ApiError(message, 404);
};

/**
 * Create a Conflict error (409)
 */
ApiError.conflict = (message = 'Resource already exists') => {
  return new ApiError(message, 409);
};

/**
 * Create a Validation error (422)
 */
ApiError.validation = (message = 'Validation failed') => {
  return new ApiError(message, 422);
};

/**
 * Create an Internal Server error (500)
 */
ApiError.internal = (message = 'Internal server error') => {
  return new ApiError(message, 500);
};

module.exports = ApiError;
