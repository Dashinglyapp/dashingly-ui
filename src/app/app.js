var DEBUG_MODE = false;
window.realize = angular.module( 'realize', [
  'html_templates_jsfied',
  'ui.router',
  'ngTouch',
  'ui.bootstrap',
  'realize-app-utils',
  'restangular'
])

.config( ['$stateProvider','$urlRouterProvider','$locationProvider','$controllerProvider','$compileProvider','RestangularProvider',
  function ($stateProvider , $urlRouterProvider, $locationProvider,$controllerProvider,$compileProvider,RestangularProvider) {
    RestangularProvider.setBaseUrl('/api/v1/');
    // RestangularProvider.setListTypeIsArray(false);
    RestangularProvider.setResponseExtractor(function(response, operation, what,something,something2) {
      console.log('extractor response',response);
      console.log('extractor operation',operation);
      console.log('extractor what',what);
      console.log('extractor something',something);
      console.log('extractor something2',something2);
      return response;
      // if(operation === 'getList'){
      //   return response;
      // }
      // return response[what];
      // return operation === 'getList' ?
      //   response :
      //   response[what];
      // return response;
    });
    window.registerController = function(name,fnArray){
      $controllerProvider.register(name,fnArray);
    };
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
          })
          .catch(function () {
            console.log('baseTemplateName fail');
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
.run([
  '$rootScope',
  '$state',
  'utils',
  '$stateParams',
  'lodash',
  '$timeout',
  'Restangular',
  '$q',
  '$http',
  '$window',
  function ($root, $state, utils,$stateParams,_,$timeout, Restangular, $q, $http, $window) {
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


.controller("WidgetContainerCtrl", ['$scope','Restangular','$q','$window','baseTemplateName',function($scope,Restangular,$q,$window,baseTemplateName){
  console.log('WidgetContainerCtrl RUNNING');
  $scope.add(baseTemplateName);
}])

.controller("WidgetCtrl", ['$scope','Restangular','$q','$window','widget','user','resource','baseTemplateName',function($scope,Restangular,$q,$window,widget,user,resource,baseTemplateName){
  console.log('WidgetCtrl RUNNING');
  $scope.add = function  (widgetName,options) {
    widget.getTemplate(widgetName)
    .then(function (templateHtmlStr) {

      var opts = angular.extend({name:widgetName,content:templateHtmlStr},options);
      console.log('opts',opts);

      // widget.loadChildren()
      // if(options.resource){
      //   // get stuff from user profile
      //   // widget.loadResource()
      // } else if (options.children){
      //   options.children
      //   angular.forEach(options.children,function(child,idx){

      //   })
      // }
      widget.loadData('somedataurl')
      .then(function (data) {
        angular.extend(opts,data);
        $scope.widget = opts;
        console.log('data,opts',data,opts);
      });
    })
    .catch(function () {
      console.log('widget.getTemplate fail args in WidgetCtrl',arguments );
    });
  };
  $scope.buildResourceTree = function (resourceObj) {
    // var default_widget = user.getDefaultWidget();
    // resource.getTree(user.profile.resources);
    // baseTemplateName
  };
  $scope.addChildren = function(resourceObj){

  };

  $scope.remove = function  (widgetHash) {
    $scope.widget = null;
  };

  $scope.add(baseTemplateName);
}])

// adds a pseudo phone body around the content when on a desktop, for pre-beta evaluation

.directive('widgetContent', ['$compile', function ($compile) {
  return {
    template:'<div></div>',
    restrict: 'E',
    replace:true,
    scope:false,
    compile:function(tElement){ // tElement, tAttrs, transclude
      return {
        pre:function(scope, iElement, iAttrs){
          scope.$watch('widget.content',function(tpl){
            iElement.html('');
            iElement.append($compile(scope.widget.content)(scope));
          });
        }
      };
    }
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