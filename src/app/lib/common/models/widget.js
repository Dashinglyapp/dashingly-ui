define(['angularAMD', 'jquery', 'realize-sync', 'lodash', 'user', 'angular' , 'context', 'screen', 'util'],
	function (angularAMD, $) {
		var module = angular.module('widget', ['ng', 'realize-sync', 'user', 'context', 'screen', 'util']);
		module.factory("widget", ['$rootScope', 'user', '$q', '$http', '$window', '$templateCache', 'sync', 'screen', 'context', 'view', 'util', function ($rootScope, user, $q, $http, $window, $templateCache, sync, screen, context, view, util) {
			var activeWidgets = {};
			var widgetTemplateList;
			var defaultName = "default";

			var api = {
				listInstalled: function () {
					var d = $q.defer();
					sync.resource("readList", {scope: context.getScopeName(), scopeHash: context.getScopeHash()}).then(function (data) {
						d.resolve(data);
					});
					return d.promise;
				},
				listInstalledByType: function (type) {
					var d = $q.defer();
					api.listInstalled().then(function (data) {
						var widgets = [];
						for (var i = 0; i < data.length; i++) {
							if (data[i].type === type) {
								widgets.push(data[i]);
							}
						}
						api.initializeWidgets(widgets).then(function (widgets) {
							d.resolve(widgets);
						});
					});
					return d.promise;
				},
				listInstalledByTypeAndName: function (type, name) {
					var d = $q.defer();
					api.listInstalled().then(function (data) {
						var widgets = [];
						for (var i = 0; i < data.length; i++) {
							if (data[i].type === type && data[i].name === name) {
								widgets.push(data[i]);
							}
						}
						api.initializeWidgets(widgets).then(function (widgets) {
							d.resolve(widgets);
						});
					});
					return d.promise;
				},
				listInstalledByParent: function (hashkey) {
					var d = $q.defer();
					api.detail(hashkey).then(function (data) {
						api.initializeWidgets(data.related).then(function (widgets) {
							d.resolve(widgets);
						});
					});
					return d.promise;
				},
				listAllAvailable: function () { // list all widgets
					var d = $q.defer();
					if (widgetTemplateList) {
						d.resolve(angular.copy(widgetTemplateList));
						return d.promise;
					}
					$http.get('data/widgetList.json').then(function (obj) {
						widgetTemplateList = obj.data;
						d.resolve(widgetTemplateList);
					});
					return d.promise;
				},
				listAvailableByTag: function (tag) {
					var d = $q.defer();
					api.listAllAvailable().then(function (all) {
						var available = [];
						for (var i = 0; i < Object.keys(all).length; i++) {
							var key = Object.keys(all)[i];
							if (all[key].tags.indexOf('dashboard-item') !== -1) {
								available.push(all[key]);
							}
						}
						d.resolve(available);
					});
					return d.promise;
				},
				initializeWidgets: function (widgets) {
					var d = $q.defer();
					var new_widgets = [];
					api.loadWidgets(widgets).then(function (data) {
						for (var i = 0; i < widgets.length; i++) {
							var widget = data[i];
							var widgetData = widgets[i];
							widget.hashkey = widgetData.hashkey;
							widget.endpoints = widgetData.views;
							widget.currentView = widgetData.current_view;
							widget.parents = widgetData.parents;
							widget.name = widgetData.name;
							if (widget.settings !== undefined) {
								for (var j = 0; j < Object.keys(widget.settings).length; j++) {
									var key = Object.keys(widget.settings)[j];
									var setting = widget.settings[key];
									setting.value = widgetData.settings[key];
								}
							} else {
								widget.settings = {};
							}
							new_widgets.push(widget);
						}
						d.resolve(new_widgets);
					});
					return d.promise;
				},
				loadWidgets: function (widgets) {
					var d = $q.defer();
					var promises = [];
					for (var i = 0; i < widgets.length; i++) {
						promises.push(api.loadWidget(widgets[i].type));
					}
					return $q.all(promises);
				},
				loadWidget: function (widgetType) {
					/*eslint max-nested-callbacks:1*/
					var d = $q.defer();

					if (activeWidgets[widgetType]) {
						console.log("Found widget in cache: ", widgetType);
						var data = activeWidgets[widgetType];
						d.resolve(angular.copy(data));
						return d.promise;
					}

					api.listAllAvailable()
						.then(function (list) { // wrap the loaded widget object in a promise
							var i;
							var widgetObj = list[widgetType];
							if (!widgetObj) {
								d.reject();
								return console.log('no widget exists with template name ', widgetType);
							}
							console.log("Loading widget: ", widgetType, widgetObj);
							var load_data = {
								type: widgetObj.type
							};
							if (widgetObj.templates !== undefined && widgetObj.templates.length > 0) {
								var template = widgetObj.dir + widgetObj.templates[0];
								load_data.template = template;
								console.log("Loading this template for widget: ", widgetType, template);
							}
							if (widgetObj.javascripts !== undefined) {
								var files = [];
								for (i = 0; i < widgetObj.javascripts.length; i++) {
									files.push("ngload!" + widgetObj.dir + widgetObj.javascripts);
								}
								console.log("Loading these files for widget: ", widgetType, files);
								load_data.files = files;
							}

							var deps = ['angularAMD'];
							for (i = 0; i < load_data.files.length; i++) {
								deps.push(load_data.files[i]);
							}

							require(deps, function (angularAMD) {
								api.getDependencies(widgetObj).then(function (dependencies) {
									widgetObj.deps = dependencies;
									api.getTemplate(load_data).then(function (template_html) {
										console.log('Done loading: ' + widgetType + " :", widgetObj, "Controller is: ", widgetObj.controller);
										widgetObj.template_html = template_html;
										widgetObj.template = load_data.template;
										$templateCache.put(widgetObj.template, widgetObj.template_html);
										activeWidgets[widgetType] = widgetObj;
										d.resolve(widgetObj);
									});
								});
							});
						});
					return d.promise;
				},
				getDependencies: function (widgetObj) {
					var d = $q.defer();
					if (!widgetObj.noAuth) {
						view.listAvailableForScope(context.getScopeName(), context.getScopeHash()).then(function (views) {
							var compatiblePlugins = [];
							if (widgetObj.settings !== undefined) {
								for (var i = 0; i < Object.keys(widgetObj.settings).length; i++) {
									var key = Object.keys(widgetObj.settings)[i];
									if (widgetObj.settings[key].type === "endpoint") {
										var widgetTags = widgetObj.settings[key].meta.tags;
										for (var j = 0; j < views.length; j++) {
											var viewTags = views[j].tags;
											var intersection = widgetTags.filter(function (n) {
												return viewTags.indexOf(n) !== -1;
											});
											if (intersection.length > 0) {
												compatiblePlugins.push(views[j].plugin);
											}
										}
									}
								}

							}
							var deps = {
								compatible: util.uniqueArray(compatiblePlugins),
								required: []
							};
							d.resolve(deps);

						});
					} else {
						d.resolve({compatible: [], required: []});
					}
					return d.promise;
				},
				getTemplate: function (widgetObj) {
					var d = $q.defer();
					if (widgetObj.template_html && widgetObj.template_html.length > 0) {
						d.resolve(widgetObj.template_html);
						return d.promise;
					}
					api.loadHtml(widgetObj).then(function (htmlStr) {
						widgetObj.template_html = d.promise;
						d.resolve(htmlStr);
					});
					return d.promise;
				},
				loadHtml: function (widgetObj) {
					var d = $q.defer();
					if (widgetObj.template) {
						$http.get(widgetObj.template)
							.then(function (obj) {
								console.log('widgetObj in widget.loadHtml()', widgetObj);
								d.resolve(obj.data);
							})
							.catch(function () {
								d.reject('loadHtml fail', arguments);
							});
						return d.promise;
					}
					d.resolve('');
					return d.promise;
				},
				create: function (data) {
					var d = $q.defer();
					var settings = {};
					var endpoints = [];
					if (data.settings !== undefined) {
						for (var i = 0; i < Object.keys(data.settings).length; i++) {
							var key = Object.keys(data.settings)[i];
							var setting = data.settings[key];
							if (setting.default !== undefined) {
								settings[key] = setting.default;
								if (setting.type === "endpoint") {
									endpoints.push(setting.default);
								}
							}
						}
					}

					var currentView;
					if (data.display !== undefined && data.display.defaults !== undefined) {
						var screenFormat = screen.getFormat();
						currentView = data.display.defaults[screenFormat];
					}

					var postData = {
						views: endpoints,
						parent: data.parent,
						name: data.name,
						type: data.type,
						settings: settings,
						current_view: currentView
					};

					sync.resource("create", {scope: context.getScopeName(), scopeHash: context.getScopeHash(), data: postData})
						.then(function (data) {
							console.log("Added widget to dashboard: ", data);
							api.initializeWidgets([data]).then(function (widgets) {
								d.resolve(widgets[0]);
							});
						});

					return d.promise;
				},
				remove: function (hashkey) {
					var d = $q.defer();
					sync.resource('remove', {scope: context.getScopeName(), scopeHash: context.getScopeHash(), resourceHash: hashkey}).then(function (data) {
						console.log("Got widget detail: ", data);
						d.resolve(data);
					});
					return d.promise;
				},
				detail: function (hashkey) {
					var d = $q.defer();
					sync.resource('readTree', {scope: context.getScopeName(), scopeHash: context.getScopeHash(), resourceHash: hashkey}).then(function (data) {
						console.log("Got widget detail: ", data);
						d.resolve(data);
					});
					return d.promise;
				},
				saveSettings: function (hashkey, settings, views) {
					var d = $q.defer();
					var data = {settings: settings};
					if (views !== undefined) {
						data.views = views;
					}
					sync.resource("update", {scope: context.getScopeName(), scopeHash: context.getScopeHash(), resourceHash: hashkey, data: data})
						.then(function (data) {
							console.log("Updated settings for widget: ", data);
							d.resolve(data);
						});
					return d.promise;
				},
				saveView: function (hashkey, viewName) {
					var d = $q.defer();
					var data = {current_view: viewName};
					sync.resource("update", {scope: context.getScopeName(), scopeHash: context.getScopeHash(), resourceHash: hashkey, data: data})
						.then(function (data) {
							console.log("Updated view for widget: ", data);
							d.resolve(data);
						});
					return d.promise;
				}
			};
			return api;
		}])

		.factory("widgetMeta", ['$rootScope', 'user', '$q', '$http', '$window', '$templateCache', 'sync', function ($rootScope, user, $q, $http, $window, $templateCache, sync) {
			var topLevelWidget;
			var api = {
				setTopLevelWidget: function (widgetObj) {
					topLevelWidget = widgetObj;
				},
				getTopLevelWidget: function () {
					return topLevelWidget;
				}
			};
			return api;
		}])

		.factory('widgetSettings', ['user', '$q', '$http', 'sync', 'view', 'context', 'widget', '$rootScope', 'EVENTS', function (user, $q, $http, sync, view, context, widget, $root, EVENTS) {
			var api = {
				getSettingsForm: function (widgetObj) {
					var d = $q.defer();
					var settings = widgetObj.settings;
					view.listAvailableForScope(context.getScopeName(), context.getScopeHash()).then(function (viewData) {
						var formFields = [];
						for (var i = 0; i < Object.keys(settings).length; i++) {
							var key = Object.keys(settings)[i];
							var field = settings[key];

							var formField = {
								type: field.type,
								label: field.description,
								name: key,
								key: key
							};

							switch (field.type) {
								case "endpoint":
									var options = [];
									for (var j = 0; j < field.meta.tags.length; j++) {
										for (var m = 0; m < viewData.length; m++) {
											if (viewData[m].installed === true) {
												if (viewData[m].tags.indexOf(field.meta.tags[j]) !== -1) {
													options.push({
														name: viewData[m].name,
														value: viewData[m].hashkey
													});
												}
											}
										}
									}
									formField.type = "select";
									formField.options = options;
									break;
								default:
									break;
							}

							formFields.push(formField);
						}
						d.resolve(formFields);
					});
					return d.promise;
				},
				saveSettingsForm: function (widgetData, formData) {
					var views = widgetData.endpoints;
					var patchData = {};
					for (var i = 0; i < Object.keys(formData).length; i++) {
						var key = Object.keys(formData)[i];
						if (formData[key].value !== undefined) {
							patchData[key] = formData[key].value;
						} else {
							patchData[key] = formData[key];
						}

						widgetData.settings[key] = widgetData.settings[key] || {};
						widgetData.settings[key].value = patchData[key];
						if (widgetData.settings[key].type === "endpoint") {
							views.push(patchData[key]);
						}
					}
					widget.saveSettings(widgetData.hashkey, patchData, views).then(function () {
						$root.$emit(EVENTS.widgetSettingsChange, widgetData.hashkey);
					});
				}
			};
			return api;
		}]);
	}
);