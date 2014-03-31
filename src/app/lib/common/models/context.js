 define(['angularAMD', 'user', 'realize-sync'],
    function(angularAMD) {
        var module = angular.module('context', ['ng', 'user', 'realize-sync']);
            module
            .factory("context", ['$rootScope','$q', '$window', 'sync', 'user', function($root, $q, $window, sync, user) {
                var scope = {
                    name: "user",
                    hashkey: user.getProp('hashkey')
                };

                var update = function(){
                    scope.hashkey = user.getProp('hashkey');
                };

                $root.$watch(user.isAuthed, update);

                var api = {
                    getScope: function(){
                        return scope;
                    },
                    getScopeName: function(){
                        return scope.name;
                    },
                    getScopeHash: function(){
                        return scope.hashkey;
                    }
                };
                return api;
            }]);
    }
);