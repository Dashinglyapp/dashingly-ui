define([
	'angular',
	'angularAMD',
	'jquery',
	'ngTouch',
	'angular-ui-bootstrap',
	'realize-debugging',
	'user',
	'widget',
	'lodash',
	'realize-lodash',
	'angular-charts',
	'moment',
	'ngRoute',
	'angular-formly',
	'screen',
	'ngload',
	'view',
	'context',
	'plugin',
	'util'
], function (angular, angularAMD, $) {
	var DEBUG_MODE = false;

	var module = angular.module('realize', ['ui.bootstrap', 'realize-debugging', 'http-auth-interceptor', 'user', 'widget', 'realize-lodash', 'angularCharts', 'ngRoute', 'formly', 'screen', 'view', 'context', 'plugin', 'util'])
		.constant('EVENTS', {
			// auth
			loginSuccess: 'event:auth-loginConfirmed',
			loginFailed: 'event:auth-login-failed',
			logoutSuccess: 'event:auth-logout-success',
			logoutAttempt: 'event:auth-logout-attempt',
			tokenExpired: 'event:auth-token-expired',
			notAuthenticated: 'event:auth-loginRequired',
			notAuthorized: 'event:auth-not-authorized',
			switchWidgetTree: 'event:widget-replace-tree',
			widgetSettingsChange: 'event:widget-change-settings',
			widgetUpdateChildrenSettings: 'event:widget-change-settings',
			widgetRefreshPressed: 'event:widget-refresh',
			widgetRenderData: 'event:widget-render',
			widgetViewChange: 'event:widget-view-change',
			widgetAddToDash: 'event:widget-add-to-dash'
		})

		.constant('USER_ROLES', {
			all: '*',
			admin: 'admin',
			guest: 'guest'
		})

		.config(['$locationProvider', '$controllerProvider', '$compileProvider', '$routeProvider', '$provide', '$parseProvider',
			function ($locationProvider, $controllerProvider, $compileProvider, $routeProvider, $provide, $parseProvider) {
				// for debugging purposes, log all events emitted to rootscope.
				$provide.decorator('$rootScope', function ($delegate) {
					var emit = $delegate.$emit;
					$delegate.$emit = function () {
						console.log.apply(console, arguments);
						emit.apply(this, arguments);
					};
					return $delegate;
				});
				// enables promises to be used in templates
				// $parseProvider.unwrapPromises(true);
				// enable pushstate so urls are / instead of /#/ as root
				$locationProvider.html5Mode(true);

				$routeProvider
					.when('/', { template: '', controller: 'WidgetRouteCtrl'})
					.when('/:type', { template: '', controller: 'WidgetRouteCtrl'})
					.when('/:type/:name', {
						template: '',
						controller:'WidgetRouteCtrl'
					})
					.otherwise({
						redirectTo: '/'
					});
			}
		])


		// run is where we set initial rootscope properties
		.run(['$rootScope', 'user', 'EVENTS','widget', '$q',function ($root, user, EVENTS,widget,$q) {

			$root.closeMenus = function () {
				var open = false;
				if ($root.showleftmenu) {
					open = true;
					$root.showleftmenu = 0;
				}
				return open;
			};
		}
		])

		.filter('capitalize', [function () {
			return function (input, scope) {
				if (input !== null) {
					input = input.toLowerCase();
				}

				return input.substring(0, 1).toUpperCase() + input.substring(1);
			};
		}]);
	return module;
});