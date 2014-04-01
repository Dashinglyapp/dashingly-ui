define(['app', 'angular', 'jquery', 'user', 'realize-sync', 'widget'], function(app, angular, $){
    app
    .controller("WidgetCtrl", ["$rootScope", "$scope", "user", 'widget', 'widgetMeta', 'EVENTS', '$location', function($root, $scope, user, widget, widgetMeta, EVENTS, $location){
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

        /**
         * switchWidget: Makes the widget to switch itself to a different widget
         * @param {string} widgetType A unique Identifier for each widget in the widget list. Corresponds to directory names and widgetlist.json keys.
         * @param {string} widgetName (optional) :  Desc?
         * @return {undefined} undefined
         */
        $scope.switchWidget = function(widgetType, widgetName){
            if($scope.currentWidget.type !== widgetType || $scope.currentWidget.name !== widgetName){
                console.log('EVENTS.switchWidget called with args: ', widgetType, widgetName);
                $scope.replace(widgetType, widgetName || 'default');
            }
        };

        $scope.$onRootScope(EVENTS.switchWidgetTree,function (event, widgetType, widgetName) {
            // console.log('EVENTS.switchWidgetTree called with arg: ', widgetType, widgetName);
            console.log("WidgetCtrl widget change event", widgetType, widgetName);
            // set default widget if no widget specified

            $scope.switchWidget(widgetType, widgetName);
        });

        $scope.$onRootScope(EVENTS.notAuthenticated, function(event) {
            if($scope.currentWidget.type !== "index"){
                $scope.switchWidget("index");
                console.log('checkLogin: auth-needed');
            }
        });

        $scope.$onRootScope(EVENTS.loginSuccess, function() {
            console.log("WidgetCtrl login success");
            $scope.switchWidget("dashboard");
        });

         $scope.$onRootScope(EVENTS.logoutSuccess, function(event) {
             console.log("WidgetCtrl logout success");
            $scope.switchWidget("index");
        });

        $root.initialRenderDone = true;
    }])

    .controller('WidgetRouteCtrl', ["$rootScope", "$scope", '$routeParams', "user", 'widget', 'sync', 'EVENTS', function($root, $scope, $routeParams, user, widget, sync, EVENTS){

        console.log("running widgetRouteCtrl with name ", name, "type ", type);
        var name = $routeParams.name || 'default';
        var type = $routeParams.type || 'index';

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

        // $scope.$watch(user.isAuthed, $scope.update);

    }])

    /**
     * Controllers
     */

    .controller("TopNavCtrl", ['$scope', '$window', 'user', 'sync', 'EVENTS', '$rootScope', function($scope, $window, user, sync, EVENTS, $root){
        console.log('TopNavCtrl $scope',$scope);
        $scope.logout = function(){
            sync.logout()
                .finally(function () {
                    // TODO this needs a logout spinner in case the login takes a while
                    $root.$emit(EVENTS.logoutSuccess);
                    user.deAuthorize();
                });
        };

        $scope.login = function(){
            $root.$emit(EVENTS.switchWidgetTree, "login");
        };

        $scope.register = function(){
            $root.$emit(EVENTS.switchWidgetTree, "register");
        };


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

        // $scope.$watch(user.isAuthed, $scope.update);

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

                $scope.changeView = function(viewName){
                  widget.saveView($scope.hashkey, viewName).then(function(){
                        $root.$emit(EVENTS.widgetViewChange, $scope.hashkey, viewName);
                        $scope.widgetData.currentView = viewName;
                    });
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

                $scope.refreshWidget = function(){
                    $root.$emit(EVENTS.widgetSettingsChange, $scope.hashkey);
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

                $scope.deleteWidget = function(){
                    console.log("Deleting widget with data", $scope.widgetData);
                    widget.remove($scope.hashkey).then(function(data){
                        for(var i = 0; i < $scope.widgetData.parents.length; i++){
                            $root.$emit(EVENTS.widgetSettingsChange, $scope.widgetData.parents[i]);
                        }
                    });
                };

                $scope.updateFields($scope.settings);
            }
    }]);
});

