var STATE_PROVIDER; // ugly global workaround for lazy loading states.  Only used in app.js file.
var DEBUG_MODE = false;
var happ = angular.module( 'realize', [
  'html_templates_jsfied',
  'ui.router',
  'ngTouch',
  'ui.bootstrap',
  'realize.api-promises',
  'realize-app-utils'
])

.config( ['$stateProvider','$urlRouterProvider','$locationProvider',
  function ($stateProvider , $urlRouterProvider, $locationProvider) {
    // store the state provider for lazy loading states
    STATE_PROVIDER = $stateProvider;
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
      templateURL:'dashboard.tpl.html',
      controller:'MainCtrl'//,
      // resolve:{
      //   auth:['userReady',function(userReady){
      //     return userReady;
      //   }]
      // }
    });
  }
])


// run is where we set initial rootscope properties
.run([
  '$rootScope',
  '$state',
  'api-promises',
  'utils',
  '$stateParams',
  'lodash',
  '$timeout',
  function ($root, $state, apiPromises,utils,$stateParams,_,$timeout) {
    // This section is fugly!
    // Lazy loading templates and states is not something UI router handles well.
    // utils.enableDebugging();

    // set root properties - I think these can go in a parent controller.
    // console.log('apiPromises.login',apiPromises.login.get());
    // apiPromises.login.get().then(function(auth){
      // $root.dashboardList = $root.user.settings.dashboards;
      // $root.activeDashboard = _.find($root.dashboardList,{name:$root.user.settings.defaultDashboard});
      // $root.setActiveWidgets($root.activeDashboard);

      // $root.setActiveWidgets(dashboardObj);


    $root.closeMenus = function(){
      var open = false;
      if($root.dashboardListSelectorVisible){open = true;$root.dashboardListSelectorVisible = 0;}
      if($root.showleftmenu){open = true;$root.showleftmenu = 0;}
      if($root.showrightmenu){open = true;$root.showrightmenu = 0;}
      return open;
    };

    $root.setActiveWidgets = function(widgetsList){
      $root.activeWidgets = _.map(widgetsList,function(widgetName){
        return _.find($root.user.settings.widgets,{name:widgetName});
      });
    };
    //
  }
])


/**
 * Controllers
 */

.controller("MainCtrl", ['$scope','Restangular','$q','$window',function($scope,Restangular,$q,$window){
  var def = $q.defer();
  $scope.moreinfo = false;
  $scope.login = false;
  $scope.register = false;
  $scope.auth_token = $window.localStorage.auth_token;
  Restangular.all('auth_check')
  .post({token: $scope.auth_token},{token: $scope.auth_token},{token: $scope.auth_token})
  .then(function(){
    console.log('auth_check success arguments',arguments);
  })
  .catch(function () {
    console.log('auth_check fail arguments',arguments);
    $scope.moreinfo = true;
  });
  return def;
}])

// .service('userReady', ['Restangular','$q','$window', function(Restangular,$q,$window){
//   Restangular.all('auth_check')
//   .getList({},{token:token})
//   .then(function(){
//     console.log('auth_check success arguments',arguments);
//   })
//   .catch(function () {
//     console.log('auth_check fail arguments',arguments);
//   });
// }])

// create separate login panel for now.
// make switch in html.
// convert this to a widget later
.controller('LoginCtrl', ['$scope','Restangular','$q','$window', function($scope,Restangular,$q,$window){
  $scope.formData = {
    "email": "test@realize.pe",
    "password": "testtest"
  };
  $scope.postMessage = '';
  $scope.getMessage = '';
  $scope.loginOrRegister = function (either){
    Restangular.all(either).getList().then(function(data){
      console.log(either + ' GET success arguments',arguments);
      $scope.getMessage = 'GET success';
      Restangular.all(either)
      .post($scope.formData,{},{'Content-Type':'application/json','X-CSRFToken':data.csrf_token})
      .then(function(data){
        console.log(either + ' POST success arguments',arguments);
        $scope.user = data.user;
        $window.localStorage.token = data.user.token;
        console.log('$window.localStorage.token',$window.localStorage.token);
      })
      .catch(function(err){
        delete $window.localStorage.token; // Erase the token if the user fails to log in
        // Handle login errors
        // angular.forEach(err.data.fields,function(obj,iter){
        //   console.log(either + ' POST error iter,obj', iter,obj);
          // if(obj.errors.length){
            // angular.forEach(obj,function(str){
            //   $scope.postMessage += str + '</br>';
            // });
          // }
        // });
        $scope.postMessage = 'POST error';

      });
    })
    .catch(function(){
      console.log(either + ' GET error arguments',arguments);
      $scope.getMessage = 'GET error';
    });
  };

  $scope.logout = function () {
    Restangular.all('logout').getList()
    .then(function(){
    })
    .catch(function(){
      console.log('logout fail',arguments);
    })
    .finally(function () {
      delete $window.localStorage.token;
      $scope.$parent.moreinfo = true;
      $scope.$parent.login = false;
      $scope.$parent.register = false;
      $scope.$parent.message = "logged out";
      // body...
    });
  };
}])

// Top Nav
.controller("TopNavCtrl", ['$scope', function($scope){
  console.log('TopNavCtrl $scope',$scope);
}])


.controller("LeftMenuCtrl", ['$scope', function($scope){
  $scope.dashboardListSource = 'installed';
  console.log('LeftMenuCtrl $scope',$scope);
}])


.controller("RightMenuCtrl", ['$scope', function($scope){
  console.log('RightMenuCtrl $scope',$scope);
}])

// adds a pseudo phone body around the content when on a desktop, for pre-beta evaluation

.directive('widget', [function () {
  return {
    template: 'login.tpl.html',
    replace: true,
    restrict: 'E',
    controller: 'WidgetCtrl'
  };
}])

.directive('dashboard', [function () {
  return {
    template: 'login.tpl.html',
    replace: true,
    restrict: 'E',
    controller: 'WidgetCtrl'
  };
}])

.directive('leftMenu', [function () {
  return {
    templateUrl: 'left-menu.tpl.html',
    replace: true,
    restrict: 'E',
    controller: 'LeftMenuCtrl'
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

        // resize menu buttons
        // var menuToggleSize = px(25);
        // container.find('.menu-toggle').css({
        //   height:menuToggleSize,
        //   width:menuToggleSize
        // });


        // var menu = angular.element('.panel');
        // // console.log('(menuToggleSize + 30)+px',(menuToggleSize + 30)+'px');
        // menu.css({
        //   bottom:px(26),
        //   fontSize:px(3.5)
        // });

        // var menuBody = angular.element('.panel-body');
        // var guttersWidth = 40;
        // var columns = 3;
        // var buttonWidth = ((menuBody.width() - guttersWidth) / columns)+'px';
        // menuBody.find('.btn').each(function(){
        //   angular.element(this).css({
        //     height:buttonWidth,
        //     width:buttonWidth
        //   });
        // });

        // angular.element('.splash').addClass('hidden');
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