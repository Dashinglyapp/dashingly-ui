define(['app', 'angularAMD', 'angular', 'jquery', 'angular-ui-bootstrap', 'realize-sync'], function(app, angularAMD, angular, $){
        app.register.controller('WidgetDashboardCtrl', ['$scope', 'widget', 'widgetMeta', '$element', '$rootScope', 'sync', function($scope, widget, widgetMeta, $element, $root, sync){
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
                widget.create({name: "defaultWidget", type: widgetObj.type, parent: $scope.hashkey}).then(function(data){
                    $scope.widgets.push(data);
                    $scope.renderWidgets();
                });
            };

            $scope.getAvailableTree = function(){
                widget.listAll().then(function(data){
                    var availableWidgets = [];
                    for(var i = 0; i < Object.keys(data).length; i++){
                        var key = Object.keys(data)[i];
                        if(data[key].tags.indexOf('dashboard-item') !== -1){
                            availableWidgets.push(data[key]);
                        }
                    }
                    $scope.items = availableWidgets;
                });
            };

            $scope.processWidget = function(data){
                $scope.loadedWidgets.push(data);
                console.log("Loaded a widget: ", data);
            };

            $scope.renderWidgets = function(){
              for(var i = 0; i < $scope.widgets.length; i++){
                  if($scope.widgets[i].rendered !== true){
                      var widgetData = $scope.widgets[i];
                      widgetData.rendered = true;
                      widget.loadWidget(widgetData.type).then(function(data){
                          data.hashkey = widgetData.hashkey;
                          $scope.processWidget(data);
                      });
                  }
              }
            };

            $scope.getAvailableTree();

        }]);
});

