define(['angularAMD'],
	function (angularAMD) {
		var module = angular.module('screen', ['ng']);
		module.factory("screen", ['$rootScope', '$q', '$window', 'sync', function ($root, $q, $window, sync) {
			var screen = "desktop";
			console.log("Window width:", $window.innerWidth);
			if ($window.innerWidth < 700) {
				screen = "mobile";
			}
			var api = {
				getFormat: function () {
					return screen;
				}
			};
			return api;
		}]);
	}
);


