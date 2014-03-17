ngDefine('mock-backend',
    ['module:ngMockE2E:angularMocks',
     'module:restangular',
     'module:realize-app-utils'],
    function(module){
    module
    .factory('realizeMockData', [function () {
      return {
        hashFaker:function(min,max){
          min = min === undefined ? 1 : min;
          max = max === undefined ? 999999999 : max;
          return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        user:{
          hashkey:'e0be3f51228558713dc44522c651ccb2',
          token:'WyIxIiwiNTdjNDZhMzdiYzk0MDA3MGQ5Mjg0Nzg4ZTAxZWVmNzciXQ.BgEMFQ.Sm8EqxN3_vUBtAwVw4Etad-AZ8Y',
          email:'test@realize.pe',
          password:'testtest',
          id:1,
          authenticated:false,
          settings:{}
        },
        group:{
          hashkey:'3dc44522c651ccb2e0be3f5122855871',
          token:'WyIxIiwiNTdjNDZhMzdiYzk0MDA3MGQ5Mjg0Nzg4ZTAxZWVmNzciXQ.BgEMFQ.Sm8EqxN3_vUBtAwVw4Etad-AZ8Y',
          email:'test@realize.pe',
          password:'testtest',
          id:1,
          authenticated:false
        },
        widget:{
          mockhtml:'<div>{{title}}</div>',
          customTreeStored:[
            {type:'mock_widget', name:'mock_widget_parent', hashkey:'123', settings: {title:'parent_title',children:['234','345']}},
            {type:'mock_widget', name:'mock_widget_child1', hashkey:'234', settings: {title:'child1_title',children:[]}},
            {type:'mock_widget', name:'mock_widget_child2', hashkey:'345', settings: {title:'child2_title',children:['456','567']}},
            {type:'mock_widget', name:'mock_widget_grandchild1', hashkey:'456', settings: {title:'grandchild1_title', children: []}},
            {type:'mock_widget', name:'mock_widget_grandchild2', hashkey:'567', settings: {title:'grandchild2_title', children: []}}
          ],
          customTreeExpanded:{
            type:'mock_widget', name:'mock_widget_parent', hashkey:'123', settings: {
              title:'parent_title',
              children:[
                {type:'mock_widget', name:'mock_widget_child1', hashkey:'234', settings: {title:'child1_title', children:[] } },
                {type:'mock_widget', name:'mock_widget_child2', hashkey:'345', settings: {
                  title:'child2_title',
                  children: [
                    {type:'mock_widget', name:'mock_widget_grandchild1', hashkey:'456', settings: {title:'grandchild1_title', children: [] } },
                    {type:'mock_widget', name:'mock_widget_grandchild2', hashkey:'567', settings: {title:'grandchild2_title', children: [] } }
                  ]
                }}
              ]
            }
          }
        }
      };
    }])


    /*NOTE: $httpBackend CALLS MUST BE IN A "RUN" FUNCTION TO WORK!!!*/
    .run(['user','widget','resource','utils','$httpBackend', 'realizeMockData','lodash',function (user,widget,resource,utils,$httpBackend,mocks,_) {
      console.log('RUNNING BACKEND MODULE');

      // ensure templates get passed through
      $httpBackend.whenGET(/\.|tpl/g).passThrough();

      // NOTE: Default data is defined at the bottom

      // default responses
      var ret = {
        success:function(options){
          if(options === 'fail'){
            return ret.fail();
          }
          var opts = options.response ? options : {response:options};
          return [options.code || 200, options.response, options.headers || {}];
        },
        fail:function(options){
          if (options === undefined){
            options = {message:'generic fail'};
          }
          var opts = options.response ? options : {response:options};
          return [options.code || 400, options.response, options.headers || {}];
        },
        authed:function (options) {
          if(mocks.user.authenticated && options.data.token === mocks.user.token){
            mocks.user.authenticated = true;
            return ret.success(typeof options.success === 'function' ? options.success() : options.success);
          }
          mocks.user.authenticated = false;
          return ret.fail({message:'user not authenticated'});
        }
      };


    // I wonder if we could auto-generate this file from the server endpoint code...
      $httpBackend.whenPOST(/\/api\/v1\/auth_check/)
      .respond(function(url, data, headers){
        // console.log('responding in user whenGET: url, data, headers : ',url, data, headers);
        return ret.authed({
          data:data,
          success:{authenticated: mocks.user.authenticated, email: mocks.user.email, hashkey: mocks.user.hashkey, id: mocks.user.id},
          fail:{authenticated: false}
        });
      });
      $httpBackend.whenGET(/\/api\/v1\/login/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{"csrf_token": null, "fields": [{"current_token": null, "data": null, "default": null, "description": "", "errors": [], "filters": [], "flags": {}, "id": "csrf_token", "label": {"field_id": "csrf_token", "text": "Csrf Token"}, "name": "csrf_token", "process_errors": [], "short_name": "csrf_token", "type": "CSRFTokenField", "widget": "hidden"}, {"data": false, "default": false, "description": "", "errors": [], "filters": [], "flags": {}, "id": "remember", "label": {"field_id": "remember", "text": "Remember Me"}, "name": "remember", "process_errors": [], "short_name": "remember", "type": "BooleanField", "widget": "checkbox"}, {"data": false, "default": null, "description": "", "errors": [], "filters": [], "flags": {}, "id": "submit", "label": {"field_id": "submit", "text": "Login"}, "name": "submit", "process_errors": [], "short_name": "submit", "type": "SubmitField", "widget": "submit"}, {"data": null, "default": null, "description": "", "errors": [], "filters": [], "flags": {}, "id": "next", "label": {"field_id": "next", "text": "Next"}, "name": "next", "process_errors": [], "short_name": "next", "type": "HiddenField", "widget": "hidden"}, {"data": null, "default": null, "description": "", "errors": [], "filters": [], "flags": {}, "id": "password", "label": {"field_id": "password", "text": "Password"}, "name": "password", "process_errors": [], "short_name": "password", "type": "PasswordField", "widget": "password"}, {"data": null, "default": null, "description": "", "errors": [], "filters": [], "flags": {}, "id": "email", "label": {"field_id": "email", "text": "Email Address"}, "name": "email", "process_errors": [], "short_name": "email", "type": "TextField", "widget": "text"} ] }
        });
      });

      $httpBackend.whenPOST(/\/api\/v1\/login/)
      .respond(function(url,data,headers){
        if(mocks.user.authenticated){
          return ret.fail({"csrf_token": null, "fields": [{"current_token": null, "data": "", "default": null, "description": "", "errors": [], "filters": [], "flags": {}, "id": "csrf_token", "label": {"field_id": "csrf_token", "text": "Csrf Token"}, "name": "csrf_token", "process_errors": [], "raw_data": [], "short_name": "csrf_token", "type": "CSRFTokenField", "widget": "hidden"}, {"data": false, "default": false, "description": "", "errors": [], "filters": [], "flags": {}, "id": "remember", "label": {"field_id": "remember", "text": "Remember Me"}, "name": "remember", "process_errors": [], "raw_data": [], "short_name": "remember", "type": "BooleanField", "widget": "checkbox"}, {"data": false, "default": null, "description": "", "errors": [], "filters": [], "flags": {}, "id": "submit", "label": {"field_id": "submit", "text": "Login"}, "name": "submit", "process_errors": [], "raw_data": [], "short_name": "submit", "type": "SubmitField", "widget": "submit"}, {"data": "", "default": null, "description": "", "errors": [], "filters": [], "flags": {}, "id": "next", "label": {"field_id": "next", "text": "Next"}, "name": "next", "process_errors": [], "raw_data": [], "short_name": "next", "type": "HiddenField", "widget": "hidden"}, {"data": "test", "default": null, "description": "", "errors": ["Invalid password"], "filters": [], "flags": {}, "id": "password", "label": {"field_id": "password", "text": "Password"}, "name": "password", "process_errors": [], "raw_data": ["test"], "short_name": "password", "type": "PasswordField", "widget": "password"}, {"data": "test@realize.pe", "default": null, "description": "", "errors": [], "filters": [], "flags": {}, "id": "email", "label": {"field_id": "email", "text": "Email Address"}, "name": "email", "process_errors": [], "raw_data": ["test@realize.pe"], "short_name": "email", "type": "TextField", "widget": "text"} ] });
        }
        return ret.success({"user": {"hashkey": mocks.user.hashkey, "id": mocks.user.id, "token": mocks.user.token } });
      });

      $httpBackend.whenGET(/\/api\/v1\/register/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{"csrf_token": null, "fields": [{"current_token": null, "data": null, "default": null, "description": "", "errors": [], "filters": [], "flags": {}, "id": "csrf_token", "label": {"field_id": "csrf_token", "text": "Csrf Token"}, "name": "csrf_token", "process_errors": [], "short_name": "csrf_token", "type": "CSRFTokenField", "widget": "hidden"}, {"data": null, "default": null, "description": "", "errors": [], "filters": [], "flags": {"required": true }, "id": "password", "label": {"field_id": "password", "text": "Password"}, "name": "password", "process_errors": [], "short_name": "password", "type": "PasswordField", "widget": "password"}, {"data": null, "default": null, "description": "", "errors": [], "filters": [], "flags": {"required": true }, "id": "email", "label": {"field_id": "email", "text": "Email Address"}, "name": "email", "process_errors": [], "short_name": "email", "type": "TextField", "widget": "text"}, {"data": false, "default": null, "description": "", "errors": [], "filters": [], "flags": {}, "id": "submit", "label": {"field_id": "submit", "text": "Register"}, "name": "submit", "process_errors": [], "short_name": "submit", "type": "SubmitField", "widget": "submit"} ] }
        });
      });

      $httpBackend.whenPOST(/\/api\/v1\/register/)
      .respond(function(url,data,headers){
        if(mocks.user.hashkey === data.user.hashkey){
          return ret.fail({"csrf_token": null, "fields": [{"current_token": null, "data": "", "default": null, "description": "", "errors": [], "filters": [], "flags": {}, "id": "csrf_token", "label": {"field_id": "csrf_token", "text": "Csrf Token"}, "name": "csrf_token", "process_errors": [], "raw_data": [], "short_name": "csrf_token", "type": "CSRFTokenField", "widget": "hidden"}, {"data": "testtest", "default": null, "description": "", "errors": [], "filters": [], "flags": {"required": true }, "id": "password", "label": {"field_id": "password", "text": "Password"}, "name": "password", "process_errors": [], "raw_data": ["testtest"], "short_name": "password", "type": "PasswordField", "widget": "password"}, {"data": "test@realize.pe", "default": null, "description": "", "errors": ["test@realize.pe is already associated with an account."], "filters": [], "flags": {"required": true }, "id": "email", "label": {"field_id": "email", "text": "Email Address"}, "name": "email", "process_errors": [], "raw_data": ["test@realize.pe"], "short_name": "email", "type": "TextField", "widget": "text"}, {"data": false, "default": null, "description": "", "errors": [], "filters": [], "flags": {}, "id": "submit", "label": {"field_id": "submit", "text": "Register"}, "name": "submit", "process_errors": [], "raw_data": [], "short_name": "submit", "type": "SubmitField", "widget": "submit"} ] });
        }
        return ret.success({"user": {"hashkey": mocks.user.hashkey, "id": mocks.user.id, "token": mocks.user.token } });
      });

      $httpBackend.whenGET(/\/api\/v1\/logout/)
      .respond(function(url,data,headers){
        if(mocks.user.authenticated && data.token === mocks.user.token){
          mocks.user.authenticated = false;
          mocks.user.token = false;
          return ret.success({authenticated:false});
        }
        return ret.fail({message:'user must be authenticated to log out'});
      });

      $httpBackend.whenPOST(/\/api\/v1\/(user|group)\/([0-9a-zA-Z]+)\/resources/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:function(){
            var newResource = {
              type:data.type,
              name:data.name,
              hashkey:mocks.hashFaker(),
              settings: {
                title:data.settings.title,
                children:data.settings.children
              }
            };
            mocks.widget.customTreeStored.push(newResource);
            return newResource;
          }
        });
      });

      $httpBackend.whenDELETE(/\/api\/v1\/(user|group)\/([0-9a-zA-Z]+)\/resources\/([0-9a-zA-Z]+)/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:function () {
            var rArr = url.split('/');
            var rHash = rArr[5];
            _.remove(mocks.widget.customTreeStored,function (obj) {
              return obj.hashkey === rHash;
            });
            return {};
          }
        });
      });

      $httpBackend.whenGET(/\/api\/v1\/(user|group)\/([0-9a-zA-Z]+)\/resources\/([0-9a-zA-Z]+)/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:function () {
            var rArr = url.split('/');
            var rHash = rArr[5];
            var resrc = _.find(mocks.widget.customTreeStored,{hashkey:rHash});
            return resrc || 'fail';
          }
        });
      });

      $httpBackend.whenPUT(/\/api\/v1\/(user|group)\/([0-9a-zA-Z]+)\/resources\/([0-9a-zA-Z]+)/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:function () {
            var rArr = url.split('/');
            var rHash = rArr[5];
            var resrc = _.find(mocks.widget.customTreeStored,{hashkey:rHash});
            return resrc || 'fail';
          }
        });
      });

      $httpBackend.whenGET(/\/api\/v1\/user\/([0-9a-zA-Z]+)\/profile/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:function () {
            return {
              "first_name": null,
              "hashkey": null,
              "last_name": null,
              "settings": {},
              "timezone": null
            };
          }
        });
      });

      $httpBackend.whenPUT(/\/api\/v1\/user\/([0-9a-zA-Z]+)\/profile/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:function () {
            return angular.extend(mocks.data.user,data);
          },
          fail:{}
        });
      });


      $httpBackend.whenGET(/\/api\/v1\/group/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{},
          fail:{}
        });
      });

      $httpBackend.whenPOST(/\/api\/v1\/group/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{},
          fail:{}
        });
      });

      $httpBackend.whenGET(/\/api\/v1\/group\/{hashkey}/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{},
          fail:{}
        });
      });

      $httpBackend.whenPUT(/\/api\/v1\/group\/{hashkey}/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{},
          fail:{}
        });
      });

      $httpBackend.whenGET(/\/api\/v1\/user\/{user_hashkey}\/groups/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{},
          fail:{}
        });
      });

      $httpBackend.whenGET(/\/api\/v1\/user\/{user_hashkey}\/groups\/{group_hashkey}\/{action}/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{},
          fail:{}
        });
      });

      $httpBackend.whenGET(/\/api\/v1\/(user|group)\/([0-9a-zA-Z]+)\/plugins/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{},
          fail:{}
        });
      });

      $httpBackend.whenGET(/\/api\/v1\/(user|group)\/([0-9a-zA-Z]+)\/plugins\/([0-9a-zA-Z]+)\/\/actions\/{action}/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{},
          fail:{}
        });
      });

      $httpBackend.whenPOST(/\/api\/v1\/(user|group)\/([0-9a-zA-Z]+)\/plugins\/([0-9a-zA-Z]+)\/\/actions\/{action}/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{},
          fail:{}
        });
      });

      $httpBackend.whenGET(/\/api\/v1\/(user|group)\/([0-9a-zA-Z]+)\/views/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{},
          fail:{}
        });
      });

      $httpBackend.whenDELETE(/\/api\/v1\/(user|group)\/([0-9a-zA-Z]+)\/plugins\/([0-9a-zA-Z]+)\/\/views\/([0-9a-zA-Z]+)/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{},
          fail:{}
        });
      });

      $httpBackend.whenGET(/\/api\/v1\/(user|group)\/([0-9a-zA-Z]+)\/plugins\/([0-9a-zA-Z]+)\/\/views\/([0-9a-zA-Z]+)/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{},
          fail:{}
        });
      });

      $httpBackend.whenPATCH(/\/api\/v1\/(user|group)\/([0-9a-zA-Z]+)\/plugins\/([0-9a-zA-Z]+)\/\/views\/([0-9a-zA-Z]+)/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{},
          fail:{}
        });
      });

      $httpBackend.whenPOST(/\/api\/v1\/(user|group)\/([0-9a-zA-Z]+)\/plugins\/([0-9a-zA-Z]+)\/\/views\/([0-9a-zA-Z]+)/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{},
          fail:{}
        });
      });

      $httpBackend.whenPUT(/\/api\/v1\/(user|group)\/([0-9a-zA-Z]+)\/plugins\/([0-9a-zA-Z]+)\/\/views\/([0-9a-zA-Z]+)/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{},
          fail:{}
        });
      });

      $httpBackend.whenGET(/\/api\/v1\/(user|group)\/([0-9a-zA-Z]+)\/authorizations/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{},
          fail:{}
        });
      });

      $httpBackend.whenGET(/\/api\/v1\/(user|group)\/([0-9a-zA-Z]+)\/resources/)
      .respond(function(url,data,headers){
        console.log('resource arguments',arguments);
        return ret.authed({
          data:data,
          success:mocks.widget.customTreeStored,
          fail:{"message":"Settings to store."}
        });
      });

      $httpBackend.whenGET(/\/api\/v1\/tasks\/{task_id}/)
      .respond(function(url,data,headers){
        return ret.authed({
          data:data,
          success:{},
          fail:{}
        });
      });



      }
    ]);

});


