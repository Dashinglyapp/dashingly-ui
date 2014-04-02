define(['app', 'realize-debugging', 'screen'], function (app) {
	app.directive('widgetContainer', function () {
		var counter = 20;
		return {
			restrict: 'A',
			replace:false,
			controller:'WidgetCtrl',
			templateUrl: 'partials/widget-container.tpl.html',
			scope:false,
			// 	widgetData:'='// bind to the parent scope's property
			// },
			compile:function (tElement, tAttrs) {
				// body..
				return {
					pre:function (scope, iElement, iAttrs) {
						console.log('PRE LINK',scope,iAttrs);
						if(++counter > 30){
							return;
						}
						iAttrs.$observe('widgetdata',function(tpl){

            // scope.$watch('widgetData',function(tpl){
							console.log('TPL',scope.$eval(tpl));
							// console.log('eval args',arguments);
							// scope.$eval(tpl).then(function () {
							// 	console.log('eval args',arguments);
							// });
							// scope.widgetData =  // bind the widget data to the
						});
						// scope.widgetData = iAttrs.widgetData;

						// $scope.widgetData = undefined;
						// $scope.currentWidget = {
						// 	name: undefined,
						// 	type: undefined
						// };
					},
					post:function (scope, iElement, iAttrs) {
						// console.log('POST LINK iAtrrs',iAttrs);
						console.log('POST LINK scope',scope);
					}
				};
			}
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
		var widgetContentRenderIter = 0;
		return {
			restrict: 'E',
			// scope:{
			// 	widgetData:'='
			// },
			template: '<div ng-include="widgetData.template" widgetData="{{widgetData}}" ng-show="data !== undefined"></div>',
			// templateUrl: "partials/widget-content.tpl.html",
			link: function (scope, element, attrs, ctrl) {
				console.log('widgetContentRenderIter',widgetContentRenderIter);
				console.log('widgetContenttemplatelink scope',scope,attrs);
				if(++widgetContentRenderIter > 1 ) {
					return;
				}
				// scope.widgetData = scope.$eval(iAttrs.widgetdata);
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
			}
		};
	}]);

});

