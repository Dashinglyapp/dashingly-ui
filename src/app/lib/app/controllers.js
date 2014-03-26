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
                 $scope.currentWidget.type = data.type;
                 $scope.currentWidget.name = data.name;
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
                    return $scope.replace(widgetType, widgetName);
                }
            };

            $scope.$onRootScope(EVENTS.switchWidgetTree,function (event, widgetType, widgetName) {
                console.log("WidgetCtrl widget change event", widgetType, widgetName);
                if(widgetType !== "index"){
                    $scope.switchWidget(event, widgetType, widgetName);
                } else {
                    $scope.setupWidget({type: 'index', name: 'default', hashkey: ""});
                }
            });

            $scope.$onRootScope(EVENTS.notAuthenticated, function() {
                $scope.setupWidget({type: 'login', name: 'default', hashkey: ""});
                console.log('checkLogin: auth-needed');
            });

            $scope.$onRootScope(EVENTS.loginSuccess, function() {
                console.log("WidgetCtrl login success");
                $scope.switchWidget(EVENTS.switchWidgetTree, "dashboard", "default");
            });

             $scope.$onRootScope(EVENTS.logoutSuccess, function() {
                 console.log("WidgetCtrl logout success");
                $scope.setupWidget({type: 'index', name: 'default', hashkey: ""});
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

    .controller("TopNavCtrl", ['$scope', '$window', 'user', 'sync', 'EVENTS', '$rootScope', function($scope, $window, user, sync, EVENTS, $root){
        console.log('TopNavCtrl $scope',$scope);
        $scope.isCollapsed = true;
        $scope.updateAuthorizations = function(){
            sync.authorizations('readList', {scope: "user", scopeHash: user.getProp('hashkey')})
            .then(function (data){
                console.log("Authorization list: ", data);
                $scope.authorizationList = data;
            });
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


    .controller("LeftMenuCtrl", ['$scope', 'user', 'sync', 'EVENTS', function($scope, user, sync, EVENTS){
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


        $scope.update = function(){
          $scope.updatePlugins();
        };

        $scope.$on('$viewContentLoaded', function() {
            $scope.update();
        });

        $scope.$watch(user.isAuthed, $scope.update);

    }])

    .controller('WidgetSettingsCtrl', ['$scope', 'user', 'sync', 'EVENTS', 'widget', '$rootScope', function($scope, user, sync, EVENTS, widget, $root){
            $scope.collapseSettings = true;
            $scope.formData = {};
            if($scope.widgetData !== undefined){
                $scope.settings = $scope.widgetData.settings;
                $scope.hashkey = $scope.widgetData.hashkey;
                $scope.tags = $scope.widgetData.tags;

                $scope.formOptions = {
                    "uniqueFormId": "settings_" + $scope.widgetData.hashkey,
                    "submitCopy": "Save"
                };

                $scope.updateFields = function(settings){
                    sync.views('readList', {scope: 'user', scopeHash: user.getProp('hashkey')}).then(function(viewData){
                        var formFields = [];
                        for(var i = 0; i < Object.keys(settings).length; i++){
                            var key = Object.keys(settings)[i];
                            var field = settings[key];

                            var formField = {
                                type: field.type,
                                label: field.description,
                                name: key,
                                key: key
                            };

                            switch(field.type){
                                case "endpoint":
                                    var options = [];
                                    for(var j = 0; j < field.meta.tags.length; j++){
                                        for(var m = 0; m < viewData.length; m++){
                                            if(viewData[m].tags.indexOf(field.meta.tags[j]) !== -1){
                                                options.push({
                                                    name: viewData[m].name,
                                                    value: viewData[m].hashkey
                                                });
                                            }
                                        }
                                    }
                                    formField.type = "select";
                                    formField.options = options;
                                    break;
                                default:
                                    break;
                            }

                            formFields.push(formField);
                        }

                        $scope.fields = formFields;
                    });
                };

                $scope.showSettings = function(){
                  $scope.collapseSettings = !$scope.collapseSettings;
                };

                $scope.save = function(){
                    console.log("Saving settings with data", $scope.formData);
                    var views = $scope.widgetData.endpoints;
                    var patchData = {};
                    for(var i = 0; i < Object.keys($scope.formData).length; i++){
                        var key = Object.keys($scope.formData)[i];
                        if($scope.formData[key].value !== undefined){
                            patchData[key] = $scope.formData[key].value;
                        } else {
                            patchData[key] = $scope.formData[key];
                        }

                        $scope.widgetData.settings[key] = $scope.widgetData.settings[key] || {};
                        $scope.widgetData.settings[key].value = patchData[key];
                        if($scope.widgetData.settings[key].type === "endpoint"){
                            views.push(patchData[key]);
                        }
                    }
                    widget.saveSettings($scope.hashkey, patchData, views).then(function(){
                        $root.$emit(EVENTS.widgetSettingsChange, $scope.hashkey);
                    });
                };

                $scope.updateFields($scope.settings);
            }
    }]);
});

