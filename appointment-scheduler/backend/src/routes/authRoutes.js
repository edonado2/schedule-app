import express from 'express';
import { register, login, protect } from '../controllers/authController.js';

const router = express.Router();

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Google OAuth routes
router.get('/google', protect);
router.get('/google/callback', protect);

export default router; 