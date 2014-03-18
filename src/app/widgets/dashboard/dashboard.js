define(['app', 'angularAMD', 'angular', 'jquery', 'angular-ui-bootstrap'], function(app, angularAMD, angular, $){
        app.register.controller('DashboardCtrl', ['$scope', 'resource', 'dashboard', 'widget', '$rootElement', function($scope, resource, dashboard, widget, $rootElement){
            $scope.hashkey = $rootElement.data('hashkey');
            $scope.data = dashboard.detail($scope.hashkey).then(function(data){
                $scope.widgets = data.related;
                for(var i = 0; i < $scope.widgets.length; i++){
                    $scope.widgets[i].rendered = false;
                }
                $scope.renderWidgets();
            });


            $scope.widgetContainer = $rootElement.find('#widget-container');

            $scope.add = function(widget){
                console.log("Adding a widget to the dashboard.");
                dashboard.addWidget(widget, $scope.hashkey).then(function(data){
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

            $scope.renderWidgets = function(){
              for(var i = 0; i < $scope.widgets.length; i++){
                  if($scope.widgets[i].rendered !== true){
                      var widgetData = $scope.widgets[i];
                      var widgetClass = "widget-" + widgetData.name;
                      $scope.widgetContainer.append("<div class='widget " + widgetClass + "' ng-widget data-hashkey='" + widgetData.hashkey + "'></div>");
                      widget.addToPage(widgetData.name, $scope.widgetContainer.find('.' + widgetClass));
                  }
              }
            };

            $scope.getAvailableTree();

        }]);
});

