const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['friendRequest','friendRequestAccepted','friendRequestRejected'], required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], required: true },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
