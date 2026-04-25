const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation failed',
  DUPLICATE_EMAIL: 'Email already in use',
  INVALID_CREDENTIALS: 'Invalid email or password'
};

const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  LOGIN: 'Login successful',
  LOGOUT: 'Logout successful'
};

module.exports = { HTTP_STATUS_CODES, ERROR_MESSAGES, SUCCESS_MESSAGES };
