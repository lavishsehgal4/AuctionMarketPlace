const { getPrismaClient } = require('../config/supabase');
const AppError = require('../errors/AppError');

const requireRole = (...allowedRoles) => async (req, res, next) => {
  try {
    if (!req.user?.userId) {
      throw new AppError('Authentication is required', 401, 'AUTHENTICATION_REQUIRED');
    }

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { account_type: true, account_status: true },
    });

    if (!user || user.account_status !== 'ACTIVE') {
      throw new AppError('Your account is not active', 403, 'ACCOUNT_INACTIVE');
    }

    if (!allowedRoles.includes(user.account_type)) {
      throw new AppError('You are not allowed to perform this action', 403, 'ROLE_FORBIDDEN');
    }

    req.user.account_type = user.account_type;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = requireRole;