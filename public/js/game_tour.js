/* global introJs */
angular.module('mean.system', )
  .controller('GameTourController', ['$scope', 'game', '$window', '$cookies', function ($scope, game, $window, $cookies) {
    $scope.game = game;
    $scope.$on('$locationChangeSuccess', () => {
      if ($scope.gameTour) {
        $scope.gameTour.exit();
      }
    });
    $scope.gameTour = introJs();
    $scope.awaitingPlayers = true;
    $scope.showQuestion = false;
    $scope.showAnswer = false;
    $scope.Time = false;
    $scope.gameOver = false;
    $scope.gameTour.setOption('showBullets', true);
    $scope.gameTour.setOptions({
      steps: [{
        intro: 'Welcome to the game Cards for Humanity, You want to rock this game then you need to learn the game, ride with me to play like me.'
      },
      {
        element: '#finding-players',
        intro: 'Game needs a minimum of 3 players to start. You have to wait for the minimum number of players to join the game.'
      },
      {
        element: '#isPlayer',
        intro: 'This is you, that icon to help you identify yourself amongst other players.'
      },
      {
        element: '#startButton',
        intro: 'Once the minimum required players have joined, you or any other user can start the game by clicking on the start game button.'
      },
      {
        element: '#inviteButton',
        intro: 'Invite other players to join you in the game'
      },
      {
        element: '#question',
        intro: 'Once a game is started, a question is displayed.'
      },
      {
        element: '#cards',
        intro: 'You also have different answer cards to pick what you deem the most appropriate answer to the question.',
        position: 'top'
      },
      {
        element: '#inner-timer-container',
        intro: 'Choose an answer to the current question. After time out, CZAR then select a favorite answer. whoever submitted CZARs favorite answer wins the round.'
      },
      {
        element: '#show-czar',
        intro: 'Check the CZAR icon to know the next CZAR. As a Czar, you wait for all players to submit their answers after which you select your favorite answer'
      },
      {
        element: '#gameover',
        intro: 'After a game ends, you can join a new a game or return to Lobby',
        position: 'top'
      },
      {
        element: '#charity-widget-container',
        intro: 'Click here to donate to charity at the end of the game.',
        position: 'right'
      },
      {
        element: '#abandon-game-button',
        intro: 'You can click this icon to abandon a game at any time.'
      },
      {
        element: '#chatbox',
        intro: 'You can chat here with other users anytime.',
        position: 'top'
      },
      {
        element: '#home',
        intro: 'Now you the boss!!! Talk is cheap, start a new game now!!!',
        position: 'bottom'
      }
      ]
    });

    const isGameCustom = () => {
      const custom = $window.location.href.indexOf('custom') >= 0;
      return (custom);
    };

    const tourComplete = () => {
      const location = $cookies.get('location');
      if (location) {
        $window.location = location;
        $cookies.remove('location');
      } else {
        $window.location = '#!/';
      }
    };

    const beforeTourChange = (targetElement) => {
      switch (targetElement.id) {
        case 'finding-players':
          {
            $scope.$apply(() => {
              $scope.awaitingPlayers = true;
              $scope.showQuestion = false;
              $scope.showAnswer = false;
              $scope.Time = false;
            });
            break;
          }
        case 'isPlayer':
          {
            $scope.$apply(() => {
              $scope.awaitingPlayers = true;
              $scope.showQuestion = false;
              $scope.showAnswer = false;
              $scope.Time = false;
            });
            break;
          }
        case 'player-score':
          {
            $scope.$apply(() => {
              $scope.awaitingPlayers = true;
            });
            break;
          }
        case 'startButton':
          {
            $scope.$apply(() => {
              $scope.awaitingPlayers = true;
              $scope.showQuestion = false;
              $scope.showAnswer = false;
              $scope.Time = false;
            });
            break;
          }
        case 'inviteButton':
          {
            $scope.$apply(() => {
              $scope.awaitingPlayers = true;
              $scope.showQuestion = false;
              $scope.showAnswer = false;
              $scope.Time = false;
            });
            break;
          }
        case 'question':
          {
            $scope.$apply(() => {
              $scope.awaitingPlayers = false;
              $scope.showQuestion = true;
              $scope.showAnswer = true;
              $scope.Time = true;
            });
            break;
          }
        case 'cards':
          {
            $scope.$apply(() => {
              $scope.showAnswer = true;
              $scope.Time = true;
            });
            break;
          }
        case 'inner-timer-container':
          {
            $scope.$apply(() => {
              $scope.showQuestion = true;
              $scope.showQuestion = true;
              $scope.Time = true;
            });
            break;
          }
        case 'show-czar':
          {
            $scope.$apply(() => {
              $scope.gameOver = false;
              $scope.awaitingPlayers = false;
              $scope.Time = true;
              $scope.showQuestion = true;
              $scope.showAnswer = true;
            });
            break;
          }
        case 'gameover':
          {
            $scope.$apply(() => {
              $scope.showQuestion = false;
              $scope.showAnswer = false;
              $scope.Time = false;
              $scope.gameOver = true;
            });
            break;
          }
        default:
          {
            break;
          }
      }
    };

    $scope.gameTour.start()
      .oncomplete(tourComplete)
      .onexit(tourComplete)
      .onbeforechange(beforeTourChange);
  }]);
