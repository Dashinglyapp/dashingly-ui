define(['app', 'angular', 'moment'], function(app, angular, moment){
    app.register.controller('FormCtrl', ['$scope', 'sync', 'user', 'EVENTS', function($scope, sync, user, EVENTS){
        $scope.hashkey = $scope.widgetData.hashkey;
        $scope.formData = {};

        $scope.render = function(){
            sync.views('readOne', {scope: 'user', scopeHash: user.getProp('hashkey'), resourceHash: $scope.widgetData.settings.source.value}).then(function(data){
                var fields = data.data.fields;
                 $scope.formOptions = {
                    "uniqueFormId": $scope.hashkey,
                    "submitCopy": "Save"
                };

                var formFields = [];
                for(var i = 0; i < fields.length; i++){
                    var field = fields[i];
                    var formField = {
                        type: field.widget,
                        label: field.description,
                        name: field.name
                    };

                    formFields.push(formField);
                }
                $scope.formFields = formFields;
            });
        };

        $scope.save = function(){
            console.log("Saving form with data", $scope.formData);
            var postData = {};
            for(var i = 0; i < $scope.formFields.length; i++){
                postData[$scope.formFields[i].name] = $scope.formData[i];
            }

            sync.views('post', {scope: 'user', scopeHash: user.getProp('hashkey'), resourceHash: $scope.widgetData.settings.source.value, data: postData}).then(function(data){
                console.log("Form saved properly");
            });
        };

        $scope.$onRootScope(EVENTS.widgetSettingsChange, function(event, widgetKey) {
            console.log("Chart received settings change event", widgetKey);
            if(widgetKey === $scope.hashkey){
                $scope.render();
            }
        });

        $scope.render();

    }]);
});

