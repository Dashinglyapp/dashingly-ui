require.config({
    paths: {
        'angular': 'thirdparty/angular/angular',
        'angular-ui-router': 'thirdparty/angular-ui-router/release/angular-ui-router',
        'jquery': 'thirdparty/jquery/jquery',
        'lodash': 'thirdparty/lodash/dist/lodash',
        'angular-ui-bootstrap': 'thirdparty/angular-bootstrap/ui-bootstrap-tpls',
        'angularMocks': 'thirdparty/angular-mocks/angular-mocks',
        'ngTouch': 'thirdparty/angular-touch/angular-touch',
        'http-auth-interceptor': 'thirdparty/angular-http-auth/src/http-auth-interceptor',
        'angularGesture': 'thirdparty/angular-gesture/ngGesture/gesture',
        'angularUIUtils': 'thirdparty/angular-ui-utils/modules/utils',
        'restangular': 'thirdparty/restangular/dist/restangular',
        'html_templates_jsfied': 'html_templates_jsfied',
        'ngDefine': 'thirdparty/requirejs-angular-define/src/ngDefine',
        'ngParse': 'thirdparty/requirejs-angular-define/src/ngParse',
        'ocLazyLoad': 'thirdparty/ocLazyLoad/ocLazyLoad'
    },
    shim: {
        'angular' : {'deps': ['jquery'], 'exports' : 'angular'},
        'angular-ui-router': ['angular'],
        'angularMocks': {
            deps:['angular'],
            'exports':'angular.mock'
        },
        'ngTouch':{
            deps: ['angular'],
            exports: 'ngTouch'
        },
        'angular-ui-bootstrap': {
            deps: ['angular']
        },
        'html_templates_jsfied': {
            deps: ['angular']
        },
        'http-auth-interceptor': {
            deps: ['angular']
        },
        'restangular': {
            deps: ['angular', 'lodash']
        },
        'ocLazyLoad': {
            deps: ['angular']
        }
    },
    priority: [
        "angular"
    ],
    packages: {
        app: {'location': '../app'}
    }
});

//http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
window.name = "NG_DEFER_BOOTSTRAP!";
require(['ngDefine', 'angular'], function(ngDefine, angular) {

    // require the application
    require(['app'], function() {

        // bootstrap the application
        angular.bootstrap(document.body, ['realize']);
    });
});