const AppError = require('../errors/AppError');

const validateRequest = ({ body = [], params = [], query = [] }) => (req, res, next) => {
  const missingFields = [
    ...body.filter((field) => req.body?.[field] === undefined || req.body[field] === null || req.body[field] === ''),
    ...params.filter((field) => !req.params?.[field]),
    ...query.filter((field) => req.query?.[field] === undefined || req.query[field] === ''),
  ];

  if (missingFields.length > 0) {
    return next(new AppError(
      `Required field${missingFields.length > 1 ? 's' : ''} missing: ${missingFields.join(', ')}`,
      400,
      'VALIDATION_ERROR',
      missingFields.map((field) => ({ field, message: 'This field is required' })),
    ));
  }

  next();
};

module.exports = validateRequest;