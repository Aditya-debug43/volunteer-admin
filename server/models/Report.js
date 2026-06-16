const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['volunteers', 'activity', 'events', 'city-summary', 'cause-impact', 'monthly'],
      required: true,
    },
    name: { type: String, required: true },
    filters: { type: mongoose.Schema.Types.Mixed }, // saved filter snapshot
    recordCount: { type: Number },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', ReportSchema);
