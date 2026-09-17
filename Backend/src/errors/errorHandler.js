const AppError = require('./AppError');

const mapPrismaError = (error) => {
  if (error.code === 'P2002') {
    return new AppError('A record with this value already exists', 409, 'DUPLICATE_RESOURCE');
  }

  if (error.code === 'P2025') {
    return new AppError('Requested resource was not found', 404, 'RESOURCE_NOT_FOUND');
  }

  if (error.code === 'P2003') {
    return new AppError('The request references an invalid related resource', 400, 'INVALID_RELATION');
  }

  return error;
};

const errorHandler = (error, req, res, next) => {
  const normalizedError = mapPrismaError(error);
  const statusCode = normalizedError.isOperational ? normalizedError.statusCode : 500;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!normalizedError.isOperational) {
    console.error(normalizedError);
  }

  const response = {
    success: false,
    message: normalizedError.isOperational || !isProduction
      ? normalizedError.message
      : 'Internal server error',
    code: normalizedError.isOperational ? normalizedError.code : 'INTERNAL_SERVER_ERROR',
  };

  if (normalizedError.isOperational && normalizedError.details) {
    response.errors = normalizedError.details;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;