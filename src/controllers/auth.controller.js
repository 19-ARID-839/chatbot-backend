import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';
import User from '../models/User.js';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function sign(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/* ---------- Core auth ---------- */
export async function register(req, res) {
  try {
    const data = registerSchema.parse(req.body);
    const exists = await User.findOne({ email: data.email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create(data);
    const token = sign(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, plan: user.plan },
    });
  } catch (e) {
    res.status(400).json({ message: 'Invalid data', error: e.message });
  }
}

export async function login(req, res) {
  try {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email });
    if (!user || !(await user.comparePassword(data.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = sign(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, plan: user.plan },
    });
  } catch (e) {
    res.status(400).json({ message: 'Invalid data', error: e.message });
  }
}

export async function me(req, res) {
  const u = req.user;
  res.json({
    user: { id: u._id, name: u.name, email: u.email, role: u.role, plan: u.plan },
  });
}

/* ---------- Password reset flow (dev) ---------- */
/** POST /api/auth/forgot-password  body: { email }  */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).send('Email is required');

    const user = await User.findOne({ email: String(email).toLowerCase() });

    // Always respond ok (avoid account enumeration)
    if (!user) {
      return res.json({ ok: true, message: 'If the account exists, a reset link has been sent.' });
    }

    // Create token valid for 1 hour
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    // In production: send email with link:
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
    // await sendEmail(user.email, resetUrl)

    // Dev: return token so you can test next step
    return res.json({ ok: true, message: 'If the account exists, a reset link has been sent.', token });
  } catch (e) {
    console.error('forgotPassword error:', e);
    res.status(500).send('Server error');
  }
}

/** POST /api/auth/reset-password  body: { token, password } */
export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).send('Token and password are required');

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, // not expired
    });

    if (!user) return res.status(400).send('Invalid or expired token');

    user.password = password;           // will be hashed by pre-save hook
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ ok: true, message: 'Password updated' });
  } catch (e) {
    console.error('resetPassword error:', e);
    res.status(500).send('Server error');
  }
}
