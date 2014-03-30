define(['app', 'angularAMD', 'angular', 'jquery', 'angular-ui-bootstrap', 'realize-sync'], function(app, angularAMD, angular, $){
        app.register.controller('WidgetDashboardCtrl', ['$scope', 'widget', 'widgetMeta', '$element', '$rootScope', 'sync', 'user', 'EVENTS', 'screen', '$modal', function($scope, widget, widgetMeta, $element, $root, sync, user, EVENTS, screen, $modal){
            $scope.hashkey = $scope.widgetData.hashkey;
            console.log("Loaded dashboard widget", $scope.hashkey);
            $scope.type = "widgets";
            var modalInstance;

            $scope.open = function () {

                modalInstance = $modal.open({
                  templateUrl: 'widgetModal.tpl.html',
                  scope: $scope
                });
            };

            $scope.ok = function(){
                $modal.$close();
            };

            $scope.setupDashboard = function(){
                $scope.data = widget.detail($scope.hashkey).then(function(data){
                    $scope.widgets = data.related;
                    for(var i = 0; i < $scope.widgets.length; i++){
                        $scope.widgets[i].rendered = false;
                    }
                    $scope.renderWidgets();
                    if($scope.widgets.length === 0){
                        $scope.addByType("intro");
                    }
                });
                $scope.loadedWidgets = [];
            };

            $scope.addByType = function(type){
                widget.listAll().then(function(data){
                    if(data[type] !== undefined){
                        $scope.add(data[type]);
                    }
                });
            };

            $scope.add = function(widgetObj){
                var timestamp = new Date().getTime();
                widgetObj.name = widgetObj.name + "_" + timestamp;
                widgetObj.parent = $scope.hashkey;
                var widgetSettings = {};
                widgetObj.endpoints = [];

                for(var i = 0; i < Object.keys(widgetObj.settings).length; i++){
                    var key = Object.keys(widgetObj.settings)[i];
                    var setting = widgetObj.settings[key];
                    if(setting.default !== undefined){
                        widgetSettings[key] = setting.default;
                        if(setting.type === "endpoint"){
                            widgetObj.endpoints.push(setting.default);
                        }
                    }
                }
                widgetObj.defaultSettings = widgetSettings;
                var screenFormat = screen.getFormat();
                widgetObj.currentView = widgetObj.display.defaults[screenFormat];
                console.log("Adding a widget to the dashboard: ", widgetObj);
                widget.create(widgetObj).then(function(data){
                    data.rendered = true;
                    $scope.widgets.push(data);
                    $scope.renderWidget(data);
                });
            };

            $scope.renderWidget = function(widgetObj){
                var widgetData = angular.copy(widgetObj);
                widget.loadWidget(widgetData.type).then(function(data){
                    console.log("Rendering widget: ", widgetData, data);
                    data.hashkey = widgetData.hashkey;
                    data.endpoints = widgetData.views;
                    data.currentView = widgetObj.current_view;
                    data.parents = widgetObj.parents;
                    for(var i = 0; i < Object.keys(data.settings).length; i++){
                        var key = Object.keys(data.settings)[i];
                        var setting = data.settings[key];
                        setting.value = widgetData.settings[key];
                    }
                    $scope.loadedWidgets.push(data);
                });
            };

            $scope.renderWidgets = function(){
              for(var i = 0; i < $scope.widgets.length; i++){
                  if($scope.widgets[i].rendered !== true){
                     $scope.widgets[i].rendered = true;
                     $scope.renderWidget($scope.widgets[i]);
                  }
              }
            };

            $scope.$onRootScope(EVENTS.widgetSettingsChange, function(event, widgetKey) {
                console.log("Dashboard received settings change event", widgetKey);
                if(widgetKey === $scope.hashkey){
                    $scope.setupDashboard();
                }
            });

            $scope.$onRootScope(EVENTS.widgetAddToDash, function(event, hashkey, widgetObj){
                console.log("Dashboard received widget add event", hashkey);
                if(hashkey === $scope.hashkey){
                    $scope.add(widgetObj);
                }
            });

            $scope.setupDashboard();
        }]);
});

