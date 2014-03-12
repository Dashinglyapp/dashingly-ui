// /**
// * login Module
// *
// * Provides a login widget
// */
// // angular.module('realize')

window.registerController('LoginCtrl', ['$scope','Restangular','$q','$window', 'user',function($scope,Restangular,$q,$window,user){
  // var Restangular = $injector.get('Restangular');
  console.log('LoginCtrl scope',$scope);
  $scope.formData = {
    "email": "test@realize.pe",
    "password": "testtest"
  };
  $scope.loginOrRegister = function  () {
    var options = {
      loginType:$scope.loginType,
      formData:$scope.formData
    };
    user.tryAuthorization(options)
    .then(function () {
      // redirect to user's dashboard
      $scope.add(user.getProp('default_widget'));
    })
    .catch(function(err){
      console.log(' POST error iter,obj', err);
      var errorsArr = [];
      angular.forEach(err.data.fields,function(obj,iter){
        console.log(options.loginType + ' POST error iter,obj', iter,obj);
        if(obj.errors.length){
          angular.forEach(obj,function(str){
            console.error(str);
          });
        }
      });
      // handle inline errors here
    });
  };

  $scope.logout = function () {
    Restangular.all('logout').getList()
    .finally(function () {
      user.deAuthorize();
      $scope.add('realize_default_dashboard');
      // body...
    });
  };
}]);