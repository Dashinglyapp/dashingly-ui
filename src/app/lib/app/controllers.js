define(['app', 'angular', 'jquery', 'user', 'realize-sync'], function(app, angular, $){
    app
    .controller("DashboardsCtrl", ["$scope", "$window", "user", 'widget', '$rootScope', '$document', function($scope, $window, user, widget, $root, $document){
        console.log('DashboardsCtrl $scope',$scope);
        $scope.dashboards = [];

        $scope.updateDashboards = function(){
            widget.listInstalledByType("dashboard").then(function(data){
                console.log('User dashboards:', data);
                var dashboardKey;
                if(Object.keys(data).length === 0){
                    widget.create('default', 'dashboard', null).then(function(data){
                        dashboardKey = data.hashkey;
                        $scope.dashboards.push(data);
                        $scope.renderDashboard(dashboardKey);
                    });
                } else{
                    dashboardKey = data[0].hashkey;
                    $scope.dashboards = data;
                    $scope.renderDashboard(dashboardKey);
                }
            });
        };
        user.hasAuth().then(function(profile){
            $scope.updateDashboards();
        });

        $scope.$on('$viewContentLoaded', function() {
            $scope.updateDashboards();
        });

        $scope.renderDashboard = function(dashboardKey){
            widget.loadWidget('dashboard').then(function(data){
                $root.widgetHashkey = dashboardKey;
                $scope.widgetTemplateId = data.template;
            });
        };
    }])

    /**
     * Controllers
     */

    .controller("TopNavCtrl", ['$scope', '$window', 'user', 'sync', function($scope, $window, user, sync){
        console.log('TopNavCtrl $scope',$scope);
        var baseAuthorizations;
        $scope.updateAuthorizations = function(){
            sync.authorizations('readList', {scope: "user", scopeHash: user.getProp('hashkey')})
            .then(function (data){
                console.log("Authorization list: ", data);
                $scope.authorizationList = data;
            });
        };
        $scope.updateAuthorizations();
        $scope.$on('$viewContentLoaded', function() {
            $scope.updateAuthorizations();
        });

        $scope.authRedirect = function(auth){
            var query_url = auth.url + "?token=" + user.getProp('token');
            $window.location.href = query_url;
        };
    }])


    .controller("LeftMenuCtrl", ['$scope', 'user', 'sync', function($scope, user, sync){
        $scope.dashboardListSource = 'installed';
        console.log('LeftMenuCtrl $scope',$scope);
        var basePlugins;
        $scope.updatePlugins = function(){
            sync.plugins('readList', {scope: "user", scopeHash: user.getProp('hashkey')})
            .then(function (data) {
                console.log("Plugin list: ", data);
                $scope.pluginList = data;
            });
        };
        $scope.updatePlugins();
        $scope.$on('$viewContentLoaded', function() {
            $scope.updatePlugins();
        });
        $scope.addPlugin = function(pluginHashkey){
            console.log("Adding plugins.");
        };

        $scope.removePlugin = function(pluginHashkey){

        };
        $scope.addPlugin = function(pluginObj){
            console.log("Adding a plugin");
            sync.plugins("add", {scope: "user", scopeHash: user.getProp('hashkey'), resourceHash: pluginObj.hashkey})
            .then(function (data) {
                console.log("Plugin added: ", data);
                $scope.updatePlugins();
            });
        };
        $scope.removePlugin = function(pluginObj){
            console.log("Removing a plugin");
            sync.plugins("remove", {scope: "user", scopeHash: user.getProp('hashkey'), resourceHash: pluginObj.hashkey})
            .then(function (data) {
                console.log("Plugin added: ", data);
                $scope.updatePlugins();
            });
        };
    }])


    .controller("RightMenuCtrl", ['$scope', function($scope){
        console.log('RightMenuCtrl $scope',$scope);
    }])

    .controller("WidgetCtrl", ['$scope','$q','$window','widget','user','resource','baseTemplateName',function($scope,$q,$window,widget,user,resource,baseTemplateName){
        console.log('WidgetCtrl RUNNING');


        $scope.remove = function  (widgetHash) {
            // remove code
        };

    }])

    .controller('LoginCtrl', ['$scope','$q','$window', 'user', 'authService', 'sync', function($scope,$q,$window,user, authService, sync){
        console.log('LoginCtrl scope',$scope);
        $scope.data = {
            "email": "test@realize.pe",
            "password": "testtest"
        };
        $scope.loginType = "login";
        var loginOrRegister = function  () {
            var options = {
                loginType:$scope.loginType,
                data:$scope.data
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
                                config.data = {token: token}
                            }
                            if(config.headers !== undefined){
                                config.headers['Authentication-Token'] = token;
                            }
                        } else {
                            config = {data: {token: token}}
                        }
                        return config;
                    };
                    authService.loginConfirmed(data, updater);
                });
        };
        $scope.login = function(){
            loginOrRegister();
        };
        $scope.register = function(){
            loginOrRegister();
        };
        $scope.logout = function () {
            sync.logout()
                .finally(function () {
                    user.deAuthorize();
                });
        };
    }]);

});

