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
    'ngload'
], function (angular, angularAMD, $) {
    var DEBUG_MODE = false;

    var module = angular.module('realize', ['ui.bootstrap', 'realize-debugging', 'http-auth-interceptor', 'user', 'widget', 'realize-lodash', 'angularCharts', 'ngRoute', 'formly', 'screen'])
    .constant('EVENTS', {
        // auth
        loginSuccess: 'event:auth-loginConfirmed',
        loginFailed: 'event:auth-login-failed',
        logoutSuccess: 'event:auth-logout-success',
        tokenExpired: 'event:auth-token-expired',
        notAuthenticated: 'event:auth-loginRequired',
        notAuthorized: 'event:auth-not-authorized',
        switchWidgetTree: 'event:widget-replace-tree',
        widgetSettingsChange: 'event:change-settings',
        widgetViewChange: 'event:widget-view-change'
    })

    .constant('USER_ROLES', {
        all: '*',
        admin: 'admin',
        guest: 'guest'
    })

    .config( ['$locationProvider','$controllerProvider','$compileProvider', '$routeProvider', '$provide',
      function ($locationProvider, $controllerProvider, $compileProvider, $routeProvider, $provide) {
        // enable pushstate so urls are / instead of /#/ as root
          $routeProvider
              .when('/', { template: '', controller: 'WidgetRouteCtrl'})
              .when('/:type', { template: '', controller: 'WidgetRouteCtrl'})
              .when('/:type/:name', { template: '', controller: 'WidgetRouteCtrl'})
              .otherwise({
                  redirectTo: '/'
              });
          $locationProvider.html5Mode(true);

           $provide.decorator('$rootScope', ['$delegate', function($delegate){

            Object.defineProperty($delegate.constructor.prototype, '$onRootScope', {
                value: function(name, listener){
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
    .run(['$rootScope', 'debugging', 'EVENTS', function ($root, debugging, EVENTS) {
        debugging.enableDebugging();
        $root.closeMenus = function(){
          var open = false;
          if($root.showleftmenu){open = true;$root.showleftmenu = 0;}
          return open;
        };
      }
    ]);
    return module;
});