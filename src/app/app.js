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
        logoutAttempt: 'event:auth-logout-attempt',
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
          // for debugging purposes, log all events emitted to rootscope.
          $provide.decorator('$rootScope', function ($delegate) {
            var _emit = $delegate.$emit;

            $delegate.$emit = function () {
              console.log.apply(console, arguments);
              _emit.apply(this, arguments);
            };

            return $delegate;
          });
          // enable pushstate so urls are / instead of /#/ as root
          $locationProvider.html5Mode(true);


          $routeProvider
              .when('/', { template: '', controller: 'WidgetRouteCtrl'})
              .when('/:type', { template: '', controller: 'WidgetRouteCtrl'})
              .when('/:type/:name', { template: '', controller: 'WidgetRouteCtrl'})
              .otherwise({
                  redirectTo: '/'
              });

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
    .run(['$rootScope', 'user', 'EVENTS', function ($root, user, EVENTS) {

        // check user auth status on initial pageload
        $root.authed = user.isAuthed();
        $root.$on(EVENTS.loginSuccess, function() {
          // change authed on login
          $root.authed = true;
        });
        $root.$on(EVENTS.loginFailed, function() {
            $root.authed = false;
        });
        $root.$on(EVENTS.logoutSuccess, function() {
            $root.authed = false;
        });
        $root.closeMenus = function(){
          var open = false;
          if($root.showleftmenu){open = true;$root.showleftmenu = 0;}
          return open;
        };
      }
    ]);
    return module;
});