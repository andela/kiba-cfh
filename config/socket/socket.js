const firebase = require('firebase');
let Game = require('./game');
let Player = require('./player');
require('console-stamp')(console, 'm/dd HH:MM:ss');
let mongoose = require('mongoose');
let User = mongoose.model('User');
const user = require(`${__dirname}/../../app/controllers/users.js`);
const Friend = require('../../app/controllers/friends');
let userId = {};

let avatars = require(`${__dirname  }/../../app/controllers/avatars.js`).all();
// Valid characters to use to generate random private game IDs
let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

const config = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASEURL,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID
};
firebase.initializeApp(config);

module.exports = (io) => {
  let game;
  let allGames = {};
  let allPlayers = {};
  let gamesNeedingPlayers = [];
  let gameID = 0;
  const onlineUsers = [];
  let chatMessages = [];
  this.invite = null;

  const database = firebase.database();

  io.sockets.on('connection', function (socket) {
    console.log(`${socket.id} Connected`);
    socket.emit('id', { id: socket.id });

    // initialize chat when a new socket is connected
    socket.emit('initializeChat', chatMessages);

    // send received chat message to all connected sockets
    socket.on('chat message', (chat) => {
      io.sockets.in(socket.gameID).emit('chat message', chat);
      socket.emit('onlineUsers', onlineUsers);
      chatMessages.push(chat);
      database.ref(`chat/${socket.gameID}`).set(chatMessages);
    });
    socket.on('pickCards', (data) => {
      console.log(socket.id, 'picked', data);
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickCards(data.cards, socket.id);
      } else {
        console.log('Received pickCard from', socket.id, 'but game does not appear to exist!');
      }
    });
    socket.on('send notification', (data, cb) => {
      io.sockets.emit('get notification', {
        reciever: data.reciever,
        recieverId: data.recieverId,
        link: data.link,
        message: `${data.sender} invites you to play a game`,
        count: 1
      });
      Friend.addNotification({
        reciever: data.recieverId,
        sender: data.sender,
        link: data.link
      }, (response) => {
        if (response.status === 'success') {
          cb(null, response);
        }
      }
    );
  });

    socket.on('pickWinning', (data) => {
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickWinning(data.card, socket.id);
      } else {
        console.log('Received pickWinning from', socket.id, 'but game does not appear to exist!');
      }
    });


    socket.on('joinGame', (data) => {
      if (!allPlayers[socket.id]) {
        joinGame(socket, data);
      }
    });

    socket.on('joinNewGame', (data) => {
      exitGame(socket);
      joinGame(socket, data);
    });

    socket.on('czarCardSelected', () => {
      allGames[socket.gameID].startNextRound(allGames[socket.gameID]);
    });
    socket.on('startGame', () => {
      if (allGames[socket.gameID]) {
        let thisGame = allGames[socket.gameID];
        console.log('comparing', thisGame.players[0].socket.id, 'with', socket.id);
        if (thisGame.players.length >= thisGame.playerMinLimit) {
          // Remove this game from gamesNeedingPlayers so new players can't join it.
          gamesNeedingPlayers.forEach((game, index) => {
            if (game.gameID === socket.gameID) {
              return gamesNeedingPlayers.splice(index, 1);
            }
          });
          thisGame.prepareGame();
          thisGame.sendNotification('The game has begun!');
        }
      }
    });

    socket.on('leaveGame', () => {
      exitGame(socket);
    });

    socket.on('disconnect', () => {
      console.log('Rooms on Disconnect ', io.sockets.manager.rooms);
      exitGame(socket);
    });
  });

  var joinGame = function (socket, data) {
    let player = new Player(socket);
    data = data || {};
    player.userID = data.userID || 'unauthenticated';
    if (data.userID !== 'unauthenticated') {
      User.findOne({
        _id: data.userID
      }).exec((err, user) => {
        if (err) {
          console.log('err', err);
          return err; // Hopefully this never happens.
        }
        if (!user) {
          // If the user's ID isn't found (rare)
          player.username = 'Guest';
          player.avatar = avatars[Math.floor(Math.random() * 4) + 12];
        } else {
          player.username = user.name;
          player.premium = user.premium || 0;
          player.avatar = user.avatar || avatars[Math.floor(Math.random() * 4) + 12];
        }
        getGame(player, socket, data.room, data.createPrivate);
      });
    } else {
      // If the user isn't authenticated (guest)
      player.username = 'Guest';
      player.avatar = avatars[Math.floor(Math.random() * 4) + 12];
      getGame(player, socket, data.room, data.createPrivate);
    }
  };

  var getGame = function (player, socket, requestedGameId, createPrivate) {
    requestedGameId = requestedGameId || '';
    createPrivate = createPrivate || false;
    console.log(socket.id, 'is requesting room', requestedGameId);
    if (requestedGameId.length && allGames[requestedGameId]) {
      console.log('Room', requestedGameId, 'is valid');
      let game = allGames[requestedGameId];
      // Ensure that the same socket doesn't try to join the same game
      // This can happen because we rewrite the browser's URL to reflect
      // the new game ID, causing the view to reload.
      // Also checking the number of players, so node doesn't crash when
      // no one is in this custom room.
      if (
        game.state === 'awaiting players' &&
        (!game.players.length || game.players[0].socket.id !== socket.id)
      ) {
        // Put player into the requested game
        console.log('Allowing player to join', requestedGameId);
        allPlayers[socket.id] = true;
        game.players.push(player);
        socket.join(game.gameID);
        socket.gameID = game.gameID;
        game.assignPlayerColors();
        game.assignGuestNames();
        game.sendUpdate();
        game.sendNotification(`${player.username} has joined the game!`);
        if (game.players.length >= game.playerMaxLimit) {
          gamesNeedingPlayers.shift();
          game.prepareGame();
        }
      } else {
        // TODO: Send an error message back to this user saying the game has already started
      }
    } else {
      // Put players into the general queue
      console.log('Redirecting player', socket.id, 'to general queue');
      if (createPrivate) {
        createGameWithFriends(player, socket);
      } else {
        fireGame(player, socket);
      }
    }
  };

  var fireGame = function (player, socket) {
    let game;
    if (gamesNeedingPlayers.length <= 0) {
      gameID += 1;
      let gameIDStr = gameID.toString();
      game = new Game(gameIDStr, io);
      allPlayers[socket.id] = true;
      game.players.push(player);
      allGames[gameID] = game;
      gamesNeedingPlayers.push(game);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      console.log(socket.id, 'has joined newly created game', game.gameID);
      game.assignPlayerColors();
      game.assignGuestNames();
      game.sendUpdate();
    } else {
      game = gamesNeedingPlayers[0];
      allPlayers[socket.id] = true;
      game.players.push(player);
      console.log(socket.id, 'has joined game', game.gameID);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      game.assignPlayerColors();
      game.assignGuestNames();
      game.sendUpdate();
      game.sendNotification(`${player.username} has joined the game!`);
      if (game.players.length >= game.playerMaxLimit) {
        gamesNeedingPlayers.shift();
        game.prepareGame();
      }
    }
  };

  var createGameWithFriends = function (player, socket) {
    let isUniqueRoom = false;
    let uniqueRoom = '';
    // Generate a random 6-character game ID
    while (!isUniqueRoom) {
      uniqueRoom = '';
      for (let i = 0; i < 6; i++) {
        uniqueRoom += chars[Math.floor(Math.random() * chars.length)];
      }
      if (!allGames[uniqueRoom] && !/^\d+$/.test(uniqueRoom)) {
        isUniqueRoom = true;
      }
    }
    console.log(socket.id, 'has created unique game', uniqueRoom);
    let game = new Game(uniqueRoom, io);
    allPlayers[socket.id] = true;
    game.players.push(player);
    allGames[uniqueRoom] = game;
    socket.join(game.gameID);
    socket.gameID = game.gameID;
    game.assignPlayerColors();
    game.assignGuestNames();
    game.sendUpdate();
  };

  var exitGame = function (socket) {
    console.log(socket.id, 'has disconnected');
    if (allGames[socket.gameID]) { // Make sure game exists
      let game = allGames[socket.gameID];
      console.log(socket.id, 'has left game', game.gameID);
      delete allPlayers[socket.id];
      if (game.state === 'awaiting players' ||
        game.players.length - 1 >= game.playerMinLimit) {
        game.removePlayer(socket.id);
      } else {
        game.stateDissolveGame();
        for (let j = 0; j < game.players.length; j++) {
          game.players[j].socket.leave(socket.gameID);
        }
        game.killGame();
        delete allGames[socket.gameID];
        chatMessages = [];
      }
      if (game.players.length === 1) {
        chatMessages = [];
        game.sendUpdate();
      }
    }
    socket.leave(socket.gameID);
  };
};

