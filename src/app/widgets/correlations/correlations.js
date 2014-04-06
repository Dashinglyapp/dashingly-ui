define(['app', 'angular', 'moment', 'view', 'context', 'user', 'realize-sync'], function (app, angular) {
	app.register.controller('CorrelationsCtrl', ['$scope', 'sync', 'user', 'EVENTS', 'view', 'context', function ($scope, sync, user, EVENTS, view, context) {
		$scope.hashkey = $scope.widgetData.hashkey;
        view.getDetail(context.getScopeName(), context.getScopeHash(), $scope.widgetData.settings.source.value).then(function (data) {
            $scope.viewData = {
                "summary": {
                    "corr": data.data,
                    "title": data.description
                }
            };
        });
	}]);

});

