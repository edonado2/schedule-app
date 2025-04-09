import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { google } from 'googleapis';
import { promisify } from 'util';
import { z } from 'zod';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

// Validation schema for user registration
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// Validation schema for user login
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors,
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors,
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      // Generate Google OAuth URL
      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar'],
      });
      return res.redirect(url);
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    // Find or create user
    let user = await User.findOne({ email: data.email });
    if (!user) {
      user = new User({
        name: data.name,
        email: data.email,
        password: Math.random().toString(36).slice(-8), // Generate random password
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiry: new Date(tokens.expiry_date),
      });
    } else {
      user.googleAccessToken = tokens.access_token;
      user.googleRefreshToken = tokens.refresh_token;
      user.googleTokenExpiry = new Date(tokens.expiry_date);
    }

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Error with Google authentication', error: error.message });
  }
};

export const protect = async (req, res, next) => {
  try {
    // 1) Get token and check if it exists
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in! Please log in to get access.'
      });
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token. Please log in again!'
    });
  }
}; 