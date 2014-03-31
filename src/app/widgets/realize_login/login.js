define(['app', 'angular'], function(app, angular){
    app.register.controller('LoginCtrl', ['$scope','user', 'EVENTS',function($scope,user,EVENTS){
        console.log('LoginCtrl scope',$scope);
        $scope.data = {};

        $scope.login = function  () {
          user.loginOrRegister($scope.data, "login").then(
            function(){
              $scope.$emit(EVENTS.loginSuccess);
            },
            function (err) {
              $scope.$emit(EVENTS.loginFailed);
              console.log('err in LoginCtrl',err);
            }
          );
        };
    }]);
});

