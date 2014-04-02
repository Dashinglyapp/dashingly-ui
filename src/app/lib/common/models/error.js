define(['angularAMD', 'realize-sync'],
	function (angularAMD) {
		var module = angular.module('error', ['ng', 'user', 'realize-sync']);
		module

		.factory("error", ['$log', function ($log) {

			var api = {
				handleException: function(exception, cause){
					$log.error.apply($log, arguments);
				}
			};
			return api;
		}])

		.factory("serverError", ['$log', 'notification', function ($log, notification) {

			var api = {
				handleServerException: function(data){
					notification.error("Internal server error");
					console.log("500 error: ", data);
				},
				handleNotAuthenticated: function(data){
					notification.error("You must be signed in to access this content");
					console.log("401 error: ", data);
				},
				handleNotAuthorized: function(data){
					notification.error("You are not authorized to see this content");
					console.log("403 error: ", data);
				}
			};
			return api;
		}]);
	}
);