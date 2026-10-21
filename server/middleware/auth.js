const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/**
 * Middleware to verify JWT from HttpOnly cookie.
 * - When MongoDB is connected: performs a fresh User lookup (validates role & isActive freshness).
 * - When MongoDB is disconnected: trusts the signed JWT payload so the dashboard
 *   remains usable in demo/offline mode without returning 500 for every request.
 * Attaches req.user (id, role, name, email, isActive) if valid.
 */
function verifyToken(req, res, next) {
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }

  const dbConnected = mongoose.connection.readyState === 1;

  if (!dbConnected) {
    // Fallback: trust JWT payload (DB cannot confirm isActive/role freshness)
    req.user = {
      id: payload.id,
      role: payload.role || 'VIEWER',
      name: payload.name || 'Unknown',
      email: payload.email || '',
      isActive: true,
      _fromJwtOnly: true,
    };
    return next();
  }

  // DB is available – do a fresh lookup to catch deactivated/role-changed accounts
  User.findById(payload.id)
    .then((user) => {
      if (!user || !user.isActive) {
        return res.status(401).json({ success: false, error: 'Invalid or inactive user' });
      }
      req.user = {
        id: user._id,
        role: user.role,
        isActive: user.isActive,
        name: user.name,
        email: user.email,
      };
      next();
    })
    .catch((err) => {
      console.error('Error fetching user in auth middleware:', err);
      // Degrade gracefully on unexpected DB errors
      req.user = {
        id: payload.id,
        role: payload.role || 'VIEWER',
        name: payload.name || 'Unknown',
        email: payload.email || '',
        isActive: true,
        _fromJwtOnly: true,
      };
      next();
    });
}

/**
 * Factory middleware to enforce role-based access.
 * Usage: authorizeRoles('ADMIN', 'OPERATOR')
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden: insufficient privileges' });
    }
    next();
  };
}

module.exports = { verifyToken, authorizeRoles, JWT_SECRET, JWT_EXPIRES_IN };

