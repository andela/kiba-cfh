/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FriendsSchema = new Schema({
  friendName: String,
  friendEmail: String,
  senderId: String
}, { strict: false, _id: true, versionKey: false });

const NotificationSchema = new Schema({
  created_on: { type: Date, default: Date.now },
  user: String,
  message: String,
  type: String,
  sender: String,
  link: String,
});

mongoose.model('Notification', NotificationSchema);
mongoose.model('Friends', FriendsSchema);
