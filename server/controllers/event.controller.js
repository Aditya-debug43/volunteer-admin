const Event = require('../models/Event');
const Volunteer = require('../models/Volunteer');
const Attendance = require('../models/Attendance');
const sendEmail = require('../utils/sendEmail');
const templates = require('../utils/emailTemplates');

// GET /api/events  (filters + pagination)
exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const filter = { isDeleted: false };
    if (req.query.city) filter.city = req.query.city;
    if (req.query.causeArea) filter.causeArea = req.query.causeArea;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.mode) filter.mode = req.query.mode;

    const [data, total] = await Promise.all([
      Event.find(filter).sort({ startDate: 1 }).skip((page - 1) * limit).limit(limit)
        .populate('coordinatedBy', 'name'),
      Event.countDocuments(filter),
    ]);
    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/events/:id
exports.getOne = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('coordinatedBy', 'name email');
    if (!event || event.isDeleted) return res.status(404).json({ message: 'Event not found.' });
    res.json(event);
  } catch (err) {
    next(err);
  }
};

// POST /api/events
exports.create = async (req, res, next) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

// PUT /api/events/:id
exports.update = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json(event);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/events/:id  (soft cancel)
exports.remove = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { status: 'cancelled', isDeleted: true }, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ message: 'Event cancelled.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/events/:id/register  (volunteer self-registers)
exports.register = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || event.isDeleted) return res.status(404).json({ message: 'Event not found.' });

    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer) return res.status(400).json({ message: 'No volunteer profile found.' });
    if (volunteer.status !== 'approved') return res.status(403).json({ message: 'Only approved volunteers can register.' });

    if (event.maxVolunteers && event.registeredVolunteers.length >= event.maxVolunteers) {
      return res.status(409).json({ message: 'This event is full.' });
    }
    if (event.registeredVolunteers.some((id) => String(id) === String(volunteer._id))) {
      return res.status(409).json({ message: 'Already registered for this event.' });
    }

    event.registeredVolunteers.push(volunteer._id);
    await event.save();
    await Attendance.findOneAndUpdate(
      { event: event._id, volunteer: volunteer._id },
      { status: 'registered' },
      { upsert: true, new: true }
    );

    await sendEmail({
      to: volunteer.email,
      ...templates.eventRegistered({
        name: volunteer.fullName,
        eventName: event.title,
        date: new Date(event.startDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        venue: event.venue,
      }),
    });

    res.json({ message: 'Registered for event.' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/events/:id/register  (cancel registration)
exports.cancelRegistration = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    const volunteer = await Volunteer.findOne({ user: req.user._id });
    event.registeredVolunteers = event.registeredVolunteers.filter((id) => String(id) !== String(volunteer._id));
    await event.save();
    await Attendance.findOneAndDelete({ event: event._id, volunteer: volunteer._id, status: 'registered' });
    res.json({ message: 'Registration cancelled.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/events/:id/volunteers
exports.eventVolunteers = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate({
      path: 'registeredVolunteers',
      select: 'fullName phone city skills status profilePhoto',
    });
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json(event.registeredVolunteers);
  } catch (err) {
    next(err);
  }
};

// PUT /api/events/:id/attendance  (mark attendance, log hours)
exports.markAttendance = async (req, res, next) => {
  try {
    const { records } = req.body; // [{ volunteerId, status, checkInTime, checkOutTime, hoursLogged }]
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    for (const r of records) {
      const computedHours =
        r.hoursLogged != null
          ? Number(r.hoursLogged)
          : r.checkInTime && r.checkOutTime
          ? Math.max(0, (new Date(r.checkOutTime) - new Date(r.checkInTime)) / 36e5)
          : 0;

      const prev = await Attendance.findOne({ event: event._id, volunteer: r.volunteerId });
      const prevHours = prev?.status === 'attended' ? prev.hoursLogged || 0 : 0;

      await Attendance.findOneAndUpdate(
        { event: event._id, volunteer: r.volunteerId },
        {
          status: r.status,
          checkInTime: r.checkInTime,
          checkOutTime: r.checkOutTime,
          hoursLogged: r.status === 'attended' ? computedHours : 0,
          markedBy: req.user._id,
        },
        { upsert: true, new: true }
      );

      // Adjust volunteer aggregates
      const volunteer = await Volunteer.findById(r.volunteerId);
      if (volunteer) {
        if (r.status === 'attended') {
          volunteer.totalHoursLogged += computedHours - prevHours;
          if (!prev || prev.status !== 'attended') volunteer.totalEventsAttended += 1;
          if (!event.confirmedAttendees.some((id) => String(id) === String(volunteer._id))) {
            event.confirmedAttendees.push(volunteer._id);
          }
        } else if (prev?.status === 'attended') {
          volunteer.totalHoursLogged = Math.max(0, volunteer.totalHoursLogged - prevHours);
          volunteer.totalEventsAttended = Math.max(0, volunteer.totalEventsAttended - 1);
        }
        await volunteer.save();
      }
    }
    await event.save();
    res.json({ message: 'Attendance saved.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/events/:id/remind
exports.sendReminder = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('registeredVolunteers', 'fullName email');
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    await Promise.all(
      event.registeredVolunteers.map((v) =>
        sendEmail({
          to: v.email,
          ...templates.eventRegistered({
            name: v.fullName,
            eventName: event.title,
            date: new Date(event.startDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            venue: event.venue,
          }),
        })
      )
    );
    res.json({ message: `Reminder sent to ${event.registeredVolunteers.length} volunteers.` });
  } catch (err) {
    next(err);
  }
};
