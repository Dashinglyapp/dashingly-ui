define(['app', 'angular', 'jquery', 'user', 'realize-sync', 'widget', 'plugin'], function(app, angular, $){
    app
        .controller("WidgetCtrl", ["$rootScope", "$scope", "user", 'widget', 'widgetMeta', 'EVENTS', '$location', 'plugin', function($root, $scope, user, widget, widgetMeta, EVENTS, $location, plugin){
            $scope.widgetMeta = widgetMeta;
            $scope.widgetData = undefined;
            $scope.currentWidget = {
                name: undefined,
                type: undefined
            };

            console.log('WidgetCtrl $scope',$scope);
            $scope.setupWidget = function(data){
                console.log("Setting up widget: ", data);
                 $scope.currentWidget.type = data.type;
                 $scope.currentWidget.name = data.name;
                widget.loadWidget(data.type).then(function(widgetObj){
                    widgetObj.hashkey = data.hashkey;
                    widgetMeta.setTopLevelWidget(widgetObj);
                    $scope.widgetData = widgetObj;
                    console.log("Top level widget: ", $scope.widgetMeta.getTopLevelWidget());
                    $location.path(data.type + "/" + data.name);
                    if(!$scope.$$phase) {
                      $scope.apply();
                    }
                });
            };

            $scope.setupWidgetWithData = function(widgetType, widgetName){
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
            };

            $scope.replace = function (widgetType, widgetName) {
                 widget.loadWidget(widgetType).then(function(widgetObj){
                    console.log("Replacing content with widget with type", widgetType, "and name", widgetName);
                    if(!widgetObj.noAuth){
                        user.checkAuth().then(function(profile){
                            console.log("User is authenticated.");
                            $scope.setupWidgetWithData(widgetType, widgetName);
                        }, function(reason){
                            console.log("Unathenticated user.  Initializing default widget version.");
                            $scope.setupWidget({type: widgetType, name: widgetName, hashkey: ""});
                        });
                    } else {
                        $scope.setupWidget({type: widgetType, name: widgetName, hashkey: ""});
                    }
                 });
            };

            $scope.switchWidget = function(event, widgetType, widgetName){
                if($scope.currentWidget.type !== widgetType || $scope.currentWidget.name !== widgetName){
                    console.log('EVENTS.switchWidgetTree called with arg: ', widgetType, widgetName);
                    return $scope.replace(widgetType, widgetName);
                }
            };

            $scope.$onRootScope(EVENTS.switchWidgetTree,function (event, widgetType, widgetName) {
                console.log("WidgetCtrl widget change event", widgetType, widgetName);
                $scope.switchWidget(event, widgetType, widgetName);
            });

            $scope.$onRootScope(EVENTS.notAuthenticated, function(event) {
                if($scope.currentWidget.type !== "index"){
                    $scope.switchWidget(event, "index", "default");
                    console.log('checkLogin: auth-needed');
                }
            });

            $scope.$onRootScope(EVENTS.loginSuccess, function() {
                console.log("WidgetCtrl login success");
                $scope.switchWidget(EVENTS.switchWidgetTree, "dashboard", "default");
            });

             $scope.$onRootScope(EVENTS.logoutSuccess, function(event) {
                 console.log("WidgetCtrl logout success");
                $scope.switchWidget(event, "index", "default");
            });

            $root.initialRenderDone = true;
        }])

        .controller('WidgetRouteCtrl', ["$rootScope", "$scope", '$routeParams', "user", 'widget', 'widgetMeta', 'EVENTS', function($root, $scope, $routeParams, user, widget, widgetMeta, EVENTS){

            var name = $routeParams.name;
            var type = $routeParams.type;

            if(name === undefined){
                name = "default";
            }

            if(type === undefined){
                type = "index";
            }

            console.log("WidgetRouteCtrl name", name, "type", type);
            $root.$emit(EVENTS.switchWidgetTree, type, name);
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
            console.log("Emitting switch dashboard event", dashName);
            $root.$emit(EVENTS.switchWidgetTree, "dashboard", dashName);
        };

        $scope.update = function(){
            $scope.updateDashboards();
        };

        $scope.$on('$viewContentLoaded', function() {
            $scope.update();
        });

        $scope.$watch(user.isAuthed, $scope.update);

    }])

    /**
     * Controllers
     */

    .controller("TopNavCtrl", ['$scope', '$window', 'user', 'sync', 'EVENTS', '$rootScope', 'context', function($scope, $window, user, sync, EVENTS, $root, context){
        console.log('TopNavCtrl $scope',$scope);
        $scope.isCollapsed = true;
        $scope.updateAuthorizations = function(){
            sync.authorizations('readList', {scope: context.getScopeName(), scopeHash: context.getScopeHash()})
            .then(function (data){
                console.log("Authorization list: ", data);
                $scope.authorizationList = data;
            });
        };

        $scope.login = function(){
            $root.$emit(EVENTS.switchWidgetTree, "login", "default");
        };

        $scope.register = function(){
            $root.$emit(EVENTS.switchWidgetTree, "register", "default");
        };

        $scope.authed = false;

        $scope.authRedirect = function(auth){
            var query_url = auth.url + "?token=" + user.getProp('token');
            $window.location.href = query_url;
        };

        $scope.logout = function(){
            sync.logout()
                .finally(function () {
                    user.deAuthorize();
                    $root.$emit(EVENTS.logoutSuccess);
                });
        };

        $scope.update = function(){
             $scope.updateAuthorizations();
             $scope.authed = user.isAuthed();
        };

        $scope.$on('$viewContentLoaded', function() {
            $scope.update();
        });

        $scope.$watch(user.isAuthed, $scope.update);

    }])

    .controller('WidgetActionsCtrl', ['$scope', 'user', 'sync', 'EVENTS', 'widget', '$rootScope', 'view', 'context', 'widgetSettings', function($scope, user, sync, EVENTS, widget, $root, view, context, widgetSettings){
            $scope.collapseSettings = true;
            $scope.formData = {};

            $scope.changeView = function(viewName){
              widget.saveView($scope.hashkey, viewName).then(function(){
                    $root.$emit(EVENTS.widgetViewChange, $scope.hashkey, viewName);
                    $scope.widgetData.currentView = viewName;
                });
            };

            $scope.updateFields = function(widgetObj){
                widgetSettings.getSettingsForm(widgetObj).then(function(fields){
                    $scope.fields = fields;
                });
            };

            $scope.showSettings = function(){
              $scope.collapseSettings = !$scope.collapseSettings;
            };

            $scope.refreshWidget = function(){
                $root.$emit(EVENTS.widgetSettingsChange, $scope.hashkey);
            };

            $scope.save = function(){
                console.log("Saving settings with data", $scope.formData);
                widgetSettings.saveSettingsForm($scope.widgetData, $scope.formData);
            };

            $scope.deleteWidget = function(){
                console.log("Deleting widget with data", $scope.widgetData);
                widget.remove($scope.hashkey).then(function(data){
                    for(var i = 0; i < $scope.widgetData.parents.length; i++){
                        $root.$emit(EVENTS.widgetSettingsChange, $scope.widgetData.parents[i]);
                    }
                });
            };

            if($scope.widgetData !== undefined){
                $scope.hashkey = $scope.widgetData.hashkey;
                $scope.tags = $scope.widgetData.tags;

                $scope.formOptions = {
                    "uniqueFormId": "settings_" + $scope.widgetData.hashkey,
                    "submitCopy": "Save"
                };

                $scope.updateFields($scope.widgetData);
            }
    }])

    .controller('ExtensionCtrl', ['$scope', 'sync', 'widget', 'user', '$q', '$rootScope', 'EVENTS', 'view', 'context', 'plugin', function($scope, sync, widget, user, $q, $root, EVENTS, view, context, plugin){
        $scope.widgets = [];
        $scope.plugins = [];
        $scope.views = [];
        $scope.currentItem = undefined;
        $scope.type = $scope.type || "plugins";
        $scope.items = [];

        $scope.fetchWidgets = function(){
            var d = $q.defer();
            widget.listAvailableByTag('dashboard-item').then(function(data){
                var promises = [];
                widget.loadWidgets(data).then(function(data){
                    $scope.widgets = data;
                    d.resolve(data);
                });
             });
            return d.promise;
        };

        $scope.fetchPlugins = function(){
            var d = $q.defer();
            plugin.listAllAvailable()
            .then(function (data) {
                $scope.plugins = data;
                d.resolve(data);
            });
            return d.promise;
        };

        $scope.setup = function(){
            $scope.fetchWidgets().then(function(){
                $scope.fetchPlugins().then(function(){
                    if($scope.type === "plugins"){
                        $scope.items = $scope.plugins;
                    } else if ($scope.type === "widgets"){
                        $scope.items = $scope.widgets;
                    }
                });
            });
        };

         $scope.addPlugin = function(pluginObj){
            console.log("Adding a plugin");
            sync.plugins("add", {scope: context.getScopeName(), scopeHash: context.getScopeHash(), resourceHash: pluginObj.hashkey})
            .then(function (data) {
                console.log("Plugin added: ", data);
                $scope.update();
            });
        };
        $scope.removePlugin = function(pluginObj){
            console.log("Removing a plugin");
            sync.plugins("remove", {scope: context.getScopeName(), scopeHash: context.getScopeHash(), resourceHash: pluginObj.hashkey})
            .then(function (data) {
                console.log("Plugin removed: ", data);
                $scope.update();
            });
        };

        $scope.add = function(item){
            if($scope.type === "plugins"){
                $scope.addPlugin(item);
            } else if($scope.type === "widgets"){
                $root.$emit(EVENTS.widgetAddToDash, $scope.hashkey, item);
            }
        };

        $scope.remove = function(item){
            if($scope.type === "plugins"){
                $scope.removePlugin(item);
            }
        };

        $scope.info = function(item){
            console.log("info");
        };

        $scope.update = function(){
          $scope.setup();
        };

        $scope.$on('$viewContentLoaded', function() {
            $scope.update();
        });

        $scope.$watch(user.isAuthed, $scope.update);

        $scope.setup();

    }]);
});

