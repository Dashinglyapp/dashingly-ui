define(['app', 'angular', 'jquery', 'user', 'realize-sync', 'widget', 'plugin'], function (app, angular, $) {
	app.controller("WidgetCtrl", ["$rootScope", "$scope", "user", 'widget', 'widgetMeta', 'EVENTS', '$attrs', 'plugin','$location', function ($root, $scope, user, widget, widgetMeta, EVENTS, $attrs, plugin,$location) {
		// $scope.widgetMeta = widgetMeta;
		// $scope.widgetData = undefined;
		// $scope.currentWidget = {
		// 	name: undefined,
		// 	type: undefined
		// };
		$scope.setupWidget = function (data) {
			console.log("Setting up widget: ", data);
			$scope.currentWidget.type = data.type;
			$scope.currentWidget.name = data.name;
			widget.loadWidget(data.type).then(function (widgetObj) {
				widgetObj.hashkey = data.hashkey;
				widgetMeta.setTopLevelWidget(widgetObj);
				$scope.widgetData = widgetObj;
				console.log("Top level widget: ", $scope.widgetMeta.getTopLevelWidget());
				$location.path(data.type + "/" + data.name);
				if (!$scope.$$phase) {
					$scope.apply();
				}
			});
		};

		$scope.setupWidgetWithData = function (widgetType, widgetName) {
			widget.listInstalledByTypeAndName(widgetType, widgetName).then(function (data) {
				console.log("Listing widget by type", widgetType, "and name", widgetName, "got data", data);
				if (data.length === 0) {
					widget.create({name: widgetName, type: widgetType}).then(function (data) {
						$scope.setupWidget(data);
					});
				} else {
					$scope.setupWidget(data[0]);
				}
			});
		};

		$scope.replace = function (widgetType, widgetName) {
			widget.loadWidget(widgetType).then(function (widgetObj) {
				console.log("Replacing content with widget with type", widgetType, "and name", widgetName);
				if (!widgetObj.noAuth) {
					user.checkAuth().then(function (profile) {
						console.log("User is authenticated.");
						$scope.setupWidgetWithData(widgetType, widgetName);
					}, function (reason) {
						console.log("Unathenticated user.  Initializing default widget version.");
						console.log("Unathenticated user.  Initializing default widget version.");
						$scope.setupWidget({type: widgetType, name: widgetName, hashkey: ""});
					});
				} else {
					$scope.setupWidget({type: widgetType, name: widgetName, hashkey: ""});
				}
			});
		};

		/**
		 * switchWidget: Makes the widget to switch itself to a different widget
		 * @param {string} widgetType A unique Identifier for each widget in the widget list. Corresponds to directory names and widgetlist.json keys.
		 * @param {string} widgetName (optional) :  Desc?
		 * @return {undefined} undefined
		 */
		$scope.switchWidget = function (widgetType, widgetName) {
			if ($scope.currentWidget.type !== widgetType || $scope.currentWidget.name !== widgetName) {
				console.log('EVENTS.switchWidget called with args: ', widgetType, widgetName);
				$scope.replace(widgetType, widgetName || 'default');
			}
			console.log('ERR in switchWidget');
		};
		if(!$scope.widgetData){
			throw 'scope has no widgetData';
		}
		$scope.switchWidget($scope.widgetData.type,$scope.widgetData.name);




		// change settings on this widget when this widget specifically is called.
		// still allows broadcasts to pass through this widget though
		// $scope.$onRootScope(EVENTS.widgetSettingsChange, function (event, widgetKey) {
		// 	// if(event.stopPropagation){
		// 	// 	console.log("Received emit to update settings from this widget's immediate child.  Rendering.",event,$scope);
		// 	// 	console.log('stopping propagation');
		// 	// 	// event.stopPropagation(); // prevent the settings message from progressing further.
		// 	// }
		// 	// if(event.preventDefault){
		// 	// 	console.log('preventing default');
		// 	// 	// event.preventDefault(); // prevent the settings message from progressing further.
		// 	// }
		// 	if (widgetKey === $scope.hashkey) {
		// 		$scope.$broadcast(EVENTS.widgetUpdateChildrenSettings,widgetKey);
		// 	}
		// });
				// change settings when an ancestor widget broadcasts to do it.
		$scope.$on(EVENTS.widgetRefreshPressed, function (event,widgetKey) {
			if(event.stopPropagation){
				console.log("Received emit to update settings from this widget's immediate child.  Rendering.",event,$scope);
				console.log('stopping propagation');
				event.stopPropagation(); // prevent the settings message from progressing further.
			}

			console.log("Received widgetRefreshPressed. Broadcasting update to children $scope is",$scope);
			$scope.$broadcast(EVENTS.widgetUpdateChildrenSettings);
		});

		// // change settings when an ancestor widget broadcasts to do it.
		// $scope.$on(EVENTS.widgetUpdateChildrenSettings, function () {
		// 	console.log("Received broadcast to update settings from an ancestor widget.  Rendering.",$scope);
		// 	if ($scope.render) {
		// 		$scope.render();
		// 	}
		// });

		// if($scope.widgetData && $scope.render){
		// 	$scope.render();
		// }

		console.log('widget data before load',$scope.widgetData);

		$scope.$watch('widgetdata',function (tplUpdated) {
			console.log('tplUpdated',tplUpdated);
		});

		console.log('$attrs',$attrs);

		console.log('WidgetCtrl $scope', $scope);
	}])

	.controller('WidgetRouteCtrl', ["$rootScope", "$scope", '$routeParams', "user", 'widget', 'widgetMeta', 'EVENTS','$q', function ($root, $scope, $routeParams, user, widget, widgetMeta, EVENTS, $q) {
		console.log('WidgetRouteCtrl running ',arguments);
		if(!$root.activeTopLevelWidgets){
			var authcounter = 0;
			// $root.authed = false;
						// check user auth status on initial pageload
			$root.activeTopLevelWidgets = [];
			$root.dashboards = [];
			// do additional tasks on user authed
			function catchInitializeError(){
				console.log('initializeerror',arguments);
				$root.$emit(EVENTS.switchWidgetTree,'index','default');
			}
			function initializePage(newVal, oldVal){
				console.log(++authcounter,'auth status changing');
				$root.authed = newVal; //
				console.log("user.isAuthed watch name", $routeParams.name, "type", $routeParams.type);
				if($root.authed){
					// get the dashboard list
					if($routeParams.type === 'dashboard'){
						widget.loadWidget('dashboard')
						.then(function (foo1) {
							console.log('$root.getWidgetListPromise foo1',foo1);
							$root.dashboards = [foo1];
							$root.activeTopLevelWidgets = $root.dashboards;
						},catchInitializeError);
					} else {
						widget.loadWidget('dashboard')
						.then(function (foo) {
							console.log('$root.getWidgetListPromise foo',foo);
							$root.dashboards = [foo];
						},catchInitializeError);
						widget.loadWidget($routeParams.type)
						.then(function (dataObj) {
							console.log('$root.getWidgetListPromise dataObj',dataObj);
							$root.activeTopLevelWidgets = dataObj;
						},catchInitializeError);
					}
				} else{
					widget.loadWidget($routeParams.type || 'index')
					.then(function (dataObj) {
						console.log('$root.getWidgetListPromise dataObj',dataObj);
						$root.activeTopLevelWidgets = dataObj;
					},catchInitializeError);
				}
			}
			$root.$watch(user.isAuthed, initializePage);



			$root.$on(EVENTS.notAuthenticated, function (event) {
				if ($scope.currentWidget.type !== "index") {
					$root.authed = false;
				}
			});

			$root.$on(EVENTS.loginSuccess, function () {
				console.log("WidgetCtrl login success");
				$root.authed = true;
			});


			$root.$on(EVENTS.logoutSuccess, function (event) {
				console.log("WidgetCtrl logout success");
				$root.authed = false;
			});
			return;
		}

		initializePage(user.isAuthed());

				}])

/**
 * Controllers
 */

	.controller("TopNavCtrl", ['$scope', '$window', 'user', 'sync', 'EVENTS', '$rootScope', function ($scope, $window, user, sync, EVENTS, $root) {
		console.log('TopNavCtrl $scope', $scope);

		$scope.logout = function () {
			$root.$emit(EVENTS.logoutSuccess);
			sync.logout()
				.finally(function () {
					// TODO this needs a logout spinner in case the login takes a while
					user.deAuthorize();
				});
		};

		$scope.login = function () {
			$root.$emit(EVENTS.switchWidgetTree, "login");
		};

		$scope.register = function () {
			$root.$emit(EVENTS.switchWidgetTree, "register");
		};

	}])


	.controller("LeftMenuCtrl", ['$scope', 'user', 'sync', 'EVENTS', '$rootScope', 'context',function ($scope, user, sync, EVENTS, $rootScope,context) {
		console.log('LeftMenuCtrl $scope', $scope);
		$scope.showItem = function (itemName) {
			console.log('LeftMenuCtrl showItem',itemName);
			$scope.shownItem = $scope.shownItem ? '' : itemName;
			console.log('LeftMenuCtrl $scope',$scope);
		};

		$scope.logout = function () {
			$rootScope.$emit(EVENTS.logoutSuccess);
			sync.logout()
				.finally(function () {
					// TODO this needs a logout spinner in case the login takes a while
					user.deAuthorize();
				});
		};
		$scope.updateAuthorizations = function(){
				sync.authorizations('readList', {scope: context.getScopeName(), scopeHash: context.getScopeHash()})
				.then(function (data){
						console.log("Authorization list: ", data);
						$scope.authorizationList = data;
				});
		};

		$scope.$on('$viewContentLoaded', function() {
			$scope.updateAuthorizations();
		});

		$scope.logout = function () {
			$scope.$emit(EVENTS.logoutAttempt);
		};

	}])

	.controller('WidgetActionsCtrl', ['$scope', 'user', 'sync', 'EVENTS', 'widget', '$rootScope', 'view', 'context', 'widgetSettings', function ($scope, user, sync, EVENTS, widget, $root, view, context, widgetSettings) {
		$scope.collapseSettings = true;
		$scope.formData = {};

		$scope.changeView = function (viewName) {
			widget.saveView($scope.hashkey, viewName).then(function () {
				$root.$emit(EVENTS.widgetViewChange, $scope.hashkey, viewName);
				$scope.widgetData.currentView = viewName;
			});
		};

		$scope.updateFields = function (widgetObj) {
			widgetSettings.getSettingsForm(widgetObj).then(function (fields) {
				$scope.fields = fields;
			});
		};

		$scope.showSettings = function () {
			$scope.collapseSettings = !$scope.collapseSettings;
		};

		$scope.refreshWidget = function () {
			$scope.$emit(EVENTS.widgetRefreshPressed, $scope.hashkey);
		};

		$scope.save = function () {
			console.log("Saving settings with data", $scope.formData);
			widgetSettings.saveSettingsForm($scope.widgetData, $scope.formData);
		};

		$scope.deleteWidget = function () {
			console.log("Deleting widget with data", $scope.widgetData);
			widget.remove($scope.hashkey).then(function (data) {
				for (var i = 0; i < $scope.widgetData.parents.length; i++) {
					$root.$emit(EVENTS.widgetSettingsChange, $scope.widgetData.parents[i]);
				}
			});
		};

		// console.log('$scope.widgetData in WidgetActionsCtrl',$scope.widgetData);
		if (typeof $scope.widgetData === 'object') {
			$scope.hashkey = $scope.widgetData.hashkey;
			$scope.tags = $scope.widgetData.tags;

			$scope.formOptions = {
				"uniqueFormId": "settings_" + $scope.widgetData.hashkey,
				"submitCopy": "Save"
			};

			$scope.updateFields($scope.widgetData);
		}
	}])

	.controller('ExtensionCtrl', ['$scope', 'sync', 'widget', 'user', '$q', '$rootScope', 'EVENTS', 'view', 'context', 'plugin', function ($scope, sync, widget, user, $q, $root, EVENTS, view, context, plugin) {
		$scope.widgets = [];
		$scope.plugins = [];
		$scope.views = [];
		$scope.currentItem = undefined;
		$scope.type = $scope.type || "plugins";
		$scope.items = [];

		$scope.fetchWidgets = function () {
			var d = $q.defer();
			widget.listAvailableByTag('dashboard-item').then(function (data) {
				var promises = [];
				widget.loadWidgets(data).then(function (data) {
					$scope.widgets = data;
					d.resolve(data);
				});
			});
			return d.promise;
		};

		$scope.fetchPlugins = function () {
			var d = $q.defer();
			plugin.listAllAvailable()
				.then(function (data) {
					$scope.plugins = data;
					d.resolve(data);
				});
			return d.promise;
		};

		$scope.setup = function () {
			$scope.fetchWidgets().then(function () {
				$scope.fetchPlugins().then(function () {
					if ($scope.type === "plugins") {
						$scope.items = $scope.plugins;
					} else if ($scope.type === "widgets") {
						$scope.items = $scope.widgets;
					}
				});
			});
		};

		$scope.addPlugin = function (pluginObj) {
			console.log("Adding a plugin");
			sync.plugins("add", {scope: context.getScopeName(), scopeHash: context.getScopeHash(), resourceHash: pluginObj.hashkey})
				.then(function (data) {
					console.log("Plugin added: ", data);
					$scope.update();
				});
		};
		$scope.removePlugin = function (pluginObj) {
			console.log("Removing a plugin");
			sync.plugins("remove", {scope: context.getScopeName(), scopeHash: context.getScopeHash(), resourceHash: pluginObj.hashkey})
				.then(function (data) {
					console.log("Plugin removed: ", data);
					$scope.update();
				});
		};

		$scope.add = function (item) {
			if ($scope.type === "plugins") {
				$scope.addPlugin(item);
			} else if ($scope.type === "widgets") {
				$root.$emit(EVENTS.widgetAddToDash, $scope.hashkey, item);
			}
		};

		$scope.remove = function (item) {
			if ($scope.type === "plugins") {
				$scope.removePlugin(item);
			}
		};

		$scope.info = function (item) {
			console.log("info");
		};

		$scope.update = function () {
			$scope.setup();
		};

		$scope.$on('$viewContentLoaded', function () {
			$scope.update();
		});

		$scope.$watch(user.isAuthed, $scope.update);

		$scope.setup();

	}]);
});

