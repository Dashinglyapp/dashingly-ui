define(['angular'],
    function(angular) {

        var lodash = angular.module('realize-lodash', []);
        lodash.factory('_', function() {
            return window._; // assumes underscore has already been loaded on the page
        });
    });