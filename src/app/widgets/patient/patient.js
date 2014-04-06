define(['app', 'angular', 'moment', 'view', 'context', 'user', 'realize-sync'], function (app, angular, moment) {
	app.register.controller('FormCtrl', ['$scope', 'sync', 'user', 'EVENTS', 'view', 'context', function ($scope, sync, user, EVENTS, view, context) {
		$scope.hashkey = $scope.widgetData.hashkey;
		$scope.formData = {};
        $scope.viewData = {};

	}]);
});

