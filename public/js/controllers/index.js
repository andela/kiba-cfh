angular.module('mean.system').controller('IndexController', [
  '$scope',
  'Global',
  '$http',
  '$location',
  'socket',
  'game',
  'AvatarService',
  '$window',
  '$cookies',
  (
    $scope,
    Global,
    $http,
    $location,
    socket,
    game,
    AvatarService,
    $window,
    $cookies
  ) => {
    $scope.global = Global;
    // $scope.errorMsg = '';
    if ($cookies.get('token')) {
      $scope.global.authenticated = true;
    } else {
      $scope.global.authenticated = false;
    }
    const apiCall = (url) => {
      const newUser = {
        name: $scope.fullname,
        email: $scope.email,
        password: $scope.password
      };
      $http.post(url, newUser).then(
        (response) => {
          const token = response.data.token;
          $cookies.put('token', token);
          $scope.showOptions = false;
          $location.path('/');
        }).catch((response) => {
          $scope.errorMsg = response.data.message;
        });
    };
    $scope.signup = () => {
      $scope.errorMsg = '';
      apiCall('api/auth/signup');
    };
    $scope.login = () => {
      $scope.errorMsg = '';
      apiCall('api/auth/login');
    };
    $scope.logout = () => {
      $cookies.remove('token');
      $scope.showOptions = true;
      $scope.global.authenticated = false;
    };
    $scope.playAsGuest = () => {
      game.joinGame();
      $location.path('/app');
    };
    $scope.showError = () => {
      if ($location.search().error) {
        return $location.search().error;
      }
      return false;
    };
    $scope.avatars = [];
    AvatarService.getAvatars().then((data) => {
      $scope.avatars = data;
    });
    $scope.load = () => {
      const onScrollAnimations = () => {
        let inview;
        if ($('.img1').length) {
          inview = new Waypoint.Inview({
            element: $('.img1')[0],
            entered() {
              $('.img1').addClass('slideIn1');
            }
          });
          console.log('i am me');
        }
        inview = new Waypoint.Inview({
          element: $('.img2')[0],
          entered() {
            $('.img2').addClass('slideIn2');
          }
        });
        inview = new Waypoint.Inview({
          element: $('.img3')[0],
          entered() {
            $('.img3').addClass('slideIn3');
          }
        });

        inview = new Waypoint.Inview({
          element: $('.text1')[0],
          entered() {
            $('.text1').addClass('bounceIn1');
          },
          exited() {
            // $('.text1').removeClass('bounceIn1');
          }
        });
        inview = new Waypoint.Inview({
          element: $('.text2')[0],
          entered() {
            $('.text2').addClass('bounceIn2');
          },
          exited() {
            // $('.text2').removeClass('bounceIn2');
          }
        });
        inview = new Waypoint.Inview({
          element: $('.text3')[0],
          entered() {
            $('.text3').addClass('bounceIn3');
          },
          exited() {
            // $('.text3').removeClass('bounceIn3');
          }
        });
        inview = new Waypoint.Inview({
          element: $('.wp1')[0],
          entered() {
            $('.wp1').addClass('slideInLeft');
          }
        });
        inview = new Waypoint.Inview({
          element: $('.wp2')[0],
          entered() {
            $('.wp2').addClass('slideInRight');
          }
        });
      };
      $(document).ready(() => {
        $('.parallax').parallax();
        $('#download-button').click(() => {
          $('html, body').animate(
            {
              scrollTop: $('.intro').offset().top
            },
            2000
          );
        });
        $('.button-collapse').sideNav();
        onScrollAnimations();
      });
    };
  }
]);
