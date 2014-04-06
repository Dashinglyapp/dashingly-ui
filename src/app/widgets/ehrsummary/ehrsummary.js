define(['app', 'angular', 'bluebutton', 'moment', 'view', 'context', 'user', 'realize-sync'], function (app, angular, BlueButton) {
	app.register.controller('EHRCtrl', ['$scope', 'sync', 'user', 'EVENTS', 'view', 'context', function ($scope, sync, user, EVENTS, view, context) {
		$scope.hashkey = $scope.widgetData.hashkey;
        view.getDetail(context.getScopeName(), context.getScopeHash(), $scope.widgetData.settings.source.value).then(function (data) {
            var bb = BlueButton(data.ehr);
            var summary = {
                demographics: bb.demographics(),
                allergies: bb.allergies(),
                encounters: bb.encounters(),
                immunizations: bb.immunizations(),
                labs: bb.labs(),
                medications: bb.medications(),
                problems: bb.problems(),
                procedures: bb.procedures(),
                vitals: bb.vitals()
            };
            console.log(JSON.stringify(summary));
            $scope.viewData = {
                "summary": {
                    "summary": summary,
                    "typeToShow": $scope.widgetData.settings.typeToShow.value
                }
            };
        });
	}]);

});

