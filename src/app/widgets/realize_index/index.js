define(['app', 'angular'], function(app, angular){
    app.register.controller('IndexCtrl', ['$scope', 'user', 'EVENTS', function($scope, user, EVENTS){
        console.log('IndexCtrl running');

    }]);
});