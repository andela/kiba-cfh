angular.module('mean.system')
  .controller('GameController', ['$scope', 'game', '$http', '$q', '$timeout', '$location', 'MakeAWishFactsService', '$dialog', ($scope, game, $http, $q, $timeout, $location, MakeAWishFactsService, $dialog) => {
    $scope.hasPickedCards = false;
    $scope.winningCardPicked = false;
    $scope.showTable = false;
    $scope.modalShown = false;
    $scope.hasEnoughPlayers = false;
    $scope.game = game;
    $scope.pickedCards = [];
    const makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
    $scope.makeAWishFact = makeAWishFacts.pop();

    $scope.pickCard = (card) => {
      if (!$scope.hasPickedCards) {
        if ($scope.pickedCards.indexOf(card.id) < 0) {
          $scope.pickedCards.push(card.id);
          if (game.curQuestion.numAnswers === 1) {
            $scope.sendPickedCards();
            $scope.hasPickedCards = true;
          } else if (
            game.curQuestion.numAnswers === 2 && $scope.pickedCards.length === 2
          ) {
            // delay and send
            $scope.hasPickedCards = true;
            $timeout($scope.sendPickedCards, 300);
          }
        } else {
          $scope.pickedCards.pop();
        }
      }
    };

    $scope.pointerCursorStyle = () => {
      if ($scope.isCzar() && $scope.game.state === 'waiting for czar to decide') {
        return { 'cursor': 'pointer' };
      } else {
        return {};
      }
    };

    $scope.sendPickedCards = () => {
      game.pickCards($scope.pickedCards);
      $scope.showTable = true;
    };

    $scope.cardIsFirstSelected = (card) => {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[0];
      }
      return false;
    };

    $scope.cardIsSecondSelected = (card) => {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[1];
      }
      return false;
    };

    $scope.firstAnswer = ($index) => {
      if ($index % 2 === 0 && game.curQuestion.numAnswers > 1) {
        return true;
      } else {
        return false;
      }
    };

    $scope.secondAnswer = ($index) => {
      if ($index % 2 === 1 && game.curQuestion.numAnswers > 1) {
        return true;
      } else {
        return false;
      }
    };

    $scope.showFirst = (card) => {
      console.log(card);
      console.log(game.players);
      return (
        game.curQuestion.numAnswers > 1 && $scope.pickedCards[0] === card.id
      );
    };

    $scope.showSecond = card => (
        game.curQuestion.numAnswers > 1 && $scope.pickedCards[1] === card.id
      );

    $scope.isCzar = () => game.czar === game.playerIndex;

    $scope.isPlayer = $index => $index === game.playerIndex;

    $scope.isCustomGame = () => !(/^\d+$/).test(game.gameID)
      && game.state === 'awaiting players';

    $scope.isPremium = $index => game.players[$index].premium;

    $scope.currentCzar = $index => $index === game.czar;

    $scope.winningColor = ($index) => {
      if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
        return $scope.colors[game.players[game.winningCardPlayer].color];
      }
      return '#f9f9f9';
    };

    $scope.pickWinning = (winningSet) => {
      if ($scope.isCzar()) {
        game.pickWinning(winningSet.card[0]);
        $scope.winningCardPicked = true;
      }
    };

    $scope.winnerPicked = () => game.winningCard !== -1;

    $scope.abandonGame = () => {
      game.leaveGame();
      $location.path('/');
    };
    $scope.getFriends = () => {
      $http({
        method: 'GET',
        url: `/friend/${window.user._id}`,
        header: { 'Content-Type': 'application/json' }
      }).then((response) => {
        $scope.friendList = response.data;
        console.log($scope.friendList, 'friends');
      });
    };
    $scope.removeFriend = (friend) => {
      $http({
        method: 'DELETE',
        url: `/friend/${friend}`,
      })
        .then((response) => {
          $scope.getFriends();
        })
        .catch(error => error);

    };
    $scope.shuffleCards = () => {
      const card = $(`#${event.target.id}`);
      card.addClass('animated flipOutY');
      setTimeout(() => {
        $scope.startNextRound();
        card.removeClass('animated flipOutY');
        $('#shuffleModal').modal('close');
      }, 500);
    };

    $scope.startNextRound = () => {
      if ($scope.isCzar()) {
        game.startNextRound();
      }
    };
    // Catches changes to round to update when no players pick card
    // (because game.state remains the same)

    $scope.$watch('game.round', () => {
      $scope.hasPickedCards = false;
      $scope.showTable = false;
      $scope.winningCardPicked = false;
      $scope.makeAWishFact = makeAWishFacts.pop();
      if (!makeAWishFacts.length) {
        makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
      }
      $scope.pickedCards = [];
    });


    // In case player doesn't pick a card in time, show the table
    $scope.$watch('game.state', () => {
      if (game.state === 'waiting for czar to decide' && $scope.showTable === false) {
        $scope.showTable = true;
      }
      if ($scope.isCzar() && game.state === 'czar pick card' && game.table.length === 0) {
        $('#shuffleModal').modal({
          dismissible: false
        });
        $('#shuffleModal').modal('open');
      }
      if (game.state === 'game dissolved') {
        $('#shuffleModal').modal('close');
      }
      if ($scope.isCzar() === false && game.state === 'czar pick card'
        && game.state !== 'game dissolved'
        && game.state !== 'awaiting players' && game.table.length === 0) {
        $scope.czarHasDrawn = 'Wait! Czar is drawing Card';
      }
      if (game.state !== 'czar pick card'
        && game.state !== 'awaiting players'
        && game.state !== 'game dissolve') {
        $scope.czarHasDrawn = '';
      }
    });


    $scope.$watch('game.gameID', () => {
      if (game.gameID && game.state === 'awaiting players') {
        if (!$scope.isCustomGame() && $location.search().game) {
          // If the player didn't successfully enter the request room,
          // reset the URL so they don't think they're in the requested room.
          $location.search({});
        } else if ($scope.isCustomGame() && !$location.search().game) {
          // Once the game ID is set, update the URL if this is a game with friends,
          // where the link is meant to be shared.
          $location.search({ game: game.gameID });
          if (!$scope.modalShown) {

            setTimeout(() => {
              var link = document.URL;
              var txt ='Give the following link to your friends so they can join your game: ';
              $('#lobby-how-to-play').text(txt);
              $('#oh-el').css({
                'text-align': 'center',
                'font-size': '22px',
                background: 'white',
                color: 'black'
              })
                .text(link);
            }, 200);
            $scope.modalShown = true;
          }
        }
      }
    });
    $scope.showModal = () => {
      if (game.players.length < game.playerMinLimit) {
        $('.modal').modal({
          opacity: 0.9,
          startingTop: '50%',
        });
      }
      if (game.players.length >= game.playerMinLimit && game.players.length <
        game.playerMaxLimit) {
        $scope.hasEnoughPlayers = true;
        $scope.startGame();
      }
    };

    if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
      console.log('joining custom game');
      game.joinGame('joinGame', $location.search().game);
    } else if ($location.search().custom) {
      game.joinGame('joinGame', null, true);
    } else {
      game.joinGame();
    }
    $scope.notificationModal = () => {
      $('#notificationModal').modal();
    };

    $http.get('/region.json')
      .then((res) => {
        $scope.regions = res.data;
      });

    $scope.findQuestions = region =>
      $http({
        method: 'POST',
        url: `/api/questions/${region}`
      });

    $scope.findAnswers = region =>
      $http({
        method: 'POST',
        url: `/api/answers/${region}`
      });

    $scope.startGame = () => {
      $('.modal').modal();
      $scope.beginGame = (regionId) => {
        $q
            .all([$scope.findQuestions(regionId), $scope.findAnswers(regionId)])
            .then((response) => {
              console.log(response);
              game.startGame();
            });
      };
    };
    $scope.selectOption = {
      'display': 'block',
    };
  }]);
