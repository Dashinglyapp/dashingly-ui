angular.module('mock-backend', [
  'ngMockE2E',
  'restangular'
])



/*NOTE: $httpBackend CALLS MUST BE IN A "RUN" FUNCTION TO WORK!!!*/
.run(['$httpBackend', function ($httpBackend) {
  console.log('RUNNING BACKEND MODULE');

  // ensure templates get passed through
  $httpBackend.whenGET(/\.|tpl/g).passThrough();

  // default data
  var mocks = {
    user:{
      hashkey:'e0be3f51228558713dc44522c651ccb2',
      token:'',
      email:'test@realize.pe',
      password:'testtest',
      id:1,
      authenticated:false
    }
  };

  // default responses
  var ret = {
    success:function(responseObj){
      return [200, responseObj, {}];
    },
    fail:function(responseObj){
      return [200, responseObj, {}];
    },
    authed:function (successObj,failObj) {
      return mocks.user.authenticated ? ret.success(successObj) : ret.fail(failObj);
    }
  };


// I wonder if we could auto-generate this file from the server endpoint code...
  $httpBackend.whenPOST(/\/api\/v1\/auth_check/)
  .respond(function(url, data, headers){
    // console.log('responding in user whenGET: url, data, headers : ',url, data, headers);
    return [
      200,
      {authenticated: mocks.user.authenticated, email: mocks.user.email, hashkey: mocks.user.hashkey, id: mocks.user.id},
      {}
    ];
  });
  $httpBackend.whenGET(/\/api\/v1\/login/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenPOST(/\/api\/v1\/login/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenGET(/\/api\/v1\/register/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenPOST(/\/api\/v1\/register/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenGET(/\/api\/v1\/logout/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenGET(/\/api\/v1\/group/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenPOST(/\/api\/v1\/group/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenGET(/\/api\/v1\/group\/{hashkey}/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenPUT(/\/api\/v1\/group\/{hashkey}/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenGET(/\/api\/v1\/user\/{user_hashkey}\/groups/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenGET(/\/api\/v1\/user\/{user_hashkey}\/groups\/{group_hashkey}\/{action}/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenGET(/\/api\/v1\/{scope}\/{hashkey}\/plugins/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenGET(/\/api\/v1\/{scope}\/{hashkey}\/plugins\/{plugin_hashkey}\/actions\/{action}/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenPOST(/\/api\/v1\/{scope}\/{hashkey}\/plugins\/{plugin_hashkey}\/actions\/{action}/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenGET(/\/api\/v1\/{scope}\/{hashkey}\/views/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenDELETE(/\/api\/v1\/{scope}\/{hashkey}\/plugins\/{plugin_hashkey}\/views\/{view_hashkey}/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenGET(/\/api\/v1\/{scope}\/{hashkey}\/plugins\/{plugin_hashkey}\/views\/{view_hashkey}/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenPATCH(/\/api\/v1\/{scope}\/{hashkey}\/plugins\/{plugin_hashkey}\/views\/{view_hashkey}/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenPOST(/\/api\/v1\/{scope}\/{hashkey}\/plugins\/{plugin_hashkey}\/views\/{view_hashkey}/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenPUT(/\/api\/v1\/{scope}\/{hashkey}\/plugins\/{plugin_hashkey}\/views\/{view_hashkey}/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenGET(/\/api\/v1\/{scope}\/{hashkey}\/authorizations/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenGET(/\/api\/v1\/{scope}\/{hashkey}\/resources/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenPOST(/\/api\/v1\/{scope}\/{hashkey}\/resources/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenDELETE(/\/api\/v1\/{scope}\/{hashkey}\/resources\/{resource_hashkey}/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenGET(/\/api\/v1\/{scope}\/{hashkey}\/resources\/{resource_hashkey}/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenPUT(/\/api\/v1\/{scope}\/{hashkey}\/resources\/{resource_hashkey}/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenGET(/\/api\/v1\/user\/{hashkey}\/profile/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenPUT(/\/api\/v1\/user\/{hashkey}\/profile/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });

  $httpBackend.whenGET(/\/api\/v1\/tasks\/{task_id}/)
  .respond(function(url,data,headers){
    return ret.authed({},{});
  });



  }
]);
