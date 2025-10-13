import express from 'express';
import bcrypt from 'bcryptjs'; // ✅ Needed for hashing
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { userRegistrationSchema, userLoginSchema } from '../utils/validation.js';

const router = express.Router();

// POST /register
router.post('/register', async (req, res) => {
  try {
    const { error, value } = userRegistrationSchema.validate(req.body);

    if (error?.details?.[0]?.message) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password } = value;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }


    const user = new User({ name, email, password });
    await user.save();

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'JWT secret not configured' });
    }

    const token = jwt.sign(
      { userId: user._id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { error, value } = userLoginSchema.validate(req.body);

    if (error?.details?.[0]?.message) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { email, password } = value;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Use bcrypt to check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'JWT secret not configured' });
    }

    const token = jwt.sign(
      { userId: user._id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export { router as authRoutes };
