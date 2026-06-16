const Volunteer = require('../models/Volunteer');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const AuditLog = require('../models/AuditLog');
const sendEmail = require('../utils/sendEmail');
const templates = require('../utils/emailTemplates');
const { generateVolunteerId } = require('../utils/volunteerId');
const { generateCertificate } = require('../utils/generateCertificate');

const PAGE_LIMIT = 20;

// Scope query to coordinator's city when applicable
function scopeByRole(req, base = {}) {
  const q = { isDeleted: false, ...base };
  if (req.user.role === 'city_coordinator' && req.user.assignedCity) {
    q.city = req.user.assignedCity;
  }
  return q;
}

// GET /api/volunteers  (filters + pagination)
exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || PAGE_LIMIT);
    const filter = scopeByRole(req);

    if (req.query.status) filter.status = req.query.status;
    if (req.query.city) filter.city = req.query.city;
    if (req.query.affiliationType) filter.affiliationType = req.query.affiliationType;
    if (req.query.causeArea) filter.causeAreas = req.query.causeArea;
    if (req.query.search) filter.$text = { $search: req.query.search };
    if (req.query.from || req.query.to) {
      filter.registeredAt = {};
      if (req.query.from) filter.registeredAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.registeredAt.$lte = new Date(req.query.to);
    }

    const [data, total] = await Promise.all([
      Volunteer.find(filter).sort({ registeredAt: -1 }).skip((page - 1) * limit).limit(limit),
      Volunteer.countDocuments(filter),
    ]);

    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/volunteers/:id
exports.getOne = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id).populate('assignedCoordinator', 'name email');
    if (!volunteer || volunteer.isDeleted) return res.status(404).json({ message: 'Volunteer not found.' });

    // Volunteers can only view their own profile
    const isOwner = String(volunteer.user) === String(req.user._id);
    const isAdmin = ['admin', 'super_admin', 'city_coordinator'].includes(req.user.role);
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden.' });

    const obj = volunteer.toObject();
    if (!isAdmin) delete obj.adminNotes; // never expose internal notes to volunteer
    res.json(obj);
  } catch (err) {
    next(err);
  }
};

// PUT /api/volunteers/:id  (own or admin)
exports.update = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer || volunteer.isDeleted) return res.status(404).json({ message: 'Volunteer not found.' });

    const isOwner = String(volunteer.user) === String(req.user._id);
    const isAdmin = ['admin', 'super_admin', 'city_coordinator'].includes(req.user.role);
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden.' });

    // Fields locked after approval for the owner
    const lockedAfterApproval = ['fullName', 'dateOfBirth', 'idProofType', 'idProofUrl'];
    const updates = { ...req.body };
    delete updates.status;
    delete updates.volunteerIdNumber;
    delete updates.totalHoursLogged;
    delete updates.adminNotes; // admin notes handled separately

    if (isOwner && !isAdmin && volunteer.status === 'approved') {
      lockedAfterApproval.forEach((f) => delete updates[f]);
    }

    Object.assign(volunteer, updates);
    await volunteer.save();
    res.json(volunteer);
  } catch (err) {
    next(err);
  }
};

// PUT /api/volunteers/:id/status  (approve/reject/suspend)
exports.changeStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const allowed = ['pending', 'approved', 'rejected', 'suspended', 'inactive'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status.' });

    const volunteer = await Volunteer.findById(req.params.id).populate('user');
    if (!volunteer || volunteer.isDeleted) return res.status(404).json({ message: 'Volunteer not found.' });

    volunteer.status = status;
    if (status === 'rejected') volunteer.rejectionReason = reason;
    if (status === 'suspended') volunteer.suspensionReason = reason;

    // Generate volunteer ID + welcome email on first approval
    if (status === 'approved') {
      if (!volunteer.volunteerIdNumber) {
        volunteer.volunteerIdNumber = await generateVolunteerId(new Date().getFullYear());
      }
      volunteer.approvedAt = new Date();
      await sendEmail({
        to: volunteer.email,
        ...templates.approved({ name: volunteer.fullName, volunteerId: volunteer.volunteerIdNumber }),
      });
    }
    if (status === 'rejected') {
      await sendEmail({ to: volunteer.email, ...templates.rejected({ name: volunteer.fullName, reason }) });
    }

    await volunteer.save();
    await AuditLog.create({
      admin: req.user._id,
      adminName: req.user.name,
      action: `STATUS_${status.toUpperCase()}`,
      targetModel: 'Volunteer',
      targetId: String(volunteer._id),
      details: { reason },
    });

    res.json(volunteer);
  } catch (err) {
    next(err);
  }
};

// PUT /api/volunteers/:id/assign-coordinator
exports.assignCoordinator = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { assignedCoordinator: req.body.coordinatorId },
      { new: true }
    );
    if (!volunteer) return res.status(404).json({ message: 'Volunteer not found.' });
    res.json(volunteer);
  } catch (err) {
    next(err);
  }
};

// PUT /api/volunteers/:id/notes  (admin internal notes)
exports.updateNotes = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { adminNotes: req.body.adminNotes },
      { new: true }
    );
    if (!volunteer) return res.status(404).json({ message: 'Volunteer not found.' });
    res.json({ adminNotes: volunteer.adminNotes });
  } catch (err) {
    next(err);
  }
};

// PUT /api/volunteers/:id/photo  (own) — expects upload middleware to set req.file
exports.updatePhoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) return res.status(404).json({ message: 'Volunteer not found.' });
    if (String(volunteer.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }
    volunteer.profilePhoto = req.file.path; // Cloudinary URL
    await volunteer.save();
    res.json({ profilePhoto: volunteer.profilePhoto });
  } catch (err) {
    next(err);
  }
};

// GET /api/volunteers/:id/activity
exports.activity = async (req, res, next) => {
  try {
    const records = await Attendance.find({ volunteer: req.params.id })
      .populate('event', 'title startDate city causeArea')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

// POST /api/volunteers/:id/generate-certificate
exports.generateCertificate = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) return res.status(404).json({ message: 'Volunteer not found.' });

    const minHours = Number(process.env.CERTIFICATE_MIN_HOURS || 20);
    const minEvents = Number(process.env.CERTIFICATE_MIN_EVENTS || 3);
    if (volunteer.totalHoursLogged < minHours || volunteer.totalEventsAttended < minEvents) {
      return res.status(400).json({ message: 'Volunteer does not meet certificate eligibility yet.' });
    }

    const pdf = await generateCertificate({
      fullName: volunteer.fullName,
      volunteerId: volunteer.volunteerIdNumber,
      startDate: volunteer.approvedAt || volunteer.registeredAt,
      totalHours: volunteer.totalHoursLogged,
      totalEvents: volunteer.totalEventsAttended,
      causeAreas: volunteer.causeAreas,
    });

    volunteer.certificateIssued = true;
    volunteer.certificateIssuedAt = new Date();
    await volunteer.save();

    await sendEmail({
      to: volunteer.email,
      ...templates.certificateReady({ name: volunteer.fullName }),
      attachments: [{ filename: `NayePankh-Certificate-${volunteer.volunteerIdNumber}.pdf`, content: pdf }],
    });

    if (req.query.download) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=certificate-${volunteer.volunteerIdNumber}.pdf`);
      return res.send(pdf);
    }
    res.json({ message: 'Certificate generated and emailed.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/volunteers/bulk-approve
exports.bulkApprove = async (req, res, next) => {
  try {
    const ids = req.body.ids || [];
    const volunteers = await Volunteer.find({ _id: { $in: ids }, isDeleted: false });
    for (const v of volunteers) {
      if (v.status === 'approved') continue;
      v.status = 'approved';
      v.approvedAt = new Date();
      if (!v.volunteerIdNumber) v.volunteerIdNumber = await generateVolunteerId();
      await v.save();
      await sendEmail({ to: v.email, ...templates.approved({ name: v.fullName, volunteerId: v.volunteerIdNumber }) });
    }
    res.json({ message: `${volunteers.length} volunteers processed.` });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/volunteers/:id  (soft delete, super_admin)
exports.remove = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!volunteer) return res.status(404).json({ message: 'Volunteer not found.' });
    await User.findByIdAndUpdate(volunteer.user, { isDeleted: true, isActive: false });
    res.json({ message: 'Volunteer deleted.' });
  } catch (err) {
    next(err);
  }
};
