const mongoose = require('mongoose');
const { CAUSE_AREAS, SKILLS, CITIES } = require('../utils/constants');

const VolunteerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // --- Personal Information ---
    fullName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
      required: true,
    },
    phone: { type: String, required: true, match: /^[6-9]\d{9}$/ },
    whatsappNumber: { type: String },
    email: { type: String, required: true },

    // --- Address & Location ---
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true, enum: CITIES },
    state: { type: String, required: true },
    pincode: { type: String, required: true, match: /^\d{6}$/ },

    // --- Identity / Affiliation ---
    affiliationType: {
      type: String,
      enum: [
        'School Student',
        'College/University Student',
        'Working Professional',
        'Homemaker',
        'Retired',
        'Other',
      ],
      required: true,
    },
    institutionName: { type: String },
    course: { type: String },
    yearOfStudy: { type: String },

    // --- Volunteer Preferences ---
    causeAreas: [{ type: String, enum: CAUSE_AREAS }],
    skills: [{ type: String, enum: SKILLS }],
    languages: [{ type: String }],
    availabilityDays: [
      {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
    ],
    availabilityType: {
      type: String,
      enum: ['Weekdays only', 'Weekends only', 'Both weekdays and weekends', 'Flexible'],
    },
    hoursPerWeek: { type: Number, min: 1, max: 40 },
    preferredMode: {
      type: String,
      enum: ['On-ground (in-person)', 'Remote/Online', 'Both'],
    },

    // --- Motivation & Background ---
    motivationStatement: { type: String, maxlength: 500 },
    previousVolunteerExperience: { type: String, maxlength: 500 },
    heardAboutUs: {
      type: String,
      enum: ['Instagram', 'LinkedIn', 'Facebook', 'Friend/Family', 'College/School', 'Google Search', 'YouTube', 'Other'],
    },

    // --- Emergency Contact ---
    emergencyContactName: { type: String, required: true },
    emergencyContactPhone: { type: String, required: true },
    emergencyContactRelation: { type: String, required: true },

    // --- Documents & Profile ---
    profilePhoto: { type: String },
    idProofType: {
      type: String,
      enum: ['Aadhar Card', 'Student ID Card', 'Driving License', 'PAN Card', 'Passport'],
    },
    idProofUrl: { type: String },
    idProofLast4: { type: String }, // only last 4 digits stored, never full number
    collegeIdUrl: { type: String },

    // --- Status & Admin Fields ---
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended', 'inactive'],
      default: 'pending',
    },
    rejectionReason: { type: String },
    suspensionReason: { type: String },
    adminNotes: { type: String }, // internal, never exposed to volunteer
    volunteerIdNumber: { type: String, unique: true, sparse: true },
    assignedCoordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    totalHoursLogged: { type: Number, default: 0 },
    totalEventsAttended: { type: Number, default: 0 },
    certificateIssued: { type: Boolean, default: false },
    certificateIssuedAt: Date,

    // --- Agreements ---
    agreedToTerms: { type: Boolean, required: true },
    agreedToCodeOfConduct: { type: Boolean, required: true },
    agreedToPhotoConsent: { type: Boolean, default: false },
    dataPrivacyConsent: { type: Boolean, required: true },

    isDeleted: { type: Boolean, default: false },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for fast admin filtering
VolunteerSchema.index({ status: 1, city: 1 });
VolunteerSchema.index({ causeAreas: 1 });
VolunteerSchema.index({ registeredAt: -1 });
VolunteerSchema.index({ volunteerIdNumber: 1 });
VolunteerSchema.index({ fullName: 'text', email: 'text', phone: 'text' });

// Certificate eligibility virtual
VolunteerSchema.virtual('isCertificateEligible').get(function () {
  const minHours = Number(process.env.CERTIFICATE_MIN_HOURS || 20);
  const minEvents = Number(process.env.CERTIFICATE_MIN_EVENTS || 3);
  return this.totalHoursLogged >= minHours && this.totalEventsAttended >= minEvents;
});

VolunteerSchema.set('toJSON', { virtuals: true });
VolunteerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Volunteer', VolunteerSchema);
