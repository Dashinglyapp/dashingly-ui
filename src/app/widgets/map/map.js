define(['app', 'angular', 'moment', 'view', 'context', 'user', 'realize-sync'], function (app, angular, moment) {
	app.register.controller('MapCtrl', ['$scope', 'sync', 'user', 'EVENTS', 'view', 'context', function ($scope, sync, user, EVENTS, view, context) {
		$scope.hashkey = $scope.widgetData.hashkey;
		$scope.formData = {};

		$scope.render = function () {
			view.getDetail(context.getScopeName(), context.getScopeHash(), $scope.widgetData.settings.source.value).then(function (data) {

                var mapMarkers = {};
                var lat = 0;
                var lc = 0;
                var lon = 0;
                for(var i = 0; i < data.data.points.length; i++){
                    var d = data.data.points[i];

                    mapMarkers[i] = {
                        lat: d.lat,
                        lng: d.lon,
                        message: d.date
                    };
                    lat = lat + d.lat;
                    lon = lon + d.lon;
                    lc = lc + 1;
                }
				$scope.viewData = {
                    map: {
					    mapMarkers: mapMarkers,
                        mapCenter: {
                            zoom: 12,
                            lat: lat / lc,
                            lng: lon / lc
                        },
                        "name": data.description
                    }
				};
			});
		};

		// change settings when an ancestor widget broadcasts to do it.
		$scope.$onRootScope(EVENTS.widgetSettingsChange, function (event, widgetKey) {
			console.log("Map received settings change event", widgetKey);
			if (widgetKey === $scope.hashkey) {
				$scope.render();
			}
		});

		$scope.render();

	}]);
});

