import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

export async function protect(req, res, next) {
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error('JWT_SECRET is not configured.');

      return res.status(500).json({
        message: 'Server authentication is not configured.',
      });
    }

    const header = req.headers.authorization || '';

    const token = header.startsWith('Bearer ')
      ? header.slice(7).trim()
      : null;

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    const payload = jwt.verify(token, secret);

    if (
      !payload ||
      typeof payload.sub !== 'string' ||
      !mongoose.isValidObjectId(payload.sub)
    ) {
      return res.status(401).json({
        message: 'Invalid authentication token.',
      });
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        message: 'Invalid authentication token.',
      });
    }

    req.user = user;

    return next();
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError'
    ) {
      return res.status(401).json({
        message: 'Invalid or expired authentication token.',
      });
    }

    return next(error);
  }
}