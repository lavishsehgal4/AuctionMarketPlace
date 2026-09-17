const { getPrismaClient } = require('../config/supabase');
const AppError = require('../errors/AppError');

const loadOwnedResource = ({ model, idParam, ownerField, resourceKey }) => async (req, res, next) => {
  try {
    if (!req.user?.userId) {
      throw new AppError('Authentication is required', 401, 'AUTHENTICATION_REQUIRED');
    }

    const resourceId = req.params[idParam];
    if (!resourceId) {
      throw new AppError(`${idParam} is required`, 400, 'VALIDATION_ERROR');
    }

    const prisma = getPrismaClient();
    const resource = await prisma[model].findFirst({
      where: {
        id: resourceId,
        [ownerField]: req.user.userId,
      },
    });

    if (!resource) {
      throw new AppError('Requested resource was not found', 404, 'RESOURCE_NOT_FOUND');
    }

    req[resourceKey] = resource;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = loadOwnedResource;