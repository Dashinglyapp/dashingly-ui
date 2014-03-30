define(['app', 'angular', 'jquery', 'user', 'realize-sync', 'widget'], function(app, angular, $){
    function uniqueArray(a) {
        var temp = {};
        var i;
        for (i = 0; i < a.length; i++) {
            if(a[i] !== undefined){
                temp[a[i]] = true;
            }
        }
        var r = [];
        for (i = 0; i < Object.keys(temp).length; i++) {
            r.push(Object.keys(temp)[i]);
        }
        return r;
    }

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
                                            if(viewData[m].installed === true){
                                                if(viewData[m].tags.indexOf(field.meta.tags[j]) !== -1){
                                                    options.push({
                                                        name: viewData[m].name,
                                                        value: viewData[m].hashkey
                                                    });
                                                }
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
    }])

    .controller('ExtensionCtrl', ['$scope', 'sync', 'widget', 'user', '$q', '$rootScope', 'EVENTS', function($scope, sync, widget, user, $q, $root, EVENTS){
        $scope.widgets = [];
        $scope.plugins = [];
        $scope.views = [];
        $scope.currentItem = undefined;
        $scope.type = $scope.type || "plugins";
        $scope.items = [];

        $scope.fetchWidgets = function(){
            var d = $q.defer();
            widget.listAll().then(function(data){
                var availableWidgets = [];
                var promises = [];
                var i;

                for(i = 0; i < Object.keys(data).length; i++){
                    var key = Object.keys(data)[i];
                    if(data[key].tags.indexOf('dashboard-item') !== -1){
                        availableWidgets.push(data[key]);
                    }
                }

                $scope.fetchViews().then(function(views){
                    $scope.resolveAllWidgetDependencies(availableWidgets).then(function(data){
                        $scope.widgets = data;
                        d.resolve(data);
                    });
                });
             });
            return d.promise;
        };

        $scope.resolveAllWidgetDependencies = function(widgets){
            var promises = [];
            for(var i = 0; i < widgets.length; i++){
                promises.push($scope.resolveWidgetDependencies(widgets[i]));
            }
            return $q.all(promises);
        };

        $scope.fetchPlugins = function(){
            var d = $q.defer();
            sync.plugins('readList', {scope: "user", scopeHash: user.getProp('hashkey')})
            .then(function (data) {
                for(var i = 0; i < data.length; i++){
                    data[i] = $scope.resolvePluginDependencies(data[i]);
                }
                $scope.plugins = data;
                d.resolve(data);
            });
            return d.promise;
        };

        $scope.fetchViews = function(){
            var d = $q.defer();
            sync.views('readList', {scope: 'user', scopeHash: user.getProp('hashkey')}).then(function(views){
              $scope.views = views;
                d.resolve(views);
            });
            return d.promise;
        };

        $scope.resolveWidgetDependencies = function(item){
            var d = $q.defer();
            widget.loadWidget(item.type).then(function(data){
                var compatiblePlugins = [];
                if(data.settings !== undefined){
                    for(var i = 0; i < Object.keys(data.settings).length; i++){
                        var key = Object.keys(data.settings)[i];
                        if(data.settings[key].type === "endpoint"){
                            var widgetTags = data.settings[key].meta.tags;
                            for(var j = 0; j < $scope.views.length; j++){
                                var viewTags = $scope.views[j].tags;
                                var intersection = widgetTags.filter(function(n) {
                                    return viewTags.indexOf(n) !== -1;
                                });
                                if(intersection.length > 0){
                                    compatiblePlugins.push($scope.views[j].plugin);
                                }
                            }
                        }
                    }
                }
                item.deps = {
                    compatible: uniqueArray(compatiblePlugins),
                    required: []
                };
                item.description = data.description;
                item.title = data.title;
                item.authors = data.authors;
                item.tags = data.tags;
                item.version = data.version;
                item.type = data.type;

                d.resolve(item);
            });
            return d.promise;
        };

        $scope.resolvePluginDependencies = function(item){
          var compatibleWidgets = [];
          for(var j = 0; j < $scope.widgets.length; j++){
              var widgetPlugins = $scope.widgets[j].deps.compatible;
              if (widgetPlugins.indexOf(item.hashkey) !== -1){
                compatibleWidgets.push($scope.widgets[j].hashkey);
              }
          }

          var authRequirements = item.permissions.authorizations.map(
              function(val){
                  return "Authorization: " + val;
              }
          );

          item.deps = {
              compatible: uniqueArray(compatibleWidgets),
              required: uniqueArray(authRequirements)
          };
          return item;
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
            sync.plugins("add", {scope: "user", scopeHash: user.getProp('hashkey'), resourceHash: pluginObj.hashkey})
            .then(function (data) {
                console.log("Plugin added: ", data);
                $scope.update();
            });
        };
        $scope.removePlugin = function(pluginObj){
            console.log("Removing a plugin");
            sync.plugins("remove", {scope: "user", scopeHash: user.getProp('hashkey'), resourceHash: pluginObj.hashkey})
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

