const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('dotenv/config');
const jwt = require('jsonwebtoken');

const otpSchema = new Schema({
  otp: {
    type: Number,
    required: true
  },
  email: {
      type: String,
      required: true
  },
  createdAt: {type: Date, default: Date.now, expires: "5m"}
});

module.exports = mongoose.model('OTP', otpSchema);