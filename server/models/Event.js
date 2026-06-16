const mongoose = require('mongoose');
const { CAUSE_AREAS } = require('../utils/constants');

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    causeArea: { type: String, enum: CAUSE_AREAS, required: true },
    eventType: {
      type: String,
      enum: [
        'Food Drive',
        'Sanitary Drive',
        'Clothes Collection',
        'Teaching Session',
        'Awareness Campaign',
        'Fundraiser',
        'Tree Plantation',
        'Blood Donation',
        'Other',
      ],
      required: true,
    },
    mode: { type: String, enum: ['On-ground', 'Online', 'Hybrid'], required: true },
    city: { type: String, required: true },
    venue: { type: String },
    onlineLink: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date },
    maxVolunteers: { type: Number },
    registeredVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' }],
    confirmedAttendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' }],
    coordinatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    coverImage: { type: String },
    reportSummary: { type: String },
    beneficiariesServed: { type: Number, default: 0 },
    itemsDistributed: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

EventSchema.index({ status: 1, city: 1, startDate: -1 });
EventSchema.index({ causeArea: 1 });

module.exports = mongoose.model('Event', EventSchema);
