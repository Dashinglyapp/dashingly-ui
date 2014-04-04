define([
	'angular',
	'angularAMD',
	'jquery',
	'spin',
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
	'util',
	'angular-growl',
	'error',
	'angular-gridster',
	'realize-sync',
	'angular-spinner',
	'realizeanalytics'
], function (angular, angularAMD, $, Spinner) {

	var module = angular.module('realize', [
    'ui.bootstrap',
    'realize-debugging',
    'http-auth-interceptor',
    'user',
    'widget',
    'realize-lodash',
    'angularCharts',
    'ngRoute',
    'formly',
    'screen',
    'view',
    'context',
    'plugin',
    'util',
    'angular-growl',
    'error',
    'gridster',
    'realize-sync',
    'angularSpinner',
    'realizeanalytics'
  ])
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

		.config(['$locationProvider', '$controllerProvider', '$compileProvider', '$routeProvider', '$provide',
			function ($locationProvider, $controllerProvider, $compileProvider, $routeProvider, $provide) {
				// for debugging purposes, log all events emitted to rootscope.
				$provide.decorator('$rootScope', ['$delegate', function ($delegate) {
					var emit = $delegate.$emit;

					$delegate.$emit = function () {
						console.log.apply(console, arguments);
						emit.apply(this, arguments);
					};

					return $delegate;
				}]);
				// enable pushstate so urls are / instead of /#/ as root
				$locationProvider.html5Mode(true);
				$routeProvider.otherwise({
					template: '',
					controller:['reanalytics','$scope','$rootScope','EVENTS','$location','widget','cachedWidget',
					function(reanalytics,$scope,$rootScope,EVENTS,$location,widget,cachedWidget){
						$rootScope.$emit(EVENTS.switchWidgetTree, cachedWidget.type, cachedWidget.name);
						$scope.$on('$viewContentLoaded',function () {
							reanalytics.pv($location.$$url);
							console.log('$viewContentLoaded in routeprovider: good url = ',$location.$$url);
						});
					}],
					resolve:{
						cachedWidget:['$location','widget','$q','reanalytics','$route',function ($location,widget,$q,reanalytics,$route) {
							console.log('$location',$location);
							var d = $q.defer();
							var pathArray = $location.path().split('/');
							var type = pathArray[1] || 'index';
							var name = pathArray[2] || 'default';
							// loading the widget to cache it before loading it
							// This is a workaround for the current widget
							// controller not providing a way to stop the page from
							// rendering when widgets aren't found.
							widget.loadWidget(type)
							.then(function (data) {
								if (!data || data.type !== type){
									reanalytics.pv('/no-widget-named/' + type + '/' + name);
									console.log('$rejected in routeprovider: badurl url = ',$location.$$url);
									// d.reject();
									// replace the history state with the new state
									$location.path('/' + data.type + "/" + data.name).replace();
								} else {
									d.resolve(data);
								}
							});
							return d.promise;
						}]
					}
				});

				$provide.decorator('$rootScope', ['$delegate', function ($delegate) {

					Object.defineProperty($delegate.constructor.prototype, '$onRootScope', {
						value: function (name, listener) {
							var unsubscribe = $delegate.$on(name, listener);
							this.$on('$destroy', unsubscribe);
						},
						enumerable: false
					});


					return $delegate;
				}]);
			}
		])


		// run is where we set initial rootscope properties
		.run(['$rootScope', 'user', 'EVENTS', '$window','reanalytics','$location',
		function ($rootScope, user, EVENTS, $window,reanalytics,$location) {

			// check user auth status on initial pageload
			$rootScope.authed = user.isAuthed();

			$rootScope.$watch(user.isAuthed, function (newVal, oldVal) {
				$rootScope.authed = newVal;
			});
			$rootScope.closeMenus = function () {
				var open = false;
				if ($rootScope.showleftmenu) {
					open = true;
					$rootScope.showleftmenu = 0;
				}
				if ($rootScope.showrightmenu) {
					open = true;
					$rootScope.showrightmenu = 0;
				}
				return open;
			};

			$window.Spinner = Spinner;
		}
		])

		.filter('capitalize', [function () {
			return function (input, scope) {
				if (input !== null) {
					input = input.toLowerCase();
				}

				return input.substring(0, 1).toUpperCase() + input.substring(1);
			};
		}])

		.factory('$exceptionHandler', ['error', function (error) {
			return function (exception, cause) {
				error.handleException(exception, cause);
			};
		}]);
	return module;
});