const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', required: true },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    hoursLogged: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['registered', 'attended', 'absent', 'excused'],
      default: 'registered',
    },
    feedback: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

AttendanceSchema.index({ event: 1, volunteer: 1 }, { unique: true });
AttendanceSchema.index({ volunteer: 1, status: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
