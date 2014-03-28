define(['app', 'angular'], function(app, angular){
    app.register.controller('LoginCtrl', ['$scope','$q','$window', 'user', 'authService', 'sync', function($scope,$q,$window,user, authService, sync){
        console.log('LoginCtrl scope',$scope);
        $scope.data = {};

        $scope.login = function  () {
              user.loginOrRegister($scope.data, "login").then(function(){

            });
        };
    }]);
});

