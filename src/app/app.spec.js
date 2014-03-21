/* globals describe, beforeEach, inject, it, chai */
define(['angularAMD','angular'], function (angularAMD,angular) {
  console.log('defining unit');
    describe('angularAMD', function () {
        //console.log("Running app.spec.js");

        // it('is created.', function () {
        //     expect(angularAMD).toBeDefined();
        // });
        // var $location, $scope, AppCtrl;
        var expect = window.chai.expect;

        // beforeEach( inject( function( $controller, _$location_, $rootScope ) {
        //   $location = _$location_;
        //   $scope = $rootScope.$new();
        //   AppCtrl = $controller( 'AppCtrl', { $location: $location, $scope: $scope });
        // }));
        // angular.mock.module('realize',function(utils){
        //   console.log('utils',utils);
        // });


        it( 'should pass a dummy test', function() {
          expect( true ).to.be.ok;
        });
    });
});