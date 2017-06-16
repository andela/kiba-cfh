angular.module('mean.system')
  .controller('InviteController', ['$scope','socket', 'game', '$http', 'toastr',
    ($scope, socket, game, $http, toastr) => {
      $scope.searchUsers = '';
    /**
     * Get all the users from the database
     * @return {void}
     */
      $scope.openModal = () => {
        $('#invitePlayersModal').modal();
      };

      $scope.disabled = false;
      $scope.invitedEmailList = [];
      $scope.invitedList = [];
      $scope.getUserId = str => (str.replace(/[^\w-]/g, '-'));

    /**
     * This function adds a user to an array of users to be invited.
     * @param {object} user, receives a user object from the database
     * @return {void}
     */
      const addUser = (user) => {
        let mail = {};
        const lengthOfPlayers = 11;
        mail.name = user.name;
        mail.email = user.email;
        if ($scope.invitedEmailList.length <= lengthOfPlayers - 1) {
          $scope.invitedEmailList.push(user.email);

          $scope.invitedList.push(mail);
          mail = {};
        } else {
          $scope.disabled = true;
          toastr.error('You can only invite 11 players.');
        }
      };

      /**
       * This function sends an in-app notification to user's friends.
       * @param {object} user
       *  @return {response}, response gotten from server
       */
      $scope.sendNotification = (user) => {
        socket.emit('send notification', {
          reciever: user.name,
          link: document.URL,
          sender: game.players[0].username,
          recieverId: user._id,
        });
      };

      /**
       * This function opens the modal for sending notifications.
       * @return {void}
       */
      $scope.notificationModal = () => {
        $('#notificationModal').modal();
      };

      /**
       * This function checks if friend is already in friend list
       * @param {object} friend
       * @return {boolean} true/false
       */
      $scope.existingFriend = (friend) => {
        return $scope.friendList.indexOf(friend) === -1;
      };
      /**
       * This function adds users as friends
       * @param {object} friend
       * @return {object} response from server
       */
      $scope.addFriend = (friend) => {
        $scope.friends = [];
        $http({
          method: 'POST',
          url: '/friend',
          header: { 'Content-Type': 'application/json' },
          data: {
            name: friend.name,
            email: friend.email,
            senderId: window.user._id,
          }
        }).then((response) => {
          $scope.showButton = false;
          return response;
        });
      };

      /**
       * This function checks if the user is already a friend
       * @param {string} email
       * @return {boolean} true/false
       */
      $scope.isFriend = (email) => {
        for (let i = 0; i < $scope.friendList.length; i += 1) {
          if ($scope.friendList.length && $scope.friendList[i].friendEmail === email) {
            return true;
          }
        }
        return false;
      };

    /**
     * This function checks if the user is not present in the list
     * @param{user} user
     * @return{void}
     */
      $scope.isUserInInviteeList = (user) => {
        if ($scope.invitedEmailList.indexOf(user.email) === -1) {
          addUser(user);
        }
      };
      $scope.notificationModal = () => {
        $('#notificationModal').modal();
      };

    /**
     * This function checks for existing user in the invited email list array
     * invitees and disables the add button for that user
     * @param{user} user
     * @return{void} void
     */
      $scope.existingUser = user =>
        $scope.invitedEmailList.indexOf(user.email) !== -1;

    /**
     * This function deletes a user from an array of users to be invited.
     * @param{email} email
     * @return{void} deletes users from the invite list

     */
      $scope.deleteUser = (email) => {
        const userIndex = $scope.invitedEmailList.indexOf(email);
        if ($scope.invitedEmailList.indexOf(email) > -1) {
          $scope.invitedEmailList.splice(userIndex, 1);
          $scope.disabled = false;
        }
        return $scope.invitedNameList;
      };

    /**
     * This function sends invites to users from an array
     *@return{response}  success or error response upon delivery.
     */
      $scope.sendMail = () => {
        for (let i = 0; i < $scope.invitedList.length; i += 1) {
          $scope.sendNotification($scope.invitedList[i]);
          $http({
            method: 'POST',
            url: '/api/invite',
            headers: { 'Content-Type': 'application/json' },
            data: {
              email: $scope.invitedList[i].email,
              link: document.URL,
              gameOwner: game.players[0].username,
              name: $scope.invitedList[i].name,
            }
          }).then((response) => {
            $scope.emailSentNotification = 'Invite successfully sent';
            return response;
          }, (error) => {
            $scope.emailSentNotification = `Aww shucks...Could not send invite to
            ${$scope.invitedList[i].name}. Try again?`;
            return error;
          });
        }
      };

    /**
     * This function finds users from the database based on the search param
     *@return{object} returns users from the database
     */
      $scope.findUsers = () => {
        $http.get(`/api/search/users/${$scope.searchUsers}`)
        .then((response) => {
          if (response.data.length > 0) {
            $scope.searchResult = response.data;
            $scope.noUserMatch = null;
          } else {
            $scope.searchResult = [];
            $scope.noUserMatch = 'Oops! No such user found.';
          }
        });
      };
      $scope.invitePlayersModal = {
        'font-size': '17px',
        'border-bottom': '1px solid #236484',
      };
      $scope.invitePlayersButton = {
        'margin-left': '90%',
        'background-color': '#236484',
      };

      $scope.searchedNamesList = {
        'padding-top': '25px',
        'padding-bottom': '20px',
      };
      $scope.deleteUserButton = {
        color: '#bbb',
        cursor: 'pointer',
      };
    }]);
