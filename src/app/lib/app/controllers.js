define(['app', 'angular', 'jquery', 'user', 'realize-sync', 'widget'], function(app, angular, $){
    app
        .controller("WidgetCtrl", ["$rootScope", "$scope", "user", 'widget', 'widgetMeta', 'EVENTS', function($root, $scope, user, widget, widgetMeta, EVENTS){
            $scope.widgetMeta = widgetMeta;
            $scope.widgetData = undefined;
            $scope.currentWidget = {
                name: undefined,
                type: undefined
            };

            console.log('WidgetCtrl $scope',$scope);
            $scope.setupWidget = function(data){
                console.log("Setting up widget: ", data);
                widget.loadWidget(data.type).then(function(widgetObj){
                    widgetObj.hashkey = data.hashkey;
                    widgetMeta.setTopLevelWidget(widgetObj);
                    $scope.widgetData = widgetObj;
                    console.log("Top level widget: ", $scope.widgetMeta.getTopLevelWidget());
                });
            };

            $scope.replace = function (widgetType, widgetName) {
                console.log("Replacing content with widget with type", widgetType, "and name", widgetName);
                user.checkAuth().then(function(profile){
                    console.log("User is authenticated.");
                    widget.listInstalledByTypeAndName(widgetType, widgetName).then(function(data){
                        console.log("Listing widget by type", widgetType, "and name", widgetName, "got data", data);
                        if(data.length === 0){
                            widget.create({name: widgetName, type: widgetType}).then(function(data){
                                $scope.setupWidget(data);
                            });
                        } else {
                            $scope.setupWidget(data[0]);
                        }
                    });
                }, function(reason){
                    console.log("Unathenticated user.  Initializing default widget version.");
                    $scope.setupWidget({type: widgetType, name: widgetName, hashkey: ""});
                });
            };

            $scope.switchWidget = function(event, widgetType, widgetName){
                if($scope.currentWidget.type !== widgetType || $scope.currentWidget.name !== widgetName){
                    console.log('EVENTS.switchWidgetTree called with arg: ', widgetType, widgetName);
                    $scope.currentWidget.type = widgetType;
                    $scope.currentWidget.name = widgetName;
                    return $scope.replace(widgetType, widgetName);
                }
            };

            $scope.$on(EVENTS.switchWidgetTree,function (event, widgetType, widgetName) {
                $scope.switchWidget(event, widgetType, widgetName);
            });

            $scope.$on('event:' + EVENTS.notAuthenticated, function() {
                $scope.setupWidget({type: 'login', name: 'default', hashkey: ""});
                console.log('checkLogin: auth-needed');
            });

            $scope.$on('event:' + EVENTS.loginSuccess, function() {
                $scope.switchWidget(EVENTS.switchWidgetTree, "dashboard", "default");
            });

            if($root.initialRenderDone !== true){
                $scope.setupWidget({type: 'index', name: 'default', hashkey: ""});
            }

            $root.initialRenderDone = true;
        }])

    .controller("DashboardsCtrl", ["$scope", "$window", "user", 'widget', '$rootScope', '$document', 'EVENTS', function($scope, $window, user, widget, $root, $document, EVENTS){
        console.log('DashboardsCtrl $scope',$scope);
        $scope.dashboards = [];

        $scope.updateDashboards = function(){
            widget.listInstalledByType("dashboard").then(function(data){
                console.log('User dashboards:', data);
                if(Object.keys(data).length === 0){
                    widget.create({name: 'default', type: 'dashboard'}).then(function(data){
                        $scope.dashboards.push(data);
                    });
                } else{
                    $scope.dashboards = data;
                }
            });
        };

        $scope.switchDashboard = function(dashName){
            $root.$broadcast(EVENTS.switchWidgetTree, "dashboard", dashName);
        };

        $scope.$on('$viewContentLoaded', function() {
            $scope.updateDashboards();
        });

        $scope.updateDashboards();
    }])

    /**
     * Controllers
     */

    .controller("TopNavCtrl", ['$scope', '$window', 'user', 'sync', function($scope, $window, user, sync){
        console.log('TopNavCtrl $scope',$scope);
        $scope.updateAuthorizations = function(){
            sync.authorizations('readList', {scope: "user", scopeHash: user.getProp('hashkey')})
            .then(function (data){
                console.log("Authorization list: ", data);
                $scope.authorizationList = data;
            });
        };

        $scope.$on('$viewContentLoaded', function() {
            $scope.updateAuthorizations();
        });

        $scope.authRedirect = function(auth){
            var query_url = auth.url + "?token=" + user.getProp('token');
            $window.location.href = query_url;
        };

        $scope.logout = function(){
            sync.logout()
                .finally(function () {
                    user.deAuthorize();
                });
        };

        $scope.updateAuthorizations();
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
		
        console.log('updating Plugins');
        $scope.updatePlugins();
    }])


    .controller("RightMenuCtrl", ['$scope', function($scope){
        console.log('RightMenuCtrl $scope',$scope);
    }]);

});

