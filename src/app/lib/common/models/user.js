define(['angularAMD', 'realize-sync', 'lodash', 'realize-lodash', 'view', 'notification'],
	function (angularAMD) {
		var module = angular.module('user', ['ng', 'realize-sync', 'realize-lodash', 'view', 'notification']);
		module.factory("user", ['$rootScope', '$q', '$window', 'sync', '_', 'EVENTS', 'authService', 'view', 'notification', function ($root, $q, $window, sync, _, EVENTS, authService, view, notification) {
			// console.log('$q.defer',$q.defer);
			var authObj;
			var authPromise;
			var profileDef = $q.defer();
			var profilePromise = profileDef.promise;
			var user = {
				token: $window.localStorage.realize_user_auth_token || '',
				hashkey: $window.localStorage.realize_user_hashkey || '',
				authed: $window.localStorage.realize_user_auth_token !== '' && $window.localStorage.realize_user_auth_token !== undefined
			};
			// if user is ready, render user
			// if user is not, render login, then do user ready
			console.log('user copy 1', angular.copy(user));
			var api = {
				authed: user.authed,
				isAuthed: function () {
					return user.authed;
				},
				checkAuth: function () {
					// get the user's profile
					var d = $q.defer();
					console.log('user token before sending', angular.copy(user.token));
					console.log('user copy', angular.copy(user));
					if (user.authed === true) {
						d.resolve(user);
						return d.promise;
					}
					console.log("Doing auth check.");
					sync.auth_check({data: {token: user.token || ''}})
						.then(function (data) {
							console.log('auth_check data', arguments);
							if (data && data.authenticated) {
								if (!$root.user) {
									api.authorize({hashkey: data.hashkey, id: data.id, token: user.token});
								}
								d.resolve($root.user);
							} else {
								console.error('user not authenticated in hasAuth', data);
								api.setProp('authed', false);
								d.reject(data);
							}
						})
						.catch(function (err) {
							console.log("Auth check failed.");
							api.setProp('authed', false);
							d.reject(err);
						});
					return d.promise;
				},
				tryAuthorization: function (options) {
					var d = $q.defer();
					if (!options || !options.data || !options.loginType) {
						console.error("tryAuthorization requires arg {formData:{username:'',email:''},loginType:''}");
						d.reject('tryauthorization failed');
						return d.promise;
					}
					var func;
					if (options.loginType === "login") {
						func = sync.login;
					} else {
						func = sync.register;
					}
					func(options)
						.then(function (data) {
							console.log(options.loginType + ' POST success arguments', arguments);
							api.authorize(data.user);
							d.resolve();
						})
						.catch(function (err) {
							api.setProp('authed', false);
							d.reject(err);
						});
					return d.promise;
				},
				getProp: function (prop) {
					return angular.copy(user[prop]);
				},
				setProp: function (prop, val) {
					if (typeof prop === 'object') {
						angular.extend(user, prop);
					} else {
						user[prop] = val;
					}
					$root.user = angular.copy(user);
					return $root.user;
				},
				deAuthorize: function (data) {
					console.log('Deauthorizing user: ', arguments);
					user = {};
					$root.user = {};
					delete $window.localStorage.realize_user_auth_token;
					delete $window.localStorage.realize_user_hashkey;
					api.setProp('authed', false);
					notification.success("Logged out.");
					return data;
				},
				authorize: function (userObj) {
					console.log('in authorize fn');
					if (!userObj.token || !userObj.hashkey) {
						console.error('userObj must have token & hashkey properties to authorize');
						return $root.user;
					}
					$window.localStorage.realize_user_auth_token = userObj.token;
					$window.localStorage.realize_user_hashkey = userObj.hashkey;
					api.setProp(angular.extend({authed: true}, userObj));
					api.setProp('authed', true);
					return $root.user;
				},
				loginOrRegister: function (data, type) {
					var d = $q.defer();
					var options = {
						loginType: type,
						data: data
					};
					api.tryAuthorization(options).then(function () {
						// redirect to user's dashboard
						var token = api.getProp('token');
						var updater = function (config) {
							if (config !== undefined) {
								if (config.data !== undefined) {
									config.data.token = token;
								} else {
									config.data = {token: token};
								}
								if (config.headers !== undefined) {
									config.headers['Authentication-Token'] = token;
								}
							} else {
								config = {data: {token: token}};
							}
							return config;
						};
						authService.loginConfirmed(data, updater);
						notification.success("Logged in as " + data.email);
						d.resolve(data);
					}).catch(function (err) {
						var rejection = {};
						for (var i = 0; i < err.data.fields.length; i++) {
							rejection[err.data.fields[i].name] = err.data.fields[i].errors;
						}
						d.reject(rejection);
					});
					return d.promise;
				}
			};
			return api;
		}]);
	}
);