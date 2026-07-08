const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventName: { type: String, required: true },
  package: { type: String, required: true }, // e.g. "Basic", "Premium", "Deluxe"
  date: { type: String, required: true }, // stored as "YYYY-MM-DD" for easy grouping/counting
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);