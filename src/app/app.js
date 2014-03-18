define([
    'angular',
    'angularAMD',
    'jquery',
    'angular-ui-router',
    'ngTouch',
    'restangular',
    'angular-ui-bootstrap',
    'html_templates_jsfied',
    'realize-utils',
    'http-auth-interceptor'
], function (angular, angularAMD, $) {
    var DEBUG_MODE = false;

    var module = angular.module('realize', ['ui.bootstrap', 'ui.router', 'restangular', 'realize-utils', 'http-auth-interceptor'])
    .config( ['$stateProvider','$urlRouterProvider','$locationProvider','$controllerProvider','$compileProvider','RestangularProvider',
      function ($stateProvider, $urlRouterProvider, $locationProvider, $controllerProvider, $compileProvider, RestangularProvider) {
        RestangularProvider.setBaseUrl('/api/v1/');
        window.registerController = function(name,fnArray){
          $controllerProvider.register(name,fnArray);
        };
          RestangularProvider.addFullRequestInterceptor(function(element, operation, route, url, headers, params) {
              headers['Authentication-Token'] = window.localStorage.realize_user_auth_token || '';
              return {
                  headers: headers
              };
          });
        // console.log('$rootScope',$rootScope);
        // enable pushstate so urls are / instead of /#/ as root
        $locationProvider.html5Mode(true);
        /**
         * States
         */
        $urlRouterProvider.otherwise('/');
      }
    ])


    // run is where we set initial rootscope properties
    .run(['$rootScope', 'utils', function ($root, utils) {
        utils.enableDebugging();
        $root.closeMenus = function(){
          var open = false;
          if($root.dashboardListSelectorVisible){open = true;$root.dashboardListSelectorVisible = 0;}
          if($root.showleftmenu){open = true;$root.showleftmenu = 0;}
          if($root.showrightmenu){open = true;$root.showrightmenu = 0;}
          return open;
        };
      }
    ]);
    return module;
});