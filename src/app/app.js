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

.config( ['$stateProvider','$urlRouterProvider',
  function ($stateProvider , $urlRouterProvider) {
    // store the state provider for lazy loading states
    STATE_PROVIDER = $stateProvider;
    // console.log('$rootScope',$rootScope);

    /**
     * States
     */
    // convert the routing request to a state request to use the state events
    var freshSession = true;
    var loggedIn = false;
    $urlRouterProvider.otherwise(function($injector,$location){
      console.log('OTHERWISE - $location','hash:',$location.hash(),'path:',$location.path());
      var redirectTo = $location.path().slice(1);
      var $state = $injector.get('$state');
      var apiPromise = $injector.get('api-promises');
      // what do we need to log in...
      //
      // this should happen on login POST... login get should render form
      // if user is not logged in, send to login dashboard.
      // if logged in, send to default dashboard

      // render a default dashboard border.
      //
      // If logged in, then render their default dashboard
      apiPromise.login.get().then(function () {
        if(freshSession === true){
          freshSession = false;
          redirectTo = 'loginDash';
        }
        // this should go to stateNotFound
        $state.go(redirectTo,{freshSession:true});
      });
    });

    $stateProvider.state({
      name:'root',
      url:'/',
      // templateProvider:function(){
      //   console.log('debug template()');
      //   return '<div ui-view></div>';
      // },
      views:{
        'menuleft':{
          controller:'LeftMenuCtrl',
          templateUrl:'left-menu.tpl.html'
        },
        'menuright':{
          controller:'RightMenuCtrl',
          templateUrl:'right-menu.tpl.html'
        },
        'topnav':{
          controller:'TopNavCtrl',
          templateUrl:'top-nav.tpl.html'
        },
        'main':{
          template:'<ui-view/>'
        },
        'modal':{
          templateUrl:'modal.tpl.html'
        }
      }
    });
    $stateProvider.state({
      name:'root.login',
      url:'/login',
      template:'login.tpl.html',
      controller:'loginCtrl'
    });

  }
])
// run is where we set initial rootscope properties
.run([
  '$rootScope',
  '$state',
  'api-promises',
  'utils',
  'dashboardFactory',
  '$stateParams',
  'lodash',
  '$timeout',
  'user',
  function ($root, $state, apiPromises,utils,dashboardFactory,$stateParams,_,$timeout,user) {
    // This section is fugly!
    // Lazy loading templates and states is not something UI router handles well.
    utils.enableDebugging();

    // set root properties - I think these can go in a parent controller.
    // console.log('apiPromises.login',apiPromises.login.get());
    apiPromises.login.get().then(function(auth){
      console.log('login.get() arguments', arguments );
      $root.user = {
        name:'foo',
        settings:{
          defaultDashboard:'fooDash',
          dashboards:[
            {
              name:'fooDash',
              widgets:['login']
            }
          ],
          widgets:[
            {name:'login',template:'login'}
          ],
          plugins:[

          ]
        }
      };
      $root.dashboardList = $root.user.settings.dashboards;
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
      $root.setActiveDashboard = function(dashboardObj){
        // handle states internally since triggering on $stateChangeSuccess kills css animations,
        // stateChangeStart doesn't fire on reloads
        // and stateNotFound only works the first time a state is called
        console.log('running $root.setActiveDashboard');
        if(!dashboardObj){return false; }
        var menusOpen = $root.closeMenus();
        $root.activeDashboard = dashboardObj;
        $root.dashboardChanged = !$root.dashboardChanged;
        if(menusOpen){
          $timeout(function(){
            // $state.transitionTo(stateName,{notify:true});
            $state.go('root.' + dashboardObj.name);
            $root.setActiveWidgets(dashboardObj.widgets);
          },1050); // wait for menu close
        } else {
          $state.go('root.' + dashboardObj.name);
          $root.setActiveWidgets(dashboardObj.widgets);
          console.log('switching dashboard');
        }
      };
    });
    //
    $root.$on('$stateNotFound',function(event, unfoundState, fromState, fromParams){
      console.log('$stateNotFound ' + unfoundState.to + '  - fired when a state cannot be found by its name.');

      var dashboardObj = _.find($root.dashboardList,{name:unfoundState.to});
      // if there are display templates, create the state and retry it
      // event.preventDefault();
      if (dashboardObj) {
        // $root.closeMenus();
        // we can't use event.retry because it will try switching the state before the menus close.
        // event.retry = dashboardFactory(unfoundState.to);

        dashboardFactory(dashboardObj).then(function(stateObj){
          $root.setActiveDashboard(dashboardObj);
        });
        return;
      }
      // else prevent the transition
      console.log('preventing switch to new state - no dashboard defined with that name');
      event.preventDefault();
    });
  }
])


// MAY BE ABLE TO USE THIS FOR WIDGETS
// lazy loads dashboards
// returns a promise for when the state is done loading
.service('dashboardFactory', [
  'api-promises',
  '$q',
  function (apiPromises, $q) {
    return function(dashboardObj){
      // get which dashboard to populate the state data from
      var stateObjDeferred = $q.defer();
        // parse dashboards here.
      apiPromises.login.get().then(function(api){

        // create a state object for the dashboard
        var stateObj = {
          name:'root.' + dashboardObj.name,
          url:dashboardObj.name,
          data:dashboardObj,
          controller:'MainViewCtrl',
          templateUrl:'dashboard.tpl.html' // gets replaced by the partialsContainer directive
        };

        // create the state
        STATE_PROVIDER.state(stateObj);
      // resolve the stateDefinedDeferred to load our newly defined state
        console.log('STATE '+ stateObj.name + ' now exists');
        stateObjDeferred.resolve(stateObj);
      });
      return stateObjDeferred.promise;
    };
  }
])
.service('authPromise', [
  'api-promises',
  '$q',
  function (engineApiPromise, $q) {

  }
])

/**
 * Controllers
 */

.controller("MainViewCtrl", ['$scope', function($scope){
  console.log('MainViewCtrl $scope',$scope);
}])

.controller('LoginCtrl', ['$scope','api-promises','$window',function ($scope, apiPromises, $window) {
  $scope.user = {
    "email": "test@realize.pe",
    "password": "test"
  };
  $scope.message = '';
  $scope.submit = function () {
    apiPromises.login.get().then(function(preLoginData){
      apiPromises.login.post($scope.user,{'X-CSRFToken':preLoginData.csrf_token})
      .then(function(postLoginData){
        $window.sessionStorage.token = postLoginData.token;
        $scope.message = 'Welcome';
      })
      .error(function(){
        delete $window.sessionStorage.token; // Erase the token if the user fails to log in

        // Handle login errors
        console.log('submit error arguments',arguments);
        $scope.message = 'Error: Invalid user or password';
      });

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
    template: '<div></div>',
    replace: true,
    restrict: 'E',
    // compile runs digest once.
    // link would run digest each time the model changes, including each time a new child is appended.
    compile:function(){ // tElement, tAttrs, transclude
      return {
        pre:function(scope, iElement, iAttrs){ // scope, iElement, iAttrs, controller
          var counter = 0;
          // for some reason, making this $root.$watch causes the counter to log 3, 2, 1;
          // where making it scope.$watch only makes it render 1 each time.
          // Apparently a root watch will run 3 times.
          //
          scope.$watchCollection('[dashboard,people]', function (changed) { // also works
          // scope.$watch('[dashboard,people]', function (changed) {
            console.log('RENDERING',++counter);
            // clean up
            iElement.html('');

            var groupOrIndividual = $root.people.tags.indexOf('group') < 0 ? 'individual' : 'group';
            // loop over the dashboard's display templates
            console.log('iAttrs',iAttrs);
            var templateObj = iAttrs.templateObjectsArray === 'appSettings' ?
              $root.user.installed_tabs.realize_app.settings :
              $root.dashboard[iAttrs.templateObjectsArray];
            var templateArray;
            if(templateObj === undefined || templateObj[groupOrIndividual] === undefined || !templateObj[groupOrIndividual].length){
              templateArray = [{template:''}];
              console.log('No templates defined for dashboard: ' + $root.dashboard.name);
              console.log('templateObj: ' + templateObj);
            } else{
              templateArray = templateObj[groupOrIndividual];
            }
            // var tempDom = angular.element('<div></div>');
            angular.forEach(templateArray,function(obj,idx){
              // create a new child scope for each
              var childScope = scope.$new();
              // add the template's data to its scope
              childScope.template_data = obj;
              childScope.idx = idx;
              // get the partials from the cache
              var templateStr = $templateCache.get('dashboards/' + obj.template.split(' : ').join('/'));
              // if the template str is still blank, return a message;
              // console.log('templateStr',templateStr);
              templateStr = templateStr || '<div>The author of dashboard "' + $root.dashboard.name + '" did not specify a template to display ' + groupOrIndividual + 's.</div>';
              // append the element to the dom - can batch these into one dom write for performance
              iElement.append($compile(templateStr)(childScope));
            });
          });
        }
      };
    }
  };
}]);