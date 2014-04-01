define(['angularAMD', 'angular-growl'],
	function (angularAMD) {
		var module = angular.module('notification', ['ng', 'angular-growl']);
		module.factory("notification", ['growl', function (growl) {
			var ttl = 5000;
			var api = {
				warn: function(message){
					growl.addWarnMessage(message, {ttl: ttl});
				},
				info: function(message){
					growl.addInfoMessage(message, {ttl: ttl});
				},
				success: function(message){
					growl.addSuccessMessage(message, {ttl: ttl});
				},
				error: function(message){
					growl.addErrorMessage(message, {ttl: ttl});
				}
			};
			return api;
		}]);
	}
);

