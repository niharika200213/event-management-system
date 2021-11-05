const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    imageUrl: [{
      type: String
    }],
    content: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    venueORlink: {
      type: String,
      required: true
    },
    isOnline: {
      type: Boolean,
      required: true
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    time: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true,
      min: Date.now()
    },
    rate: {
      type: String,
      required: true
    },
    ratings: {
      type: Number,
      min: 0,
      max: 5
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('event', eventSchema);