define(['angularAMD', 'jquery', 'realize-sync', 'lodash', 'user', 'angular'],
    function(angularAMD, $) {
        var module = angular.module('widget', ['ng', 'realize-sync', 'user']);
        module
            .factory("widget", ['$rootScope','user','$q','$http','$window', '$templateCache', 'sync', function($rootScope, user,$q,$http,$window, $templateCache, sync) {
                var activeWidgets = {};
                var widgetTemplateList;

                var api = {
                    listAll:function(){ // list all widgets
                        var d = $q.defer();
                        if(widgetTemplateList){
                            d.resolve(angular.copy(widgetTemplateList));
                            return d.promise;
                        }
                        $http.get('/data/widgetList.json').then(function  (obj) {
                            widgetTemplateList = obj.data;
                            d.resolve(widgetTemplateList);
                        });
                        return d.promise;
                    },
                    listInstalled: function(){
                        var d = $q.defer();
                        sync.resource("readList", {scope: "user", scopeHash: user.getProp('hashkey')}).then(function  (data) {
                            d.resolve(data);
                        });
                        return d.promise;
                    },
                    listInstalledByType: function(type){
                        var d = $q.defer();
                        api.listInstalled().then(function(data){
                            var widgets = [];
                            for(var i = 0; i < data.length; i++){
                                if(data[i].type === type){
                                    widgets.push(data[i]);
                                }
                            }
                            d.resolve(widgets);
                        });
                        return d.promise;
                    },
                    listInstalledByTypeAndName: function(type, name){
                        var d = $q.defer();
                        api.listInstalled().then(function(data){
                            var widgets = [];
                            for(var i = 0; i < data.length; i++){
                                if(data[i].type === type && data[i].name === name){
                                    widgets.push(data[i]);
                                }
                            }
                            d.resolve(widgets);
                        });
                        return d.promise;
                    },
                    loadWidget:function(widgetType){
                        var d = $q.defer();

                        // In theory, this should cache results and serve a deep copy of them up when needed.
                        // In practice, it returns the same object that exists in the cache, without doing a copy.
                        // You can probably see why this is a problem.
                        /** if(activeWidgets[widgetType]){
                            console.log("Found widget in cache: ", widgetType);
                            var data = activeWidgets[widgetType];
                            var newData = angular.copy(data);
                            d.resolve(newData);
                            return d.promise;
                        } **/

                        api.listAll()
                            .then(function (list) { // wrap the loaded widget object in a promise
                                var i;
                                var widgetObj = list[widgetType];
                                if(!widgetObj){
                                    d.reject();
                                    return console.log('no widget exists with template name ', widgetType);
                                }
                                console.log("Loading widget: ", widgetType, widgetObj);
                                var load_data = {
                                    type: widgetObj.type
                                };
                                if(widgetObj.templates !== undefined && widgetObj.templates.length > 0){
                                    var template = widgetObj.dir + widgetObj.templates[0];
                                    load_data.template = template;
                                    console.log("Loading this template for widget: ", widgetType, template);
                                }
                                if(widgetObj.javascripts !== undefined){
                                    var files = [];
                                    for(i = 0; i < widgetObj.javascripts.length; i++){
                                        files.push("ngload!" + widgetObj.dir + widgetObj.javascripts);
                                    }
                                    console.log("Loading these files for widget: ", widgetType, files);
                                    load_data.files = files;
                                }

                                var deps = ['angularAMD'];
                                for(i = 0; i < load_data.files.length; i++){
                                    deps.push(load_data.files[i]);
                                }

                                require(deps, function (angularAMD) {
                                    api.getTemplate(load_data).then(function(template_html){
                                        console.log('Done loading: ' + widgetType + " :", widgetObj, "Controller is: ", widgetObj.controller);
                                        widgetObj.template_html = template_html;
                                        widgetObj.template = load_data.template;
                                        $templateCache.put(widgetObj.template, widgetObj.template_html);
                                        activeWidgets[widgetType] = d.promise;
                                        d.resolve(widgetObj);
                                    });
                                });
                            });
                        return d.promise;
                    },
                    getTemplate:function(widgetObj){
                        var d = $q.defer();
                        if(widgetObj.template_html && widgetObj.template_html.length > 0){
                            d.resolve(widgetObj.template_html);
                            return d.promise;
                        }
                        api.loadHtml(widgetObj).then(function(htmlStr){
                            widgetObj.template_html = d.promise;
                            d.resolve(htmlStr);
                        });
                        return d.promise;
                    },
                    loadHtml:function(widgetObj){
                        var d = $q.defer();
                        if(widgetObj.template){
                            console.log('widgetObj',widgetObj);
                            $http.get(widgetObj.template)
                                .then(function (obj) {
                                    d.resolve(obj.data);
                                })
                                .catch(function () {
                                    d.reject('loadHtml fail',arguments);
                                });
                            return d.promise;
                        }
                        d.resolve('');
                        return d.promise;
                    },
                    create: function(data){
                        var d = $q.defer();
                        var postData = {
                            views: data.endpoints,
                            parent: data.parent,
                            name: data.name,
                            type: data.type
                        };
                        sync.resource("create", {scope: "user", scopeHash: user.getProp('hashkey'), data: postData})
                            .then(function(data){
                                console.log("Added widget to dashboard: ", data);
                                d.resolve(data);
                            });

                        return d.promise;
                    },
                    detail:function(hashkey){
                        var d = $q.defer();
                        sync.resource('readTree', {scope: "user", scopeHash: user.getProp('hashkey'), resourceHash: hashkey}).then(function(data){
                            console.log("Got widget detail: ", data);
                            d.resolve(data);
                        });
                        return d.promise;
                    }
                };
                return api;
            }])

            .factory("widgetMeta", ['$rootScope', 'user','$q','$http','$window', '$templateCache', 'sync', function($rootScope, user,$q,$http,$window, $templateCache, sync) {
                var topLevelWidget;
                var api = {
                    setTopLevelWidget: function(widgetObj){
                        topLevelWidget = widgetObj;
                    },
                    getTopLevelWidget: function(){
                        return topLevelWidget;
                    }
                };
                return api;
            }]);
    }
);