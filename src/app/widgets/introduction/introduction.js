define(['app', 'angular'], function(app, angular){
    app.register.controller('IntroCtrl', ['$scope', function($scope){
        $scope.hashkey = $scope.widgetData.hashkey;

        $scope.viewData = {
            "chart": {
                "chartData": $scope.chartData,
                "chartType": $scope.chartType,
                "chartConfig": $scope.chartConfig
            },
            "number": {
                "number": $scope.number
            }
        };
    }]);

});

