define(['angularAMD', 'restangular'],
    function(angularAMD) {
        var module = angular.module('realize-utils', ['ng', 'restangular']);
        module
            .config(['RestangularProvider', function(RestangularProvider){
                RestangularProvider.setBaseUrl('/api/v1/');
                RestangularProvider.addFullRequestInterceptor(function(element, operation, route, url, headers, params) {
                    headers['Authentication-Token'] = window.localStorage.realize_user_auth_token || '';
                    return {
                        headers: headers
                    };
                });
            }])
            .factory('lodash',['$window',function($window){
                return $window._;
            }])

            .factory("user", ['$rootScope','lodash','$q','Restangular','$window',function($root, _,$q,Restangular,$window) {
                // console.log('$q.defer',$q.defer);
                var authObj;
                var authPromise;
                var profileDef = $q.defer();
                var profilePromise = profileDef.promise;
                var user = {
                    token:$window.localStorage.realize_user_auth_token || '',
                    hashkey:$window.localStorage.realize_user_hashkey || ''
                };
                // if user is ready, render user
                // if user is not, render login, then do user ready
                console.log('user copy 1',angular.copy(user));
                var api = {
                    hasAuth:function(){
                        // get the user's profile
                        var d = $q.defer();
                        console.log('user token before sending',angular.copy(user.token));
                        console.log('user copy',angular.copy(user));
                        if(user.authed){
                            d.resolve(user);
                            return d.promise;
                        }
                        Restangular.all('auth_check')
                            .post({token: user.token || ''}, null, null)
                            .then(function (data) {
                                // {"authenticated": true, "email": "test@realize.pe", "hashkey": "e0be3f51228558713dc44522c651ccb2", "id": 1 }
                                console.log('auth_check data',arguments);
                                if(data && data.authenticated){
                                    if(!$root.user){
                                        api.authorize({hashkey:data.hashkey,id:data.id,token:user.token});
                                    }
                                    d.resolve($root.user);
                                } else {
                                    console.error('user not authenticated in hasAuth',data);
                                    d.reject(data);
                                }
                            })
                            .catch(function (err) {
                                d.reject(err);
                            });
                        return d.promise;
                    },
                    tryAuthorization:function  (options) {
                        var d = $q.defer();
                        if(!options || !options.formData || !options.loginType){
                            console.error("tryAuthorization requires arg {formData:{username:'',email:''},loginType:''}");
                            d.reject('tryauthorization failed');
                            return d.promise;
                        }
                        Restangular.all(options.loginType.toLowerCase())
                            .post(options.formData,{},{'Content-Type':'application/json'})
                            .then(function(data){
                                console.log(options.loginType + ' POST success arguments',arguments);
                                api.authorize(data.user);
                                d.resolve();
                            })
                            .catch(function(err){
                                d.reject(err);
                            });
                        return d.promise;
                    },
                    getProp:function(prop){
                        return angular.copy(user[prop]);
                    },
                    setProp:function(prop,val){
                        if(typeof prop === 'object'){
                            angular.extend(user,prop);
                        } else {
                            user[prop] = val;
                        }
                        $root.user = angular.copy(user);
                        return $root.user;
                    },
                    deAuthorize:function (data) {
                        console.log('auth_check fail arguments',arguments);
                        user = {};
                        $root.user = {};
                        delete $window.localStorage.realize_user_auth_token;
                        delete $window.localStorage.realize_user_hashkey;
                        return data;
                    },
                    authorize:function (userObj) {
                        console.log('in authorize fn');
                        if(!userObj.token || !userObj.hashkey){
                            console.error('userObj must have token & hashkey properties to authorize');
                            return $root.user;
                        }
                        $window.localStorage.realize_user_auth_token = userObj.token;
                        $window.localStorage.realize_user_hashkey = userObj.hashkey;
                        api.setProp(angular.extend({authed:true},userObj));
                        return $root.user;
                    }
                };
                return api;
            }])

            .factory("resource", ['Restangular','$rootScope','lodash','user','$q','$http','widget',function(Restangular, $rootScope, _, user,$q,$http,widget) {

                var api = {
                    baseResources: function(){
                        return Restangular.one('user', user.getProp('hashkey'));
                    },
                    getResources: function(){
                        var d = $q.defer();
                        api.baseResources().all('resources').getList().then(function(data){
                            d.resolve(data);
                        });
                        return d.promise;
                    },
                    addResource: function(data){
                        var d = $q.defer();
                        api.baseResources().post("resources", data).then(function(data){
                            d.resolve(data);
                        });
                        return d.promise;
                    },
                    getResourceTree: function(hashkey){
                        var d = $q.defer();
                        api.baseResources().one("resources", hashkey).one("tree").get(null, null, null).then(function(data){
                            d.resolve(data);
                        });
                        return d.promise;
                    },
                    getTree: function(){
                        var d = $q.defer();
                        api.baseResources().one("resources").one("tree").get(null, null, null).then(function(data){
                            d.resolve(data);
                        });
                        return d.promise;
                    }
                };
                return api;
            }])

            .factory("dashboard", ['$rootScope','lodash','user','$q','$http','$window', 'resource', function($rootScope, _, user,$q,$http,$window, resource){
                var dashboardCache = {};
                var api = {
                    listAll:function(){
                        var d = $q.defer();
                        resource.getResources().then(function(data){
                            console.log("Resource data for user: ", data);
                            for(var i = 0; i < data.length; i++){
                                if(data[i].type === "dashboard"){
                                    dashboardCache[data[i].hashkey] = data[i];
                                }
                            }
                            d.resolve(dashboardCache);
                        });
                        return d.promise;
                    },
                    add:function(name){
                        var d = $q.defer();
                        var data = {
                            'name': name
                        };
                        data.type = "dashboard";

                        resource.addResource(data).then(function(data){
                            console.log("Added resource: ", data);
                            dashboardCache[data.hashkey] = data;
                            d.resolve(dashboardCache);
                        });
                        return d.promise;
                    },
                    detail:function(hashkey){
                        var d = $q.defer();
                        resource.getResourceTree(hashkey).then(function(data){
                           console.log(data);
                            d.resolve(data);
                        });
                        return d.promise;
                    },
                    addWidget: function(widgetData, dashboardHashkey){
                        var d = $q.defer();
                        widgetData.parent = dashboardHashkey;
                        var data = {
                            parent: dashboardHashkey,
                            name: widgetData.name,
                            type: 'widget'
                        };

                        resource.addResource(data).then(function(data){
                            console.log("Added widget to dashboard: ", data);
                            d.resolve(data);
                        });
                        return d.promise;
                    }
                };
                return api;
            }])

            .factory("widget", ['$rootScope','lodash','user','$q','$http','$window', function($rootScope, _, user,$q,$http,$window) {
                var scriptsCache = {}; // hold previously loaded scripts so we don't load them twice.
                var activeWidgets = {};
                var widgetTemplateList;
                var widgetHTMLPromisesCache = {};

                var api = {
                    save:function(){

                    },
                    addToPage:function  (widgetName, element) {
                        var d = $q.defer();
                        api.loadWidget(widgetName).then(function(widgetObj)
                        {
                            var modules = [];
                            modules.push(widgetObj.module);

                            element.html(widgetObj.template_html);
                            console.log("Bootstrapping modules", modules, "for widget", widgetObj, "in element", element);
                            angular.bootstrap(element, modules);
                            d.resolve(widgetObj);
                        });
                        return d.promise;
                    },
                    update:function () {
                        // body...
                    },
                    getChildren:function () {
                        // body...
                    },
                    listAll:function(){ // list all widgets
                        var d = $q.defer();
                        if(widgetTemplateList){
                            d.resolve(widgetTemplateList);
                            return d.promise;
                        }
                        $http.get('/data/widgetList.json').then(function  (obj) {
                            widgetTemplateList = obj.data;
                            d.resolve(widgetTemplateList);
                        });
                        widgetTemplateList = d.promise;
                        return widgetTemplateList;
                    },
                    loadWidget:function(widgetName){
                        var d = $q.defer();
                        if(activeWidgets[widgetName]){
                            d.resolve(activeWidgets[widgetName]);
                            return d.promise;
                        }
                        api.listAll()
                            .then(function (list) { // wrap the loaded widget object in a promise
                                var widgetObj = list[widgetName];
                                if(!widgetObj){
                                    d.reject();
                                    return console.log('no widget exists with template name ',widgetName);
                                }
                                console.log("Loading widget: ", widgetName, widgetObj);
                                var load_data = {
                                    name: widgetObj.module
                                };
                                if(widgetObj.templates !== undefined && widgetObj.templates.length > 0){
                                    var template = widgetObj.dir + widgetObj.templates[0];
                                    load_data.template = template;
                                    console.log("Loading this template for widget: ", widgetName, template);
                                }
                                if(widgetObj.javascripts !== undefined){
                                    var files = [];
                                    for(var i = 0; i < widgetObj.javascripts.length; i++){
                                        files.push("ngload!" + widgetObj.dir + widgetObj.javascripts);
                                    }
                                    console.log("Loading these files for widget: ", widgetName, files);
                                    load_data.files = files;
                                }
                                require(load_data.files, function () {
                                    api.getTemplate(load_data).then(function(template_html){
                                        console.log('Done loading: ' + widgetName + " :", widgetObj, "Module is: ", angular.module(widgetObj.module));
                                        widgetObj.template_html = template_html;
                                        activeWidgets[widgetName] = d.promise;
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
                    loadData:function(){
                        var d = $q.defer();
                        d.resolve({foo:'bar',baz:'bop'});
                        return d.promise;
                    }
                };
                return api;
            }])


            .factory("utils", ['$templateCache','$rootScope','lodash',function($templateCache, $rootScope, _) {
                return {
                    // dynamically assembles templates for each state from multiple partials
                    lazyCompileStateTemplate: function(pluginObj) {
                        // check if we've already cached this state's template
                        var forGroupOrIndiv = _.contains($rootScope.people.tags,'group') ? 'group' : 'individual';
                        var templateName = 'plugins/' + pluginObj.name + '/' + forGroupOrIndiv;
                        var cachedStateTemplate = $templateCache.get(templateName);
                        if(cachedStateTemplate){
                            return cachedStateTemplate;
                        }

                        // else compile the template
                        var templateStr = '';
                        // loop over all the templates specified in this plugin
                        _.forEach(pluginObj.display_templates[forGroupOrIndiv],function(obj){
                            // get the partials from the cache and compile them into a single template
                            templateStr += $templateCache.get('plugins/' + obj.template.split(' : ').join('/')) + '\n';
                            // $rootScope.templateDataroot.temp
                        });
                        // if the template str is still blank, return a message;
                        templateStr = templateStr || '<div>No ' + forGroupOrIndiv + ' template defined by this plugin</div>';
                        // cache the template
                        $templateCache.put(templateName,templateStr);
                        return templateStr;
                    },

                    // debugging for UI router
                    enableDebugging: function() {
                        $rootScope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams){
                            console.log('$stateChangeStart to ' + toState.to + '- fired when the transition begins. toState,toParams : \n',toState, toParams);
                        });
                        $rootScope.$on('$stateChangeError',function(event, toState, toParams, fromState, fromParams){
                            console.log('$stateChangeError - fired when an error occurs during transition.');
                            console.log(arguments);
                        });
                        $rootScope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
                            console.log('$stateChangeSuccess to ' + toState.name + '- fired once the state transition is complete.');
                        });
                        $rootScope.$on('$stateNotFound',function(event, unfoundState, fromState, fromParams){
                            console.log('$stateNotFound ' + unfoundState.to + '  - fired when a state cannot be found by its name.');
                            console.log(unfoundState, fromState, fromParams);
                        });
                        // $rootScope.$on('$viewContentLoading',function(event, viewConfig){
                        //   // runs on individual scopes
                        //   console.log('$viewContentLoading - view begins loading - dom not rendered',viewConfig);
                        // });
                        $rootScope.$on('$viewContentLoaded',function(event){
                            console.log('$viewContentLoaded - fired after dom rendered',event);
                        });
                    },

                    getDashboardObj:function(pluginOrStateName){ // gets a plugin object by plugin or state name
                        return $rootScope.user.settings.dashboards[pluginOrStateName.indexOf('root.') === 0 ? pluginOrStateName.slice(5) : pluginOrStateName];
                    },

                    detectMobileBrowser:function(){
                        /*eslint no-extra-parens:0*/
                        return (function(a){return !!(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || (/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i).test(a.substr(0,4)));})(navigator.userAgent || navigator.vendor || window.opera);
                    }

                };
            }]);
    }
);