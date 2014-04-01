define(['angularAMD', 'realize-sync'],
	function (angularAMD) {
		var module = angular.module('view', ['ng', 'realize-sync']);
		module.factory("view", ['$rootScope', '$q', '$window', 'sync', function ($root, $q, $window, sync) {
			var views = {};
			var api = {
				getKey: function (scope, scopeHash) {
					return scope + scopeHash;
				},
				listAvailableForScope: function (scope, scopeHash) {
					var d = $q.defer();
					var key = api.getKey(scope, scopeHash);
					if (views[key] !== undefined) {
						d.resolve(views[key]);
						return d.promise;
					}

					return api.updateForScope(scope, scopeHash);
				},
				updateForScope: function (scope, scopeHash) {
					var d = $q.defer();
					var key = api.getKey(scope, scopeHash);

					sync.views('readList', {scope: scope, scopeHash: scopeHash}).then(function (viewData) {
						views[key] = viewData;
						d.resolve(viewData);
					});
					return d.promise;
				},
				getDetail: function (scope, scopeHash, viewHash) {
					var d = $q.defer();
					sync.views('readOne', {scope: scope, scopeHash: scopeHash, resourceHash: viewHash}).then(function (viewData) {
						d.resolve(viewData);
					});
					return d.promise;
				},
				saveData: function (scope, scopeHash, viewHash, data) {
					var d = $q.defer();
					sync.views('post', {scope: scope, scopeHash: scopeHash, resourceHash: viewHash, data: data}).then(function (data) {
						console.log("Form saved properly");
						d.resolve(data);
					});
					return d.promise;
				}

			};
			return api;
		}]);
	}
);


