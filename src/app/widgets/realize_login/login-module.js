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
  $scope.loginOrRegister = function (){
    var either = $scope.widget.loginType.toLowerCase();
    Restangular.all(either)
    .post($scope.formData,{},{'Content-Type':'application/json'})
    .then(function(data){
      console.log(either + ' POST success arguments',arguments);
      user.authorize(data.user);
      $scope.add(user.getProp('default_widget'));
    })
    .catch(function(err){
      user.deAuthorize();
      angular.forEach(err.data.fields,function(obj,iter){
        console.log(either + ' POST error iter,obj', iter,obj);
        if(obj.errors.length){
          angular.forEach(obj,function(str){
            console.error(str);
            // $scope.postMessage += str + '</br>';
          });
        }
      });
      $scope.postMessage = 'POST error';
    });
  };

  $scope.logout = function () {
    Restangular.all('logout').getList()
    .then(function(){
    })
    .catch(function(){
      console.log('logout fail',arguments);
    })
    .finally(function () {
      delete $window.localStorage.token;
      $scope.add('realize_default_dashboard');
      // body...
    });
  };
}]);