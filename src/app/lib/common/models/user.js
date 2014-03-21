define(['angularAMD', 'realize-sync', 'lodash', 'realize-lodash'],
    function(angularAMD) {
        var module = angular.module('user', ['ng', 'realize-sync', 'realize-lodash']);
            module
            .factory("user", ['$rootScope','$q', '$window', 'sync', '_', function($root,  $q,$window, sync, _) {
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
                    isAuthed:function(){
                        return $window.localStorage.realize_user_auth_token !== '' && $window.localStorage.realize_user_auth_token !== undefined;
                    },
                    checkAuth:function(){
                        // get the user's profile
                        var d = $q.defer();
                        console.log('user token before sending',angular.copy(user.token));
                        console.log('user copy',angular.copy(user));
                        if(user.authed === true){
                            d.resolve(user);
                            return d.promise;
                        }
                        console.log("Doing auth check.");
                        sync.auth_check({data: {token: user.token || ''}})
                            .then(function (data) {
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
                                console.log("Auth check failed.");
                                d.reject(err);
                            });
                        return d.promise;
                    },
                    tryAuthorization:function  (options) {
                        var d = $q.defer();
                        if(!options || !options.data || !options.loginType){
                            console.error("tryAuthorization requires arg {formData:{username:'',email:''},loginType:''}");
                            d.reject('tryauthorization failed');
                            return d.promise;
                        }
                        var func;
                        if(options.loginType === "login"){
                            func = sync.login;
                        } else{
                            func = sync.register;
                        }
                        func(options)
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
                        api.setProp('authed', false);
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
            }]);
    }
);