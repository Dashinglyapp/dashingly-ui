define(['angularAMD'],
    function(angularAMD) {
        var module = angular.module('util', ['ng']);
            module
            .factory("util", [function() {
                var api = {
                    uniqueArray: function(a){
                        var temp = {};
                        var i;
                        for (i = 0; i < a.length; i++) {
                            if(a[i] !== undefined){
                                temp[a[i]] = true;
                            }
                        }
                        var r = [];
                        for (i = 0; i < Object.keys(temp).length; i++) {
                            r.push(Object.keys(temp)[i]);
                        }
                        return r;
                    }
                };
                return api;
            }]);
    }
);
