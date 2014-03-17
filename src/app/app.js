var DEBUG_MODE = false;
window.realize = angular.module( 'realize', [
  'html_templates_jsfied',
  'ui.router',
  'ngTouch',
  'ui.bootstrap',
  'realize-app-utils',
  // 'mock-backend',
  'restangular',
  'http-auth-interceptor'
])

.config( ['$stateProvider','$urlRouterProvider','$locationProvider','$controllerProvider','$compileProvider','RestangularProvider',
  function ($stateProvider, $urlRouterProvider, $locationProvider, $controllerProvider, $compileProvider, RestangularProvider) {
    RestangularProvider.setBaseUrl('/api/v1/');
    // RestangularProvider.setListTypeIsArray(false);
    // RestangularProvider.setResponseExtractor(function(response, operation, what,something,something2) {
    //   // console.log('extractor response',response);
    //   // console.log('extractor operation',operation);
    //   // console.log('extractor what',what);
    //   // console.log('extractor something',something);
    //   // console.log('extractor something2',something2);
    //   // console.log()
    //   return response;
    // });
    //
    // enables registering controllers asynchronously
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

    $stateProvider.state({
      name:'root',
      url:'/',
      templateUrl:'widget.tpl.html',
      controller:'WidgetCtrl',
      resolve:{
        baseTemplateName:['$rootScope','user','widget','resource','$q',function($root,user,widget,resource,$q){
          console.log('in baseTemplateName');
          var d = $q.defer();
          user.hasAuth()
          .then(function (userProfile) {
            // for now, load the default dashboard.
            // otherwise we'll load the user's default dashboard
            console.log('baseTemplateName success');
            widget.getTemplate('realize_default_dashboard')
            .then(function () {
              d.resolve('realize_default_dashboard');
            });
          });
          return d.promise;
        }]
      }
    });
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
])


/**
 * Controllers
 */

.controller("TopNavCtrl", ['$scope', '$window', 'user', 'Restangular', function($scope, $window, user, Restangular){
  console.log('TopNavCtrl $scope',$scope);
  var baseAuthorizations;
  $scope.updateAuthorizations = function(){
        baseAuthorizations = Restangular.one("user", user.getProp('hashkey')).all('authorizations');
        baseAuthorizations.getList().then(function (data){
            console.log("Authorization list: ", data);
            $scope.authorizationList = data;
        });
  };
    $scope.updateAuthorizations();
    $scope.$on('$viewContentLoaded', function() {
        $scope.updateAuthorizations();
    });

  $scope.authRedirect = function(auth){
      var query_url = auth.url + "?token=" + user.getProp('token');
      $window.location.href = query_url;
  };
}])


.controller("LeftMenuCtrl", ['$scope', 'user', 'Restangular', function($scope, user, Restangular){
  $scope.dashboardListSource = 'installed';
  console.log('LeftMenuCtrl $scope',$scope);
  var basePlugins;
  $scope.updatePlugins = function(){
       basePlugins = Restangular.one("user", user.getProp('hashkey')).all('plugins');
      basePlugins.getList().then(function (data) {
              console.log("Plugin list: ", data);
              $scope.pluginList = data;
          });
  };
  $scope.updatePlugins();
    $scope.$on('$viewContentLoaded', function() {
        $scope.updatePlugins();
    });
    $scope.addPlugin = function(pluginHashkey){
        console.log("Adding plugins.");
    };

    $scope.removePlugin = function(pluginHashkey){

    };
  $scope.addPlugin = function(pluginObj){
            console.log("Adding a plugin");
            basePlugins.one(pluginObj.hashkey).one('actions').one('add').get(null, null, null).then(function (data) {
                console.log("Plugin added: ", data);
                $scope.updatePlugins();
            });
        };
  $scope.removePlugin = function(pluginObj){
      console.log("Removing a plugin");
      basePlugins.one(pluginObj.hashkey).one('actions').one('remove').get(null, null, null).then(function (data) {
          console.log("Plugin added: ", data);
          $scope.updatePlugins();
      });
  };
}])


.controller("RightMenuCtrl", ['$scope', function($scope){
  console.log('RightMenuCtrl $scope',$scope);
}])

.controller("WidgetCtrl", ['$scope','Restangular','$q','$window','widget','user','resource','baseTemplateName',function($scope,Restangular,$q,$window,widget,user,resource,baseTemplateName){
  console.log('WidgetCtrl RUNNING');
  $scope.add = function  (widgetName,options) {
    widget.getTemplate(widgetName)
    .then(function (templateHtmlStr) {


      // widget.loadChildren()
      widget.loadData('somedataurl')
      .then(function (data) {
        angular.extend($scope,{name:widgetName,content:templateHtmlStr},data,options);
        // console.log('data,opts',data,opts);
      });
    })
    .catch(function () {
      console.log('widget.getTemplate fail args in WidgetCtrl',arguments );
    });
  };

  $scope.remove = function  (widgetHash) {
    // remove code
  };

  $scope.add(baseTemplateName);
}])

.controller('LoginCtrl', ['$scope','Restangular','$q','$window', 'user', 'authService' ,function($scope,Restangular,$q,$window,user, authService){
    // var Restangular = $injector.get('Restangular');
    console.log('LoginCtrl scope',$scope);
    $scope.formData = {
        "email": "test@realize.pe",
        "password": "testtest"
    };
    $scope.loginType = "Login";
    var loginOrRegister = function  () {
        var options = {
            loginType:$scope.loginType,
            formData:$scope.formData
        };
        user.tryAuthorization(options)
            .then(function () {
                // redirect to user's dashboard
                var token = user.getProp('token');
                var data = {};
                var updater = function(config){
                    if(config !== undefined){
                        if(config.data !== undefined){
                            config.data.token = token;
                        }
                        if(config.headers !== undefined){
                            config.headers['Authentication-Token'] = token;
                        }
                    }
                    return config;
                };
                authService.loginConfirmed(data, updater);
            });
    };
    $scope.login = function(){
        loginOrRegister();
    };
    $scope.register = function(){
        loginOrRegister();
    };
    $scope.logout = function () {
        Restangular.one('logout').get(null, null, null)
            .finally(function () {
                user.deAuthorize();
                $scope.add('realize_default_dashboard');
                // body...
            });
    };
}])

.directive('widgetContent', ['$compile', function ($compile) {
  return {
    template:'<div></div>',
    restrict: 'E',
    replace:true,
    scope:false,
    compile:function(tElement){ // tElement, tAttrs, transclude
      return {
        pre:function(scope, iElement, iAttrs){
          scope.$watch('content',function(tpl){
            iElement.html('');
            iElement.append($compile(scope.content)(scope));
          });
        }
      };
    }
  };
}])

.directive('checkLogin', [function(){
    return {
        restrict: 'C',
        link: function(scope, elem, attrs){
            console.log('checkLogin');
            var login = elem.find("#loginForm");
            var main = elem.find("#content");
            scope.$on('event:auth-loginRequired', function() {
                scope.login = true;
                login.slideDown('slow', function() {
                    main.hide();
                });
                console.log('checkLogin: auth-needed');
            });

            scope.$on('event:auth-loginConfirmed', function() {
                console.log('checkLogin: login-confirmed');
                main.show();
                login.slideUp();
                scope.login = false;
            });
        }
    };
}])

.directive('leftMenu', [function () {
  return {
    templateUrl: 'left-menu.tpl.html',
    replace: true,
    restrict: 'E',
    controller: 'LeftMenuCtrl',
    link: function(scope){
        scope.updatePlugins();
    }
  };
}])

.directive('loginForm', [function(){
   return {
       templateUrl: 'widgets/realize_login/realize_login.tpl.html',
       replace: true,
       restrict: "E",
       controller: "LoginCtrl"
   };
}])

.directive('rightMenu', [function () {
  return {
    templateUrl: 'right-menu.tpl.html',
    replace: true,
    restrict: 'E',
    controller: 'RightMenuCtrl'
  };
}])

.directive('topNav', [function () {
  return {
    templateUrl: 'top-nav.tpl.html',
    replace: true,
    restrict: 'E',
    controller: 'TopNavCtrl'
  };
}])

// adds a pseudo phone body around the content when on a desktop, for pre-beta evaluation
.directive('hapSize', ['$timeout','$window', 'utils', function ($timeout, $window, utils) {
  return {
    restrict: 'A',
    link: function (scope) { // scope, iElement, iAttrs


      function size(){

        var wHeight = $window.innerHeight;
        var wWidth = $window.innerWidth;
        var container = angular.element('.root-container');

        function px(percent){
          return Math.floor((wWidth * percent) / 100) + 'px';
        }

        // resize the container
        /* global detectMobileBrowser */
        if(utils.detectMobileBrowser() === false){
          // could use a media query for some of this, but doing it here
          // to keep all beta-testing resize code in one place.

          if (wHeight > 800) {
            // 1000 pics is a mobile screen, but it often requires
            // scrolling on conventional browsers, so limit the size here.
            wHeight = 800;
          }
          // maintain a 16:9 aspect ratio
          var maxWidth = Math.floor(wHeight / 16 * 9);
          var maxHeight = Math.floor(wWidth / 9 * 16);
          if(wWidth > maxWidth){
            wWidth = maxWidth;
          } else if (wHeight > maxHeight){
            wHeight = maxHeight;
          }

          // wrap iin a pseudo phone border for beta testers to see on their computers
          // and resize to fit aspect ratio
          container.css({
            width:wWidth,
            height:wHeight,
            border:"30px solid #000",
            borderBottom:"90px solid #000",
            // and center it
            position:'absolute',
            margin:'auto',
            top:0,
            left:0,
            bottom:0,
            right:0
          });

        } else{
          container.attr('style','width:100%;height:100%;');
        }

        // make the font size dynamic
        container.css({
          fontSize:px(4)
        });
      }
      // wait for browser rendering to finish the last menu
      // ugh. Angular lacks a callback for all rendering done.
      // this is hacky.  Need a better way within the scope lifecycle so we don't need setTimeout.
      // Potential solution!!
      // $viewContentLoaded from ui router at https://github.com/angular-ui/ui-router/wiki/Quick-Reference#events-1
      $timeout(size,0);

      // resize when window resizes
      angular.element($window).bind('resize', function () {
        scope.$apply(function(){
          size();
        });
      });
    }
  };
}])

// renders a series of dashboard display template partials as individually scoped elements
.directive('partialsContainer',
['$rootScope','$templateCache','$compile',
function ($root, $templateCache, $compile) {
  return {
    template: '<div>foo</div>',
    replace: true,
    restrict: 'E'
    // compile runs digest once.
    // link would run digest each time the model changes, including each time a new child is appended.
    // compile:function(){ // tElement, tAttrs, transclude
    //   return {
    //     pre:function(scope, iElement, iAttrs){ // scope, iElement, iAttrs, controller
    //       // var counter = 0;
    //       // for some reason, making this $root.$watch causes the counter to log 3, 2, 1;
    //       // where making it scope.$watch only makes it render 1 each time.
    //       // Apparently a root watch will run 3 times.
    //       //
    //       scope.$watchCollection('[dashboard,people]', function (changed) { // also works
    //       // // scope.$watch('[dashboard,people]', function (changed) {
    //       //   console.log('RENDERING',++counter);
    //       //   // clean up
    //       //   iElement.html('');
    //       //   var templateObj = iAttrs.templateObjectsArray === 'appSettings' ?
    //       //     $root.user.installed_tabs.realize_app.settings :
    //       //     $root.dashboard[iAttrs.templateObjectsArray];
    //       //   var templateArray;
    //       //   if(templateObj === undefined || templateObj[groupOrIndividual] === undefined || !templateObj[groupOrIndividual].length){
    //       //     templateArray = [{template:''}];
    //       //     console.log('No templates defined for dashboard: ' + $root.dashboard.name);
    //       //     console.log('templateObj: ' + templateObj);
    //       //   } else{
    //       //     templateArray = templateObj[groupOrIndividual];
    //       //   }
    //       //   // var tempDom = angular.element('<div></div>');
    //       //   angular.forEach(templateArray,function(obj,idx){
    //         // angular.forEach([],function(obj,idx){
    //         //   // create a new child scope for each
    //         //   var childScope = scope.$new();
    //         //   // add the template's data to its scope
    //         //   childScope.template_data = obj;
    //         //   childScope.idx = idx;
    //         //   // get the partials from the cache
    //         //   var templateStr = $templateCache.get('dashboards/' + obj.template.split(' : ').join('/'));
    //         //   // if the template str is still blank, return a message;
    //         //   // console.log('templateStr',templateStr);
    //         //   templateStr = templateStr || '<div>The author of dashboard "' + $root.dashboard.name + '" did not specify a template to display ' + groupOrIndividual + 's.</div>';
    //         //   // append the element to the dom - can batch these into one dom write for performance
    //         //   iElement.append($compile(templateStr)(childScope));
    //         // });
    //       });
    //     }
    //   };
    // }
  };
}]);