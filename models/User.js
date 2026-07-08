const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // stored as bcrypt hash
  idProofPath: { type: String, required: true }, // path to uploaded file
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
