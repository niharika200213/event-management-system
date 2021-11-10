const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const event = require('./events');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
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
  isVerified: {
    type: Boolean,
    default: false
  },
  isCreator: {
    type: Boolean,
    default: true
  },
  event: [
    {
      type: Schema.Types.ObjectId,
      ref: 'event'
    }
  ],
  bookmarked: [
    {
      type: Schema.Types.ObjectId,
      ref: 'event'
    }
  ],
  registeredEvents: [
    {
      type: Schema.Types.ObjectId,
      ref: 'event'
    }
  ],
  ratedEvents: [
    {
      type: Schema.Types.ObjectId,
      ref: 'event'
    }
  ]
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);