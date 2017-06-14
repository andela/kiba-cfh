const mongoose = require('mongoose');
const Notification = mongoose.model('Notification');
const Friends = mongoose.model('Friends');

exports.addNotification = (req, callback) => {
  const newNotification = new Notification({
    user: req.body.reciever,
    message: `${req.body.sender} invites you to play a game.`,
    type: 'invite',
    sender: req.body.sender,
    link: req.body.link
  });
  newNotification.save((err) => {
    if (!err) {
      callback.jsonp({ status: 'success', message: 'notification is saved' });
    } else {
      throw err;
    }
  });
};

exports.getNotification = (req, res) => {
  const notification = req.params.id;
  Notification.find({ user: notification })
    .exec((err, notificationAlert) => {
      if (notificationAlert) {
        const notificationMessage = notificationAlert;
        return res.json(notificationMessage);
      }
      return res.json(err);
    });
};
exports.deleteNotification = (req, res) => {
  const notification = req.params.id;
  Notification.findByIdAndRemove({ _id: notification })
    .exec((error) => {
      if (!error) {
        return res.json({ success: true, message: 'Notification deleted successfully' });
      }
      return res.json(error);
    });
};

exports.addFriend = (req, res) => {
  const newFriend = new Friends({
    friendName: req.body.name,
    friendEmail: req.body.email,
    senderId: req.body.senderId
  });
  Friends.find({ senderId: req.body.senderId, friendEmail: req.body.email })
    .exec((err, friends) => {
      if (friends.length) {
        res.jsonp({ status: 'error', message: 'friend already exists' });
      } else {
        newFriend.save((error) => {
          if (!error) {
            res.jsonp({ status: 'success', message: `${friends} added to list!` });
          } else {
            throw error;
          }
        });
      }
    });
};

exports.getFriend = (req, res) => {
  const friend = req.params.id;
  Friends.find({ senderId: friend })
    .exec((err, friendList) => {
      if (friendList) {
        const friendAlert = friendList;
        return res.json(friendAlert);
      }
      return res.json(err);
    });
};

exports.deleteFriend = (req, res) => {
  const friend = req.params.id;
  Friends.findByIdAndRemove({ _id: friend })
    .exec((error) => {
      if (!error) {
        return res.json({ success: true, message: 'Friend deleted successfully' });
      }
      return res.json(error);
    });
};
