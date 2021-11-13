const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('dotenv/config');
const jwt = require('jsonwebtoken');

const otpSchema = new Schema({
  otp: {
    type: String,
    required: true
  },
  email: {
      type: String,
      required: true
  },
  createdAt: {type: Date, default: Date.now(), expireAfterSeconds: 6000}
}, {timestamps: true});

module.exports = mongoose.model('OTP', otpSchema);