import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { env } from '../config/env.js';
import { tokensRepository } from '../repositories/tokensRepository.js';
import { usersRepository } from '../repositories/usersRepository.js';
import { auditRepository } from '../repositories/auditRepository.js';
import { HttpError } from '../utils/httpError.js';

const refreshCookieName = 'wwj_refresh_token';

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: env.cookie.sameSite,
    secure: env.cookie.secure,
    path: '/api/auth'
  };
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    env.jwt.accessSecret,
    {
      expiresIn: env.jwt.accessExpiresIn,
      issuer: env.jwt.issuer,
      audience: env.jwt.audience
    }
  );
}

function refreshExpiryDate() {
  const days = Number.parseInt(env.jwt.refreshExpiresIn, 10) || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function issueRefreshToken(response, user) {
  const token = nanoid(64);
  const expiresAt = refreshExpiryDate();
  await tokensRepository.create({ userId: user.id, token, expiresAt });
  response.cookie(refreshCookieName, token, { ...cookieOptions(), expires: expiresAt });
}

export const authController = {
  async login(request, response) {
    const user = await usersRepository.findByEmail(request.body.email);

    if (!user || user.status !== 'active') {
      throw new HttpError(401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const isValid = await bcrypt.compare(request.body.password, user.passwordHash);
    if (!isValid) {
      throw new HttpError(401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    await tokensRepository.revokeUserTokens(user.id);
    await issueRefreshToken(response, user);
    await usersRepository.markLogin(user.id);
    await auditRepository.create({ user, action: 'login', entityType: 'admin_auth', entityId: user.id, request });

    response.json({
      accessToken: signAccessToken(user),
      token: signAccessToken(user),
      user: publicUser(user)
    });
  },

  async refresh(request, response) {
    const token = request.cookies?.[refreshCookieName];
    if (!token) throw new HttpError(401, 'Refresh token required');

    const record = await tokensRepository.findActive(token);
    if (!record || record.status !== 'active') throw new HttpError(401, 'Invalid refresh token');

    await tokensRepository.revoke(token);
    const user = {
      id: record.user_id,
      name: record.name,
      email: record.email,
      role: record.role,
      status: record.status
    };
    await issueRefreshToken(response, user);

    response.json({
      accessToken: signAccessToken(user),
      token: signAccessToken(user),
      user: publicUser(user)
    });
  },

  async logout(request, response) {
    const token = request.cookies?.[refreshCookieName];
    if (token) {
      const record = await tokensRepository.findActive(token);
      if (record) {
        await auditRepository.create({
          user: { id: record.user_id, email: record.email },
          action: 'logout',
          entityType: 'admin_auth',
          entityId: record.user_id,
          request
        });
      }
      await tokensRepository.revoke(token);
    }
    response.clearCookie(refreshCookieName, cookieOptions());
    response.json({ success: true });
  },

  async me(request, response) {
    response.json({ user: publicUser(request.user) });
  }
};
