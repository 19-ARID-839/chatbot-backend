// src/routes/auth.js
import { Router } from 'express';
import {
  register,
  login,
  me,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';

// import { requireAuth } from '../middleware/auth.js'; // if you have one

const router = Router();

router.post('/register', register);
router.post('/login', login);
// router.get('/me', requireAuth, me);
router.get('/me', me);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
