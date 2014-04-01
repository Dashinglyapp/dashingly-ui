var config = {
	paths: {
		// Tests
		'appSpec': 'app.spec.js',

		// Third party
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
		'ngParse': 'thirdparty/requirejs-angular-define/src/ngParse',
		'angularAMD': 'thirdparty/angularAMD/angularAMD',
		'ngload': 'thirdparty/angularAMD/ngload',
		'd3': 'thirdparty/d3/d3.min',
		'angular-charts': 'thirdparty/angular-charts/dist/angular-charts.min',
		'moment': 'thirdparty/momentjs/min/moment.min',

		// Templates
		'html_templates_jsfied': 'html_templates_jsfied',

		// Core app modules
		'controllers': 'lib/app/controllers',
		'directives': 'lib/app/directives',

		// Common app modules
		'realize-debugging': 'lib/common/modules/debugging',
		'realize-sync': 'lib/common/modules/sync',
		'realize-mock-backend': 'lib/common/modules/mock-backend',
		'realize-lodash': 'lib/common/modules/lodash',

		// Common app models
		'widget': 'lib/common/models/widget',
		'user': 'lib/common/models/user'
	},
	shim: {
		'angular': {'deps': ['jquery'], 'exports': 'angular'},
		'angular-ui-router': ['angular'],
		'angularMocks': {
			deps: ['angular'],
			'exports': 'angular.mock'
		},
		'angular-charts': {
			deps: ['jquery', 'angular', 'd3']
		},
		'ngTouch': {
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

require(['angularAMD'], function (angularAMD) {

	// require the application
	require(['app', 'controllers', 'directives'], function (app) {

		// bootstrap the application
		angularAMD.bootstrap(app, true, document);
	});
});