define(['app', 'angular'], function(app, angular){
    app.register.controller('ChartCtrl', ['$scope', function($scope){
        $scope.children = [
            {name: "Test1"},
            {name: "Test2"}
        ];
    }]);
});

