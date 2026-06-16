const Counter = require('../models/Counter');

// Generates NP-YYYY-XXXX with a per-year sequential counter
async function generateVolunteerId(year = new Date().getFullYear()) {
  const counter = await Counter.findOneAndUpdate(
    { _id: `volunteer-${year}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const padded = String(counter.seq).padStart(4, '0');
  return `NP-${year}-${padded}`;
}

module.exports = { generateVolunteerId };
