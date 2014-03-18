ngDefine('realize', ['angular', 'jquery'], function(module, angular, $){
    module.controller("DashboardCtrl", ["$scope", "$window", "user", "Restangular", 'dashboard', 'widget', '$rootScope', '$document', function($scope, $window, user, Restangular, dashboard, widget, $root, $document){
        console.log('DashboardCtrl $scope',$scope);

        $scope.updateDashboards = function(){
            dashboard.listAll().then(function(data){
                console.log('User dashboards:', data);
                if(Object.keys(data).length === 0){
                    dashboard.add('default').then(function(data){
                        $scope.dashboards = data;
                    });
                } else{
                    $scope.dashboards = data;
                }
            });
        };

        $scope.updateDashboards();

        $scope.$on('$viewContentLoaded', function() {
            $scope.updateDashboards();
        });

        $scope.renderDashboard = function(dashboardKey){
            var elem = $document.find("#dashboard-container");
            widget.addToPage('dashboard', elem).then(function(){
                $(elem).data('hashkey', dashboardKey);
            });
        };
        user.hasAuth().then(function(profile){
            $scope.renderDashboard(undefined);
        });
    }])

    /**
     * Controllers
     */

    .controller("TopNavCtrl", ['$scope', '$window', 'user', 'Restangular', function($scope, $window, user, Restangular){
        console.log('TopNavCtrl $scope',$scope);
        var baseAuthorizations;
        $scope.updateAuthorizations = function(){
            baseAuthorizations = Restangular.one("user", user.getProp('hashkey')).all('authorizations');
            baseAuthorizations.getList().then(function (data){
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


    .controller("LeftMenuCtrl", ['$scope', 'user', 'Restangular', function($scope, user, Restangular){
        $scope.dashboardListSource = 'installed';
        console.log('LeftMenuCtrl $scope',$scope);
        var basePlugins;
        $scope.updatePlugins = function(){
            basePlugins = Restangular.one("user", user.getProp('hashkey')).all('plugins');
            basePlugins.getList().then(function (data) {
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
            basePlugins.one(pluginObj.hashkey).one('actions').one('add').get(null, null, null).then(function (data) {
                console.log("Plugin added: ", data);
                $scope.updatePlugins();
            });
        };
        $scope.removePlugin = function(pluginObj){
            console.log("Removing a plugin");
            basePlugins.one(pluginObj.hashkey).one('actions').one('remove').get(null, null, null).then(function (data) {
                console.log("Plugin added: ", data);
                $scope.updatePlugins();
            });
        };
    }])


    .controller("RightMenuCtrl", ['$scope', function($scope){
        console.log('RightMenuCtrl $scope',$scope);
    }])

    .controller("WidgetCtrl", ['$scope','Restangular','$q','$window','widget','user','resource','baseTemplateName',function($scope,Restangular,$q,$window,widget,user,resource,baseTemplateName){
        console.log('WidgetCtrl RUNNING');


        $scope.remove = function  (widgetHash) {
            // remove code
        };

    }])

    .controller('LoginCtrl', ['$scope','Restangular','$q','$window', 'user', 'authService' ,function($scope,Restangular,$q,$window,user, authService){
        // var Restangular = $injector.get('Restangular');
        console.log('LoginCtrl scope',$scope);
        $scope.formData = {
            "email": "test@realize.pe",
            "password": "testtest"
        };
        $scope.loginType = "Login";
        var loginOrRegister = function  () {
            var options = {
                loginType:$scope.loginType,
                formData:$scope.formData
            };
            user.tryAuthorization(options)
                .then(function () {
                    // redirect to user's dashboard
                    var token = user.getProp('token');
                    var data = {};
                    var updater = function(config){
                        if(config !== undefined){
                            if(config.data !== undefined){
                                config.data.token = token;
                            }
                            if(config.headers !== undefined){
                                config.headers['Authentication-Token'] = token;
                            }
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
            Restangular.one('logout').get(null, null, null)
                .finally(function () {
                    user.deAuthorize();
                });
        };
    }]);

});

