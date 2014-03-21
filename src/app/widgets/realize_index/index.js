define(['app', 'angular'], function(app, angular){
    app.register.controller('IndexCtrl', ['$scope', 'user', 'EVENTS', function($scope, user, EVENTS){
        $scope.switch = function (type) {
            console.log('switchToLogin.clicked!');
            $scope.$emit(EVENTS.switchWidgetTree, type, 'default');
        };
    }]);
});