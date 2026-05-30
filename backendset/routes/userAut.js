const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const { getJwtSecret, getJwtRefreshSecret } = require('../config/appConfig');

// Helper: Set Refresh Token Cookie
const setRefreshTokenCookie = (res, token) => {
  res.cookie('jid', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh-token', // Only sent to refresh endpoint
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};

// ROUTE 1: Create User / Register
router.post('/createuser', [
  body('name', 'Name must be at least 3 characters').trim().isLength({ min: 3 }),
  body('email').trim().notEmpty().isEmail().withMessage('Not a valid e-mail address').normalizeEmail(),
  body('password').trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('cPassword').trim().custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords must match');
    return true;
  }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    let user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user) return res.status(400).json({ error: 'An account with this email already exists' });

    const salt = await bcrypt.genSalt(12);
    const securePass = await bcrypt.hash(req.body.password, salt);

    user = await User.create({
      name: req.body.name.trim(),
      email: req.body.email.toLowerCase(),
      password: securePass,
    });

    const payload = { user: { id: user._id } };
    const authToken = jwt.sign(payload, getJwtSecret(), { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, getJwtRefreshSecret(), { expiresIn: '30d' });

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      authToken,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ROUTE 2: Login
router.post('/userlogin', [
  body('email').trim().notEmpty().isEmail().withMessage('Not a valid e-mail address').normalizeEmail(),
  body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) return res.status(400).json({ error: 'Invalid email or password' });

    const payload = { user: { id: user._id } };
    const authToken = jwt.sign(payload, getJwtSecret(), { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, getJwtRefreshSecret(), { expiresIn: '30d' });

    setRefreshTokenCookie(res, refreshToken);

    res.json({
      success: true,
      authToken,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, preferences: user.preferences }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ROUTE 3: Logout
router.post('/logout', (req, res) => {
  res.clearCookie('jid', { path: '/api/auth/refresh-token' });
  res.json({ success: true, message: 'Logged out' });
});

// ROUTE 4: Refresh token
router.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.cookies.jid;
    if (!refreshToken) return res.status(401).json({ error: 'Session expired' });

    const decoded = jwt.verify(refreshToken, getJwtRefreshSecret());
    const payload = { user: { id: decoded.user.id } };
    const newAuthToken = jwt.sign(payload, getJwtSecret(), { expiresIn: '15m' });

    res.json({ authToken: newAuthToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid session' });
  }
});

// ROUTE 5: Get current user
router.get('/me', fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ROUTE 6: Update user profile
router.put('/updateprofile', fetchuser, [
  body('name').optional().trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, avatar, preferences } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences) {
      if (preferences.theme) user.preferences.theme = preferences.theme;
      if (preferences.defaultWorkspace !== undefined) user.preferences.defaultWorkspace = preferences.defaultWorkspace;
    }

    const updated = await user.save();
    res.json({ success: true, user: { id: updated._id, name: updated.name, email: updated.email, avatar: updated.avatar, preferences: updated.preferences } });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
