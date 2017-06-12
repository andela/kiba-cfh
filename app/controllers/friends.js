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
        console.log(notificationMessage, 'message');
        return res.json(notificationMessage);
      }
      return res.json(err);
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
        console.log('friend', friends);
        res.jsonp({ status: 'error', message: 'friend already exists' });
      } else {
        console.log('no friend', friends);
        newFriend.save((error) => {
          if (!error) {
            res.jsonp({ status: 'success', message: 'new friend added!' });
          } else {
            throw error;
          }
        });
      }
    });
};

exports.getFriend = (req, res) => {
  const friend = req.params.id;
  Friends.find({senderId: friend })
    .exec((err, friendList) => {
      if (friendList) {
        const friendAlert = friendList;
        return res.json(friendAlert);
      }
      return res.json(err);
    });
};
