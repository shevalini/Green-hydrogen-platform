const express = require('express');
const User = require('../models/User');
const { authorizeRoles } = require('../middleware/auth');
const { logAuditAction, getAuditLogs } = require('../services/auditService');

const router = express.Router();

// All admin routes require ADMIN role
router.use(authorizeRoles('ADMIN'));

/** List all users */
router.get('/users', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbConnected = mongoose.connection.readyState === 1;

    if (!dbConnected) {
      return res.json({
        success: true,
        data: [
          {
            _id: 'demo-admin-01',
            name: process.env.INIT_ADMIN_NAME || 'System Administrator',
            email: process.env.INIT_ADMIN_EMAIL || 'admin@greenh2.local',
            role: 'ADMIN',
            isActive: true,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: 'demo-operator-01',
            name: 'Lead Plant Operator',
            email: 'operator@greenh2.com',
            role: 'OPERATOR',
            isActive: true,
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: 'demo-viewer-01',
            name: 'Energy Systems Analyst',
            email: 'viewer@greenh2.com',
            role: 'VIEWER',
            isActive: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        meta: { demoMode: true, message: 'Database disconnected. Showing built-in personnel registry.' },
      });
    }

    const users = await User.find().select('-passwordHash');
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('Admin list users error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/** Create a new user (admin only) */
router.post('/users', async (req, res) => {
  const { name, email, password, role, isActive } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email and password required' });
  }
  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, error: 'User already exists' });
    }
    const user = new User({ name, email, role, isActive });
    user.password = password; // triggers virtual setter to hash
    await user.save();
    const safeUser = user.toObject();
    delete safeUser.passwordHash;

    // Log audit event
    await logAuditAction({
      action: 'USER_CREATED',
      userEmail: req.user?.email || 'admin@greenh2.local',
      userRole: req.user?.role || 'ADMIN',
      details: `Provisioned account for ${name} (${email}) with role [${role}]`,
      ipAddress: req.ip,
      metadata: { createdUserId: user._id, role },
    });

    res.status(201).json({ success: true, data: safeUser });
  } catch (err) {
    console.error('Admin create user error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/** Update user fields: role, isActive, or password reset */
router.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { role, isActive, password } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const oldRole = user.role;
    const oldActive = user.isActive;

    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (password) user.password = password; // hash via virtual
    await user.save();
    const safe = user.toObject();
    delete safe.passwordHash;

    // Log audit event
    await logAuditAction({
      action: role && role !== oldRole ? 'USER_ROLE_UPDATED' : 'USER_STATUS_UPDATED',
      userEmail: req.user?.email || 'admin@greenh2.local',
      userRole: req.user?.role || 'ADMIN',
      details: `Updated user ${user.email}: role [${oldRole} → ${user.role}], active [${oldActive} → ${user.isActive}]`,
      ipAddress: req.ip,
      metadata: { targetUserId: user._id, role: user.role, isActive: user.isActive },
    });

    res.json({ success: true, data: safe });
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/** Delete a user (cannot delete yourself) */
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  if (req.user && req.user.id.toString() === id) {
    return res.status(400).json({ success: false, error: 'You cannot delete your own account.' });
  }
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    console.error('Admin delete user error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * GET /api/admin/audit-logs
 * Returns audit trail of plant events, optimizer executions, and administrative changes
 */
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await getAuditLogs(50);
    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    console.error('Fetch audit logs error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve audit logs' });
  }
});

module.exports = router;
