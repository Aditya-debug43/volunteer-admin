const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');
const Report = require('../models/Report');
const { generateCSV } = require('../utils/generateCSV');
const { generateTablePDF } = require('../utils/generatePDF');

function dateFilter(query) {
  const f = {};
  if (query.from || query.to) {
    f.registeredAt = {};
    if (query.from) f.registeredAt.$gte = new Date(query.from);
    if (query.to) f.registeredAt.$lte = new Date(query.to);
  }
  return f;
}

// Build volunteer registration report rows
async function volunteerRows(query) {
  const filter = { isDeleted: false, ...dateFilter(query) };
  if (query.city) filter.city = query.city;
  if (query.status) filter.status = query.status;
  if (query.affiliationType) filter.affiliationType = query.affiliationType;
  if (query.causeArea) filter.causeAreas = query.causeArea;
  const docs = await Volunteer.find(filter).sort({ registeredAt: -1 });
  return docs.map((v) => ({
    volunteerId: v.volunteerIdNumber || 'Not assigned',
    fullName: v.fullName,
    email: v.email,
    phone: v.phone,
    city: v.city,
    affiliation: v.affiliationType,
    causeAreas: (v.causeAreas || []).join('; '),
    skills: (v.skills || []).join('; '),
    registeredAt: new Date(v.registeredAt).toLocaleDateString('en-IN'),
    status: v.status,
    approvedAt: v.approvedAt ? new Date(v.approvedAt).toLocaleDateString('en-IN') : '',
    totalHours: v.totalHoursLogged,
    totalEvents: v.totalEventsAttended,
  }));
}

// GET /api/reports/volunteers
exports.volunteers = async (req, res, next) => {
  try {
    const rows = await volunteerRows(req.query);
    res.json({ data: rows.slice(0, Number(req.query.limit) || 10), total: rows.length });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/volunteers/csv
exports.volunteersCSV = async (req, res, next) => {
  try {
    const rows = await volunteerRows(req.query);
    const header = [
      { id: 'volunteerId', title: 'Volunteer ID' },
      { id: 'fullName', title: 'Full Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'city', title: 'City' },
      { id: 'affiliation', title: 'Affiliation' },
      { id: 'causeAreas', title: 'Cause Areas' },
      { id: 'skills', title: 'Skills' },
      { id: 'registeredAt', title: 'Registered On' },
      { id: 'status', title: 'Status' },
      { id: 'approvedAt', title: 'Approved On' },
      { id: 'totalHours', title: 'Total Hours' },
      { id: 'totalEvents', title: 'Total Events' },
    ];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=volunteers-report.csv');
    res.send(generateCSV(header, rows));
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/volunteers/pdf
exports.volunteersPDF = async (req, res, next) => {
  try {
    const rows = await volunteerRows(req.query);
    const pdf = await generateTablePDF({
      title: 'Volunteer Registration Report',
      subtitle: `Generated ${new Date().toLocaleDateString('en-IN')}`,
      summary: `Showing ${rows.length} records`,
      columns: [
        { header: 'ID', key: 'volunteerId', width: 90 },
        { header: 'Name', key: 'fullName', width: 120 },
        { header: 'Email', key: 'email', width: 150 },
        { header: 'City', key: 'city', width: 80 },
        { header: 'Affiliation', key: 'affiliation', width: 110 },
        { header: 'Status', key: 'status', width: 70 },
        { header: 'Hours', key: 'totalHours', width: 50 },
        { header: 'Events', key: 'totalEvents', width: 50 },
      ],
      rows,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=volunteers-report.pdf');
    res.send(pdf);
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/city-summary
exports.citySummary = async (req, res, next) => {
  try {
    const data = await Volunteer.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$city',
          totalRegistered: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          totalHours: { $sum: '$totalHoursLogged' },
          totalEvents: { $sum: '$totalEventsAttended' },
        },
      },
      { $sort: { totalRegistered: -1 } },
    ]);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/cause-impact
exports.causeImpact = async (req, res, next) => {
  try {
    const data = await Volunteer.aggregate([
      { $match: { isDeleted: false } },
      { $unwind: '$causeAreas' },
      {
        $group: {
          _id: '$causeAreas',
          volunteerCount: { $sum: 1 },
          totalHours: { $sum: '$totalHoursLogged' },
        },
      },
      { $sort: { volunteerCount: -1 } },
    ]);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/saved
exports.saved = async (req, res, next) => {
  try {
    const data = await Report.find().sort({ createdAt: -1 }).limit(50).populate('generatedBy', 'name');
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

// POST /api/reports/save
exports.save = async (req, res, next) => {
  try {
    const report = await Report.create({ ...req.body, generatedBy: req.user._id });
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
};
