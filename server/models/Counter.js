const mongoose = require('mongoose');

// Used to generate sequential volunteer IDs per year (NP-YYYY-XXXX)
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "volunteer-2024"
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model('Counter', CounterSchema);
