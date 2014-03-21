define(['app', 'angular'], function(app, angular){
    app.register.controller('LoginCtrl', ['$scope','$q','$window', 'user', 'authService', 'sync', function($scope,$q,$window,user, authService, sync){
        console.log('LoginCtrl scope',$scope);
        $scope.data = {
            "email": "test@realize.pe",
            "password": "testtest"
        };

        var loginOrRegister = function  (loginType) {
            var options = {
                loginType: loginType,
                data: $scope.data
            };
            user.tryAuthorization(options)
                .then(function () {
                    // redirect to user's dashboard
                    var token = user.getProp('token');
                    console.log("Logged in!  Token is now: ", token);
                    var data = {};
                    var updater = function(config){
                        if(config !== undefined){
                            if(config.data !== undefined){
                                config.data.token = token;
                            } else {
                                config.data = {token: token};
                            }
                            if(config.headers !== undefined){
                                config.headers['Authentication-Token'] = token;
                            }
                        } else {
                            config = {data: {token: token}};
                        }
                        return config;
                    };
                    authService.loginConfirmed(data, updater);
                });
        };
        $scope.login = function(){
            loginOrRegister('login');
        };
        $scope.register = function(){
            loginOrRegister('register');
        };
        $scope.logout = function () {
            sync.logout()
                .finally(function () {
                    user.deAuthorize();
                });
        };
    }]);
});

