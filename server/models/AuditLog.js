const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'USER_LOGIN',
      'USER_LOGOUT',
      'OPTIMIZATION_RUN',
      'USER_CREATED',
      'USER_ROLE_UPDATED',
      'USER_STATUS_UPDATED',
      'TELEMETRY_REFRESH',
      'SYSTEM_CONFIG_UPDATED',
    ],
  },
  userEmail: {
    type: String,
    required: true,
    trim: true,
  },
  userRole: {
    type: String,
    enum: ['ADMIN', 'OPERATOR', 'VIEWER'],
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
