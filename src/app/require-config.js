require.config({
	paths: {
		// Third party
		'angular': 'thirdparty/angular/angular',
		'angular-ui-router': 'thirdparty/angular-ui-router/release/angular-ui-router',
		'jquery': 'thirdparty/jquery/jquery',
		'jquery-ui': 'thirdparty/jquery-ui/ui/minified/jquery-ui.min',
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
		'ngRoute': 'thirdparty/angular-route/angular-route',
		'angular-formly': 'thirdparty/angular-formly/dist/formly',
		'angular-growl': 'thirdparty/angular-growl/build/angular-growl',
		'angular-animate': 'thirdparty/angular-animate/angular-animate',
		'angular-gridster': 'thirdparty/angular-gridster/dist/scripts/gridster.min',
		'es5-shim': 'thirdparty/es5-shim/es5-shim',
		'angular-spinner': 'thirdparty/angular-spinner/angular-spinner',
		'spin': 'thirdparty/spin.js/spin',

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
		'user': 'lib/common/models/user',
		'screen': 'lib/common/models/screen',
		'view': 'lib/common/models/view',
		'context': 'lib/common/models/context',
		'plugin': 'lib/common/models/plugin',
		'util': 'lib/common/models/util',
		'notification': 'lib/common/models/notification',
		'error': 'lib/common/models/error',

		//Loader
		'bootstrap': 'bootstrap'
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
		},
		'angular-formly': {
			deps: ['angular']
		},
		'ngRoute': {
			deps: ['angular']
		},
		'angular-growl': {
			deps: ['angular']
		},
		'angular-animate': {
			deps: ['angular']
		},
		'angular-gridster': {
			deps: ['angular', 'jquery-ui', 'es5-shim']
		},
		'angular-spinner': {
			deps: ['angular', 'spin']
		},
		'jquery-ui': {
			deps: ['jquery']
		}

	},
	priority: [
		"angular"
	],
	deps: [
		"bootstrap"
	],
	waitSeconds: 0
});