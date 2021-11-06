const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');

const eventSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true
    },
    imageUrl: [{
      type: String
    }],
    content: {
      type: String,
      trim: true,
      required: true
    },
    category: [{
      type: String,
      required: true
    }],
    venueORlink: {
      type: String,
      trim: true,
      required: true
    },
    city: {
      type: String,
      trim: true
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
      type: Number,
      trim: true,
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