define([
    'angular',
    'angularAMD',
    'jquery',
    'angular-ui-router',
    'ngTouch',
    'angular-ui-bootstrap',
    'html_templates_jsfied',
    'realize-debugging',
    'user',
    'widget',
    'lodash',
    'realize-lodash',
    'angular-charts',
    'moment'
], function (angular, angularAMD, $) {
    var DEBUG_MODE = false;

    var module = angular.module('realize', ['ui.bootstrap', 'ui.router', 'realize-debugging', 'http-auth-interceptor', 'user', 'widget', 'realize-lodash', 'angularCharts'])
    .constant('EVENTS', {
        // auth
        loginSuccess: 'auth-loginConfirmed',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        tokenExpired: 'auth-token-expired',
        notAuthenticated: 'auth-loginRequired',
        notAuthorized: 'auth-not-authorized',
        switchWidgetTree: 'widget-replace-tree'
    })

    .constant('USER_ROLES', {
        all: '*',
        admin: 'admin',
        guest: 'guest'
    })

    .config( ['$stateProvider','$urlRouterProvider','$locationProvider','$controllerProvider','$compileProvider',
      function ($stateProvider, $urlRouterProvider, $locationProvider, $controllerProvider, $compileProvider) {
        // enable pushstate so urls are / instead of /#/ as root
        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/');
      }
    ])


    // run is where we set initial rootscope properties
    .run(['$rootScope', 'debugging', 'EVENTS', function ($root, debugging, EVENTS) {
        debugging.enableDebugging();
        $root.closeMenus = function(){
          var open = false;
          if($root.showleftmenu){open = true;$root.showleftmenu = 0;}
          if($root.showrightmenu){open = true;$root.showrightmenu = 0;}
          return open;
        };
      }
    ]);
    return module;
});