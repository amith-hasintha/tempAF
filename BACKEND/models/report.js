const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportType: {
    type: String,
    required: true,
  },
  timePeriod: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);