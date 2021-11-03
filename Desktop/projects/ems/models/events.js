const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    creator: {
      type: Object,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('event', eventSchema);