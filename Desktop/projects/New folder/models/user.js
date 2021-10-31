const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('dotenv/config');
const jwt = require('jsonwebtoken');
const { Timestamp } = require('bson');

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  isVarified: {
    type: Boolean
  },
  event: [
    {
      type: Schema.Types.ObjectId,
      ref: 'event'
    }
  ]
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);