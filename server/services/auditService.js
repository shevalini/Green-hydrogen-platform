const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');

// In-memory fallback ring buffer for simulated/offline mode
const memoryLogs = [
  {
    _id: 'log-seed-01',
    action: 'USER_LOGIN',
    userEmail: 'admin@greenh2.local',
    userRole: 'ADMIN',
    details: 'System Administrator logged in to Control Room console',
    ipAddress: '127.0.0.1',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    _id: 'log-seed-02',
    action: 'OPTIMIZATION_RUN',
    userEmail: 'operator@greenh2.com',
    userRole: 'OPERATOR',
    details: 'Executed 24h Horizon LP optimization: Standard Operational Profile (1000 kg cap)',
    ipAddress: '127.0.0.1',
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
  },
  {
    _id: 'log-seed-03',
    action: 'TELEMETRY_REFRESH',
    userEmail: 'admin@greenh2.local',
    userRole: 'ADMIN',
    details: 'Manual telemetry sync: solar/wind sensor data synchronized with electrolyzer stack #1',
    ipAddress: '127.0.0.1',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];

async function logAuditAction({ action, userEmail, userRole, details, ipAddress = '127.0.0.1', metadata = {} }) {
  const logEntry = {
    _id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    action,
    userEmail,
    userRole,
    details,
    ipAddress,
    metadata,
    timestamp: new Date().toISOString(),
  };

  memoryLogs.unshift(logEntry);
  if (memoryLogs.length > 50) memoryLogs.pop();

  if (mongoose.connection.readyState === 1) {
    try {
      await AuditLog.create({
        action,
        userEmail,
        userRole,
        details,
        ipAddress,
        metadata,
      });
    } catch (err) {
      console.warn('Could not persist audit log to MongoDB:', err.message);
    }
  }

  return logEntry;
}

async function getAuditLogs(limit = 30) {
  if (mongoose.connection.readyState === 1) {
    try {
      const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(limit);
      if (logs.length > 0) return logs;
    } catch (err) {
      console.warn('DB query for audit logs failed, falling back to memory logs:', err.message);
    }
  }
  return memoryLogs.slice(0, limit);
}

module.exports = {
  logAuditAction,
  getAuditLogs,
};
