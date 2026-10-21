const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { verifyToken, JWT_SECRET, JWT_EXPIRES_IN } = require('../middleware/auth');

const router = express.Router();

const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // generous limit for development & demo
  message: { success: false, error: 'Too many login attempts, please try again in a few minutes.' },
});

// Built-in demo accounts for offline / quick-access testing
const DEMO_ACCOUNTS = [
  {
    emails: [
      (process.env.INIT_ADMIN_EMAIL || 'admin@greenh2.local').toLowerCase(),
      'admin@greenh2.com',
      'admin@example.com',
    ],
    passwords: [
      (process.env.INIT_ADMIN_PASSWORD || '2024').trim(),
      'admin123',
      '2024',
    ],
    role: 'ADMIN',
    name: process.env.INIT_ADMIN_NAME || 'System Administrator',
    id: 'demo-admin-01',
  },
  {
    emails: ['operator@greenh2.com', 'operator@greenh2.local'],
    passwords: ['operator123', '2024'],
    role: 'OPERATOR',
    name: 'Lead Plant Operator',
    id: 'demo-operator-01',
  },
  {
    emails: ['viewer@greenh2.com', 'viewer@greenh2.local', 'analyst@greenh2.com'],
    passwords: ['viewer123', '2024'],
    role: 'VIEWER',
    name: 'Energy Systems Analyst',
    id: 'demo-viewer-01',
  },
];

/**
 * Helper to match demo credentials
 */
function matchDemoUser(email, password) {
  const normEmail = (email || '').toLowerCase().trim();
  const normPass = (password || '').trim();

  for (const acct of DEMO_ACCOUNTS) {
    if (acct.emails.includes(normEmail) && acct.passwords.includes(normPass)) {
      return acct;
    }
  }
  return null;
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const dbConnected = mongoose.connection.readyState === 1;

  // 1) Try DB lookup if connected
  if (dbConnected) {
    try {
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (user && user.isActive) {
        const passwordMatch = user.comparePassword(password);
        if (passwordMatch) {
          const payload = { id: user._id, role: user.role, name: user.name, email: user.email };
          const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
          res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000,
          });

          // Record audit log
          const { logAuditAction } = require('../services/auditService');
          logAuditAction({
            action: 'USER_LOGIN',
            userEmail: user.email,
            userRole: user.role,
            details: `User ${user.name} authenticated successfully (Role: ${user.role})`,
            ipAddress: req.ip,
          }).catch(() => {});

          return res.json({
            success: true,
            data: { id: user._id, name: user.name, email: user.email, role: user.role },
          });
        }
      }
    } catch (err) {
      console.warn('DB lookup error during login, checking demo credentials fallback:', err.message);
    }
  }

  // 2) Fallback to demo credentials (allows seamless offline/demo access)
  const demoUser = matchDemoUser(email, password);
  if (demoUser) {
    const payload = { id: demoUser.id, role: demoUser.role, name: demoUser.name, email: email.toLowerCase().trim() };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000,
    });

    // Record audit log
    const { logAuditAction } = require('../services/auditService');
    logAuditAction({
      action: 'USER_LOGIN',
      userEmail: email.toLowerCase().trim(),
      userRole: demoUser.role,
      details: `${demoUser.name} signed in via plant access console (Role: ${demoUser.role})`,
      ipAddress: req.ip,
    }).catch(() => {});

    return res.json({
      success: true,
      data: { id: demoUser.id, name: demoUser.name, email: email.toLowerCase().trim(), role: demoUser.role },
      meta: { demoMode: true, dbConnected },
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid credentials. You can use Admin demo: admin@greenh2.local (password: 2024)',
  });
});

/**
 * GET /api/auth/me
 */
router.get('/me', verifyToken, (req, res) => {
  const { id, name, email, role } = req.user;
  res.json({ success: true, data: { id, name, email, role } });
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
