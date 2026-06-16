const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminName: { type: String },
    action: { type: String, required: true }, // e.g. "APPROVE_VOLUNTEER"
    targetModel: { type: String }, // e.g. "Volunteer"
    targetId: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
