const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Remove or make email optional
  email: { type: String, required: false }
});

module.exports = mongoose.model('User', userSchema);