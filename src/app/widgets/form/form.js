define(['app', 'angular', 'moment'], function(app, angular, moment){
    app.register.controller('FormCtrl', ['$scope', 'sync', 'user', function($scope, sync, user){
        $scope.hashkey = $scope.widgetData.hashkey;
        $scope.formData = {};

        sync.views('readOne', {scope: 'user', scopeHash: user.getProp('hashkey'), resourceHash: $scope.widgetData.endpoints[0]}).then(function(data){
            console.log(data);
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

        $scope.save = function(){
            console.log("Saving form with data", $scope.formData);
            var postData = {};
            for(var i = 0; i < $scope.formFields.length; i++){
                postData[$scope.formFields[i].name] = $scope.formData[i];
            }

            sync.views('post', {scope: 'user', scopeHash: user.getProp('hashkey'), resourceHash: $scope.widgetData.endpoints[0], data: postData}).then(function(data){
                console.log("Form saved properly");
            });
        };

    }]);
});

