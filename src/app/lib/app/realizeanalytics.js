// initial ga object defined in head of index.html

define(['angularAMD',"google-analytics", 'angular' , 'realize-sync', 'lodash', 'user', 'context', 'screen', 'util'],
function (angularAMD, ga, angular) {

	var module = angular.module('realizeanalytics',['ng', 'realize-sync', 'user', 'context', 'screen', 'util']);

	module.filter('trackEvent', ['reanalytics',function(reanalytics) {
		return function(category, action, opt_label, opt_value, opt_noninteraction) {
			reanalytics.event(category,action,opt_label,opt_value,opt_noninteraction);
		};
	}]);

	module.factory("reanalytics", ["$rootScope", "user", 'widget', 'EVENTS', '$location', 'plugin', 'notification',
	function ($rootScope, user, widget, EVENTS, $location, plugin, notification) {
		// initialize ga
		ga('create', 'UA-49667431-1',{
			'cookieDomain': 'none',
			'siteSpeedSampleRate':100
		});

		var a = {
			event:function (category,action,opt_label,opt_value,opt_noninteraction) {
				ga('send', 'event', category,action,opt_label,opt_value,opt_noninteraction);
			},
			pv:function (path) {
				if (typeof path !== 'string'){
					throw 'reanalytics.pv requires a string';
				}
				ga('send', {
				  'hitType': 'pageview',
				  // 'title': 'my overridden page',
				  'page': path
				});
			}
		};
		return a;
	}]);
	return module;
});