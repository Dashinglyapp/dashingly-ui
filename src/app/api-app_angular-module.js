ngDefine('realize.api-promises',
    ['angular', 'module:restangular'],
    function(angular){
        module
        .config( ['RestangularProvider', 'user', function (RestangularProvider, user) {
            // Define Restangular settings for back-end sync
            RestangularProvider.setBaseUrl('/api/v1/');
            RestangularProvider.setListTypeIsArray(false);
            RestangularProvider.setRestangularFields({
                selfLink: 'url'
            });
            RestangularProvider.setResponseExtractor(function(response, operation, what,something,something2) {
                console.log('extractor response',response);
                console.log('extractor operation',operation);
                console.log('extractor what',what);
                console.log('extractor something',something);
                console.log('extractor something2',something2);
                // return operation === 'getList' ?
                //   response :
                //   response[what];
                return response;
            });

        }
        ])

        .service('api-promises', ['Restangular', '$q', function (Restangular, $q) {
            // App API: provides a engine back-end wrapper to cache data for faster rendering and dev shortcuts
            // Get the whole user object, necessary data streams, and plugins to start with.
            // Longer data streams will query separately from the engine api and return promises.
            // returns an api promise for the engine - purposes

            // allow us to lazy-define functions here to call the api only when necessary, then use cached data afterward.
            // var loginAttemptDeferred=$q.defer();
            // var loginSuccessDeferred=$q.defer();

            // var loginAttemptPromise;
            // var loginSuccessPromise;

            // var api={
            //   login:{
            //     get:function(){
            //       // if we've already made the request, return a promise that gives the result
            //       // if(loginAttemptPromise){
            //       //   loginAttemptPromise.then(function(result){
            //       //     loginAttemptDeferred.resolve(result);
            //       //   });
            //       //   return loginAttemptDeferred.promise;
            //       // }
            //       // otherwise make the request
            //       return loginAttemptPromise = loginAttemptPromise || Restangular.all('login').getList();
            //     },
            //     post:function(formData){
            //       return loginSuccessPromise = Restangular.all('login').post({"email": "test@realize.pe", "password": "test"});
            //     }
            //   }
            // };
            var foo = Restangular;
            return $q;
        }]);
});

