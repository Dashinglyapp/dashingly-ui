define(['app', 'angularAMD', 'angular', 'jquery', 'angular-ui-bootstrap', 'realize-sync', 'widget', 'user', 'screen'], function(app, angularAMD, angular, $){
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
                $scope.data = widget.listInstalledByParent($scope.hashkey).then(function(data){
                   $scope.loadedWidgets = data;
                });
            };

            $scope.add = function(widgetObj){
                var timestamp = new Date().getTime();
                widgetObj.name = widgetObj.name + "_" + timestamp;
                widgetObj.parent = $scope.hashkey;

                console.log("Adding a widget to the dashboard: ", widgetObj);
                widget.create(widgetObj).then(function(data){
                    $scope.loadedWidgets.push(data);
                });
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

