define(['app', 'realize-debugging', 'screen'], function (app) {
	app.directive('topLevelWidget', function () {
		return {
			restrict: 'E',
			templateUrl: 'partials/top-level-widget.tpl.html'
		};
	})

	.directive('pluginListItem', [function () {
		return {
			restrict: 'E',
			templateUrl: 'partials/plugin-list-item.tpl.html'
		};
	}])

	.directive('pluginList', [function () {
		return {
			restrict: 'E',
			templateUrl: 'partials/plugin-list.tpl.html'
		};
	}])
	.directive('widgetContent', ['screen', function (screen) {
		return {
			restrict: 'E',
			link: function (scope, element, attrs, ctrl) {
				var update = function (viewData) {
					var data = scope.widgetData;
					if (viewData === undefined) {
						return undefined;
					}
					console.log("Updating widget content", viewData);
					var screenFormat = screen.getFormat();

					var currentView = data.currentView;
					var views = data.display.views;
					if (views[currentView].formats.indexOf(screenFormat) === -1) {
						currentView = data.display.defaults[screenFormat];
					}

					var currentType = data.display.views[currentView].type;

					var template;
					switch (currentType) {
						case "chart":
							template = "partials/views/chart.tpl.html";
							break;
						case "number":
							template = "partials/views/number.tpl.html";
							break;
						case "form":
							template = "partials/views/form.tpl.html";
							break;
						case "text":
							template = "partials/views/text.tpl.html";
							break;
						default:
							template = viewData[currentView].templateUrl;
					}
					scope.template = template;
					scope.data = viewData[currentView];
				};

				scope.$watch('viewData', function (viewData, oldViewData) {
					update(viewData);
				}, true);

				scope.$watch('widgetData.currentView', function (currentView, oldView) {
					console.log("Updating widget view", currentView);
					update(scope.viewData);
				}, true);
			},
			templateUrl: "partials/widget-content.tpl.html"
		};
	}]);

});

