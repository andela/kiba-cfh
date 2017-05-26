angular.module('mean.system')
  .controller('InviteController', ['$scope', 'game', '$http',
    ($scope, game, $http) => {
      $scope.searchUsers = '';
    /**
     * Get all the users from the database
     */
      $scope.openModal = () => {
        $('#exampleModal').modal('toggle');
      };

      $scope.disabled = false;
      $scope.invitedEmailList = [];
      $scope.invitedList = [];
      $scope.getUserId = str => (str.replace(/[^\w-]/g, '-'));

    /**
     * This function adds a user to an array of users to be invited.
     * @param {object} user, receives a user object from the database
     */
      const addNow = (user) => {
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
          bootbox.alert({
            size: 'small',
            message: 'Do you want to invite a country??? Only a maximum 11 people can be invited'
          });
        }
      };

    /**
     * This function checks if the user has been added to the array of
     *  prospective
     * invitees and disables the add button for that user
     */
      $scope.addUser = (user) => {
        if ($scope.invitedEmailList.length > 0) {
          if ($scope.invitedEmailList.indexOf(user.email) === -1) {
            addNow(user);
          } else {
            $(`#${$scope.getUserId(user.email)}`).prop('disabled', true);
            bootbox.alert({
              size: 'small',
              message: 'Adding a user more than once is not permitted'
            });
          }
        } else {
          addNow(user);
        }
      };

       /**
     * This function deletes a user from an array of users to be invited.
     * @param {email} email, receives an email.
     *@return $scope.invitedEmailList, an updated array of the email list is
     returned.
     */
      $scope.deleteUser = (email) => {
        const userIndex = $scope.invitedEmailList.indexOf(email);
        if ($scope.invitedEmailList.indexOf(email) > -1) {
          $scope.invitedEmailList.splice(userIndex, 1);
          $(`#${$scope.getUserId(email)}`).prop('disabled', false);
        }
        return $scope.invitedNameList;
      };

       /**
     * This function sends invites to users from an array
     *@return  success or error response upon delivery.
     */
      $scope.sendMail = () => {
        for (let i = 0; i < $scope.invitedList.length; i += 1) {
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
            $scope.emailSentNotif = 'Email successfully sent';
          }, (error) => {
            $scope.emailSentNotif = `Aww shucks...Could not send invite to
            ${$scope.invitedList[i].name}. Try again?`;
          });
        }
      };

    /**
     * This function finds users from the database based on the search param
     *@return $scope.invitedEmailList, an array of search results.
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
      $scope.myObj = {
        'font-size': '17px',

      };
      $scope.btnObj = {
        'margin-left': '90%',
      };

      $scope.searchNamesObj = {
        'padding-top': '25px',
        'padding-bottom': '20px',
      };
    }]);
