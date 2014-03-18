ngDefine('realize', [
    'angular',
    'jquery',
    'module:ui.router:angular-ui-router',
    'ngTouch',
    'module:restangular',
    'module:ui.bootstrap:angular-ui-bootstrap',
    'module:html_templates_jsfied',
    'module:realize-utils:components/util/utils',
    'module:http-auth-interceptor',
    'controllers',
    'directives'
], function (module, angular, angularRoute, html_templates_jsfied, ngTouch, restangular) {
    var DEBUG_MODE = false;

    module
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

});