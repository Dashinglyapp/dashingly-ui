define(['app', 'angular', 'jquery', 'user', 'realize-sync', 'widget'], function(app, angular, $){
    app
        .controller("WidgetCtrl", ["$rootScope", "$scope", "user", 'widget', 'widgetMeta', 'EVENTS', function($root, $scope, user, widget, widgetMeta, EVENTS){
            $scope.widgetMeta = widgetMeta;
            $scope.widgetData = undefined;
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
                var func;
                if(user.isAuthed()){
                    widget.listInstalledByTypeAndName(widgetType, widgetName).then(function(data){
                        console.log("Listing widget by type", widgetType, "and name", widgetName, "got data", data);
                        if(data.length === 0){
                            widget.create(widgetName, widgetType, null).then(function(data){
                                $scope.setupWidget(data);
                            });
                        } else {
                            $scope.setupWidget(data[0]);
                        }
                    });
                } else{
                    $scope.setupWidget({type: widgetType, name: widgetName, hashkey: ""});
                }
            };

            $scope.$on(EVENTS.switchWidgetTree,function (event, widgetType, widgetName) {
                console.log('EVENTS.switchWidgetTree called with arg: ', widgetType, widgetName);
                return $scope.replace(widgetType, widgetName);
            });
            $root.initialRenderDone = true;
        }])

    .controller("DashboardsCtrl", ["$scope", "$window", "user", 'widget', '$rootScope', '$document', 'EVENTS', function($scope, $window, user, widget, $root, $document, EVENTS){
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
                        $root.$broadcast(EVENTS.switchWidgetTree, "dashboard", "default");
                    });
                } else{
                    dashboardKey = data[0].hashkey;
                    $scope.dashboards = data;
                    $root.$broadcast(EVENTS.switchWidgetTree, "dashboard", "default");
                }
            });
        };
        user.hasAuth().then(function(profile){
            $scope.updateDashboards();
        });

        $scope.$on('$viewContentLoaded', function() {
            $scope.updateDashboards();
        });
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
        $scope.updateAuthorizations();
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
    }]);

});

