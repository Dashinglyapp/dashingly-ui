define(['angularAMD', 'realize-sync', 'util'],
	function (angularAMD) {
		var module = angular.module('plugin', ['ng', 'realize-sync', 'util']);
		module.factory("plugin", ['$rootScope', '$q', '$window', 'sync', 'context', 'widget', 'util', function ($root, $q, $window, sync, context, widget, util) {
			var plugins = {};
			var api = {
				listAllAvailable: function () {
					var d = $q.defer();
					sync.plugins('readList', {scope: context.getScopeName(), scopeHash: context.getScopeHash()})
						.then(function (data) {
							api.getAllDependencies(data).then(function (deps) {
								for (var i = 0; i < data.length; i++) {
									data[i].deps = deps[i];
								}
								d.resolve(data);
							});
						});
					return d.promise;
				},
				getAllDependencies: function (plugins) {
					var promises = [];
					for (var i = 0; i < plugins.length; i++) {
						promises.push(api.getDependencies(plugins[i]));
					}
					return $q.all(promises);
				},
				getDependencies: function (plugin) {
					var d = $q.defer();
					var compatibleWidgets = [];
					widget.listAllAvailable().then(function (data) {
						widget.loadWidgets(data).then(function (widgets) {
							for (var j = 0; j < widgets.length; j++) {
								var widgetPlugins = widgets[j].deps.compatible;
								if (widgetPlugins.indexOf(plugin.hashkey) !== -1) {
									compatibleWidgets.push(widgets[j].hashkey);
								}
							}

							var authRequirements = plugin.permissions.authorizations.map(
								function (val) {
									return "Authorization: " + val;
								}
							);

							var deps = {
								compatible: util.uniqueArray(compatibleWidgets),
								required: util.uniqueArray(authRequirements)
							};
							d.resolve(deps);
						});
					});

					return d.promise;
				}

			};
			return api;
		}]);
	}
);