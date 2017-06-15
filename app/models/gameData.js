const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GameData = new Schema({
  gameID: String,
  gameOwner: String,
  gamePlayers: [],
  dateplayed: String,
  gameWinner: String,
  gameRounds: String
});

module.exports = mongoose.model('gameRecord', GameData);
