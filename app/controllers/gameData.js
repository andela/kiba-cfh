const mongoose = require('mongoose');

const GameData = mongoose.model('gameRecord');

exports.gameData = (req, res) => {
  const gameID = req.body.gameID,
    gameOwner = req.body.gameOwner,
    gameWinner = req.body.gameWinner,
    dateplayed = req.body.dateplayed,
    gamePlayers = req.body.gamePlayers,
    gameRounds = req.body.gameRounds,
    record = new GameData({
      gameID,
      gameOwner,
      gameWinner,
      gamePlayers,
      dateplayed,
      gameRounds
    });
  record.save((err, savedGameObject) => {
    if (err) {
      res.jsonp({ status: 503 });
    } else {
      res
        .status(200)
        .send(`game record saved successfully ${savedGameObject}`);
    }
  });
};
