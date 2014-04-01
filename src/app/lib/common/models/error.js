define(['angularAMD', 'realize-sync'],
	function (angularAMD) {
		var module = angular.module('error', ['ng', 'user', 'realize-sync']);
		module.factory("error", ['$rootScope', '$q', '$window', 'sync', 'user', function ($root, $q, $window, sync, user) {
			var scope = {
				name: "user",
				hashkey: user.getProp('hashkey')
			};

			var update = function () {
				scope.hashkey = user.getProp('hashkey');
			};

			$root.$watch(user.isAuthed, update);

			var api = {

			};
			return api;
		}]);
	}
);