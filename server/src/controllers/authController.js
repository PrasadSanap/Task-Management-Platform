import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const makeToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role || 'user',
});

export const register = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({
      message: 'Name must contain between 2 and 80 characters.',
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      message: 'Enter a valid email address.',
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters.',
    });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json({
      message: 'An account with this email already exists.',
    });
  }

  // Never accept the role from public registration input.
  const hashedPassword = await bcrypt.hash(password, 12);

  let user;

  try {
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });
  } catch (error) {
    // Handle concurrent duplicate registration attempts.
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    throw error;
  }

  res.status(201).json({
    token: makeToken(user),
    user: publicUser(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required.',
    });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      message: 'Invalid email or password.',
    });
  }

  res.status(200).json({
    token: makeToken(user),
    user: publicUser(user),
  });
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    user: publicUser(req.user),
  });
});