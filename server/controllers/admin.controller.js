const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');
const Attendance = require('../models/Attendance');
const AuditLog = require('../models/AuditLog');
const sendEmail = require('../utils/sendEmail');

// GET /api/admin/stats — dashboard overview
exports.stats = async (req, res, next) => {
  try {
    const cityScope =
      req.user.role === 'city_coordinator' && req.user.assignedCity
        ? { city: req.user.assignedCity }
        : {};
    const base = { isDeleted: false, ...cityScope };
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalVolunteers,
      newThisMonth,
      pending,
      activeVolunteers,
      totalEvents,
      hoursAgg,
      beneficiariesAgg,
      byCity,
      byCause,
      byStatus,
    ] = await Promise.all([
      Volunteer.countDocuments(base),
      Volunteer.countDocuments({ ...base, registeredAt: { $gte: startOfMonth } }),
      Volunteer.countDocuments({ ...base, status: 'pending' }),
      Volunteer.countDocuments({ ...base, status: 'approved', updatedAt: { $gte: thirtyDaysAgo } }),
      Event.countDocuments({ isDeleted: false, ...cityScope }),
      Volunteer.aggregate([{ $match: base }, { $group: { _id: null, hours: { $sum: '$totalHoursLogged' } } }]),
      Event.aggregate([{ $match: { isDeleted: false, ...cityScope } }, { $group: { _id: null, served: { $sum: '$beneficiariesServed' } } }]),
      Volunteer.aggregate([{ $match: base }, { $group: { _id: '$city', count: { $sum: 1 } } }]),
      Volunteer.aggregate([{ $match: base }, { $unwind: '$causeAreas' }, { $group: { _id: '$causeAreas', count: { $sum: 1 } } }]),
      Volunteer.aggregate([{ $match: base }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    res.json({
      totalVolunteers,
      newThisMonth,
      pending,
      activeVolunteers,
      totalEvents,
      totalHours: hoursAgg[0]?.hours || 0,
      beneficiariesServed: beneficiariesAgg[0]?.served || 0,
      byCity,
      byCause,
      byStatus,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/pending
exports.pending = async (req, res, next) => {
  try {
    const filter = { isDeleted: false, status: 'pending' };
    if (req.user.role === 'city_coordinator' && req.user.assignedCity) filter.city = req.user.assignedCity;
    const volunteers = await Volunteer.find(filter).sort({ registeredAt: -1 }).limit(50);
    res.json(volunteers);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/registrations-trend — last 12 months
exports.registrationsTrend = async (req, res, next) => {
  try {
    const match = { isDeleted: false };
    if (req.query.city && req.query.city !== 'all') match.city = req.query.city;
    const since = new Date();
    since.setMonth(since.getMonth() - 11);
    since.setDate(1);
    match.registeredAt = { $gte: since };

    const trend = await Volunteer.aggregate([
      { $match: match },
      { $group: { _id: { y: { $year: '$registeredAt' }, m: { $month: '$registeredAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]);
    res.json(trend);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/send-email — broadcast to a recipient group
exports.sendBroadcast = async (req, res, next) => {
  try {
    const { group, city, causeArea, customEmails, subject, body } = req.body;
    let recipients = [];

    if (group === 'custom' && customEmails) {
      recipients = customEmails.split(',').map((e) => e.trim()).filter(Boolean);
    } else {
      const filter = { isDeleted: false };
      if (group === 'active') filter.status = 'approved';
      if (group === 'pending') filter.status = 'pending';
      if (group === 'city' && city) filter.city = city;
      if (group === 'cause' && causeArea) filter.causeAreas = causeArea;
      if (group === 'inactive') filter.totalHoursLogged = 0;
      const volunteers = await Volunteer.find(filter).select('email fullName');
      recipients = volunteers.map((v) => ({ email: v.email, name: v.fullName }));
    }

    // Send (merge tags resolved per recipient)
    await Promise.all(
      recipients.map((r) => {
        const email = typeof r === 'string' ? r : r.email;
        const html = (body || '').replace(/\{volunteer_name\}/g, typeof r === 'string' ? '' : r.name || '');
        return sendEmail({ to: email, subject, html });
      })
    );

    await AuditLog.create({
      admin: req.user._id,
      adminName: req.user.name,
      action: 'BROADCAST_EMAIL',
      details: { group, subject, count: recipients.length },
    });

    res.json({ message: `Broadcast sent to ${recipients.length} recipients.` });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/logs (super_admin)
exports.logs = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 50);
    const [data, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      AuditLog.countDocuments(),
    ]);
    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};
