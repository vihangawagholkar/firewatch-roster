const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: String,
  rank: String,
  battery: String,
  phone: String,
  leaves: [String],  // Store leave dates as ISO strings
});

module.exports = mongoose.model('Employee', employeeSchema);