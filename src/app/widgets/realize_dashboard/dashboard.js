define(['app', 'angularAMD', 'angular', 'jquery', 'angular-ui-bootstrap', 'realize-sync'], function(app, angularAMD, angular, $){
        app.register.controller('WidgetDashboardCtrl', ['$scope', 'widget', 'widgetMeta', '$element', '$rootScope', 'sync', 'user', function($scope, widget, widgetMeta, $element, $root, sync, user){
            $scope.hashkey = $scope.widgetData.hashkey;
            console.log("Loaded dashboard widget", $scope.hashkey);
            $scope.data = widget.detail($scope.hashkey).then(function(data){
                $scope.widgets = data.related;
                for(var i = 0; i < $scope.widgets.length; i++){
                    $scope.widgets[i].rendered = false;
                }
                $scope.renderWidgets();
            });

            $scope.loadedWidgets = [];

            $scope.add = function(widgetObj){
                console.log("Adding a widget to the dashboard.");
                if(widgetObj.name === undefined){
                    widgetObj.name = "defaultWidget";
                }
                widgetObj.parent = $scope.hashkey;
                widget.create(widgetObj).then(function(data){
                    data.rendered = true;
                    $scope.widgets.push(data);
                    $scope.renderWidget(data);
                });
            };

            $scope.getAvailableTree = function(){
                widget.listAll().then(function(data){
                    sync.views('readList', {scope: 'user', scopeHash: user.getProp('hashkey')}).then(function(viewData){
                        var availableWidgets = [];
                        var i;

                        for(i = 0; i < Object.keys(data).length; i++){
                            var key = Object.keys(data)[i];
                            if(data[key].tags.indexOf('dashboard-item') !== -1){
                                if(data[key].endpointRegistration === "static"){
                                    availableWidgets.push(data[key]);
                                }
                                else if(data[key].endpointRegistration === "dynamic"){
                                    for(var j = 0; j < viewData.length; j++){
                                        var loopData = viewData[j];
                                        var tagMatch = false;
                                        for(var k = 0; k < loopData.tags.length; k++){
                                            if(data[key].tags.indexOf(loopData.tags[k]) !== -1){
                                                tagMatch = true;
                                            }
                                        }

                                        if(tagMatch === true){
                                            var newData = angular.copy(data[key]);
                                            newData.endpoints = [loopData.hashkey];
                                            newData.name = loopData.name + "Widget";
                                            newData.title = loopData.name + " " + newData.title;
                                            availableWidgets.push(newData);
                                        }
                                    }
                                }
                            }

                        }

                        $scope.items = availableWidgets;
                    });
                });
            };

            $scope.renderWidget = function(widgetObj){
                var widgetData = angular.copy(widgetObj);
                widget.loadWidget(widgetData.type).then(function(data){
                    console.log("Rendering widget: ", widgetData, data);
                    data.hashkey = widgetData.hashkey;
                    data.endpoints = widgetData.views;
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

            $scope.getAvailableTree();

        }]);
});

