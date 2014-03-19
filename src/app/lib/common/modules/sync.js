/*global angular:true, browser:true */
define(['angularAMD', 'http-auth-interceptor'],
    function(angularAMD) {

    var module = angular.module('realize-sync', ['http-auth-interceptor']);

    module.config(['$httpProvider', function($httpProvider) {
        // centralize authorization/authentication messages and error handling
        $httpProvider.interceptors.push(['$rootScope', '$q', function($rootScope, $q) {
            return {
                // optional method
                'request': function(config) {
                    // do something on success
                    // if an outgoing request, add the token to request params
                    if(/POST|PUT|PATCH/i.test(config.method)){
                        config.data = config.data || {};
                        config.headers['Authentication-Token'] = window.localStorage.realize_user_auth_token;
                        config.headers['Content-Type'] = "application/json";
                    }
                    return config || $q.when(config);
                }
            };
        }]);
    }])

    // handles requests to the various api endpoints to decouple them from
    // front end models
    .factory('sync', ['$http','$q',function ($http,$q) {

        var routeBase = '/api/v1/';

        var defaultOptions = {
            scopeHash:'',
            resourceHash:'',
            scope:''
        };
        var sync = {};

        // converts an $http promise into a regular promise that only returns the data
        // instead of the full response object
        function normalizeResponseData(httpObj){
            var d = $q.defer();
            httpObj.then(
                function(obj){
                    d.resolve(obj.data || obj);
                },
                function(rejection){
                    d.reject(rejection);
                }
            );
            return d.promise;
        }

        sync.auth_check = function (options) {
            var promise;
            var route = routeBase + "auth_check";
            promise = normalizeResponseData($http.post(route, options.data));
            return promise;
        };


        sync.resource = function (operation, options) {
            var promise;
            var route = routeBase + options.scope + '/' + options.scopeHash + '/resources';
            switch(operation){
                case 'create':
                    promise = normalizeResponseData($http.post(route, options.data));
                    break;
                case 'readOne':
                    promise = normalizeResponseData($http.get(route + "/" + options.resourceHash ));
                    break;
                case 'readList':
                    promise = normalizeResponseData($http.get(route));
                    break;
                case 'readTree':
                    promise = normalizeResponseData($http.get(route + "/" + options.resourceHash + "/tree"));
                    return promise;
                case 'update':
                    break;
                case 'delete':
                    break;
                default:
                    break;
            }
            return promise;
        };

        sync.actions = function (argument) {
            // body...
        };

        sync.authorizations = function (operation, options) {
            var promise;
            var route = routeBase + options.scope + '/' + options.scopeHash + '/authorizations';
            switch(operation){
                case 'create':
                    promise = normalizeResponseData($http.post(route, options.data));
                    break;
                case 'readOne':
                    promise = normalizeResponseData($http.get(route + options.resourceHash ));
                    break;
                case 'readList':
                    promise = normalizeResponseData($http.get(route));
                    break;
                case 'update':
                    break;
                case 'delete':
                    break;
                default:
                    break;
            }
            return promise;
        };

        sync.login = function (options) {
            var route = routeBase + 'login';
            return normalizeResponseData($http.post(route, options.data));
        };

        sync.logout = function () {
            var route = routeBase + 'logout';
            return normalizeResponseData($http.get(route));
        };

        sync.plugins = function (operation, options) {
            var promise;
            var route = routeBase + options.scope + '/' + options.scopeHash + '/plugins';
            switch(operation){
                case 'add':
                    promise = normalizeResponseData($http.get(route + "/" + options.resourceHash + "/actions/add", options.data));
                    break;
                case 'remove':
                    promise = normalizeResponseData($http.get(route + "/" + options.resourceHash + "/actions/remove", options.data));
                    break;
                case 'readOne':
                    promise = normalizeResponseData($http.get(route + options.resourceHash ));
                    break;
                case 'readList':
                    promise = normalizeResponseData($http.get(route));
                    break;
                case 'update':
                    break;
                case 'delete':
                    break;
                default:
                    break;
            }
            return promise;
        };

        sync.register = function (options) {
            var route = routeBase + 'register';
            return normalizeResponseData($http.post(route, options.data));
        };

        sync.user_profile = function (operation, options) {
            var promise;
            var route = routeBase + options.scope + '/' + options.scopeHash + '/profile';
            switch(operation){
                case 'create':
                    promise = normalizeResponseData($http.post(route, options.data));
                    break;
                case 'readOne':
                    promise = normalizeResponseData($http.get(route));
                    break;
                case 'update':
                    break;
                case 'delete':
                    break;
                default:
                    break;
            }
            return promise;
        };

        sync.views = function (argument) {
            // body...
        };

        sync.widgetList = function (argument) {
            return normalizeResponseData($http.get('/widgetList.json',{cache:true}));
        };

        return sync;
    }]);
});