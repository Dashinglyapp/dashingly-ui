/**
* login Module
*
* Provides a login widget
*/
angular.module('login', [
  'realize' // require realize module
])

.controller('LoginCtrl', ['$scope','api-promises','$window',function ($scope, apiPromises, $window) {
  $scope.user = {
    "email": "test@realize.pe",
    "password": "test"
  };
  $scope.message = '';
  $scope.submit = function () {
    apiPromises.login.get().then(function(preLoginData){
      apiPromises.login.post($scope.user,{'X-CSRFToken':preLoginData.csrf_token})
      .then(function(postLoginData){
        $window.sessionStorage.token = postLoginData.token;
        $scope.message = 'Welcome';
      })
      .error(function(){
        delete $window.sessionStorage.token; // Erase the token if the user fails to log in

        // Handle login errors
        console.log('submit error arguments',arguments);
        $scope.message = 'Error: Invalid user or password';
      });

    });
  };
}]);