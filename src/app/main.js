var config = {
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
        'ngParse': 'thirdparty/requirejs-angular-define/src/ngParse',
        'controllers': 'components/app/controllers',
        'directives': 'components/app/directives',
        'realize-utils': 'components/util/utils',
        'angularAMD': 'thirdparty/angularAMD/angularAMD',
        'ngload': 'thirdparty/angularAMD/ngload'
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
        'angularAMD': {
            deps: ['angular']
        },
        'ngload': {
            deps: ['angularAMD']
        }
    },
    priority: [
        "angular"
    ]
};

require.config(config);

require(['angularAMD'], function(angularAMD) {

    // require the application
    require(['app', 'components/app/controllers', 'components/app/directives'], function(app) {

        // bootstrap the application
        angularAMD.bootstrap(app, true, document);
    });
});