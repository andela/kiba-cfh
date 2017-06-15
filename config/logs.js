const mongoose = require('mongoose');

const GameRecord = mongoose.model('gameRecord');
const User = mongoose.model('User');

module.exports = {
  getHistory: (req, res) => {
    if (req.user) {
      GameRecord.find({ gameOwner: req.user.name }, (error, games) => {
        res.jsonp({ result: games });
      });
    } else {
      res.status(401).json({ message: 'User not signed in' });
    }
  },
  getLeaderBoard: (req, res) => {
    if (req.user) {
      GameRecord.find({}, 'gameWinner', (error, game) => {
        res.jsonp({ result: game });
      });
    } else {
      res.status(401).json({ message: 'User not signed in' });
    }
  },
  getDonations: (req, res) => {
    if (req.user) {
      User.find({ name: req.user.name }, (error, user) => {
        res.jsonp({ result: user[0].donations });
      });
    } else {
      res.status(401).json({ message: 'User not signed in' });
    }
  }
};
