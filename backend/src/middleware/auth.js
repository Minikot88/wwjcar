import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { usersRepository } from '../repositories/usersRepository.js';
import { HttpError } from '../utils/httpError.js';

export async function requireAuth(request, _response, next) {
  try {
    const header = request.headers.authorization || '';
    const [, token] = header.match(/^Bearer\s+(.+)$/i) || [];

    if (!token) {
      throw new HttpError(401, 'Authentication required');
    }

    const payload = jwt.verify(token, env.jwt.accessSecret, {
      issuer: env.jwt.issuer,
      audience: env.jwt.audience
    });
    const user = await usersRepository.findById(payload.sub);

    if (!user || user.status !== 'active') {
      throw new HttpError(401, 'Invalid user');
    }

    request.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new HttpError(401, 'Invalid or expired token'));
      return;
    }

    next(error);
  }
}

export async function optionalAuth(request, _response, next) {
  try {
    const header = request.headers.authorization || '';
    const [, token] = header.match(/^Bearer\s+(.+)$/i) || [];

    if (!token) {
      next();
      return;
    }

    const payload = jwt.verify(token, env.jwt.accessSecret, {
      issuer: env.jwt.issuer,
      audience: env.jwt.audience
    });
    const user = await usersRepository.findById(payload.sub);

    if (user?.status === 'active') {
      request.user = user;
    }

    next();
  } catch {
    next();
  }
}

export function requireAdmin(request, _response, next) {
  if (request.user?.role !== 'admin') {
    throw new HttpError(403, 'Admin permission required');
  }

  next();
}
