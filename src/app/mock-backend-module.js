angular.module('realize.mock-backend', [
  'ngMockE2E',
  'restangular'
])



.run([
  '$httpBackend',
  function ($httpBackend) {
    // console.log('running backend module');
    $httpBackend.whenGET(/\.|tpl/g).passThrough();

    /*NOTE: $httpBackend CALLS MUST BE IN A "RUN" FUNCTION TO WORK!!!*/

    // USER
    // $httpBackend.whenGET(/\/api\/v0\/user/)
    // .respond(function(url, data, headers){
    //   // console.log('responding in user whenGET: url, data, headers : ',url, data, headers);
    //   console.log('responding with userCopy',userCopy);
    //   return [200, [userCopy], {}];
    // });


    // // LOGIN
    // $httpBackend.whenGET(/\/api\/v0\/login/)
    // .respond(function(url, data, headers){
    //   // console.log('responding in user whenGET: url, data, headers : ',url, data, headers);
    //   console.log('responding with userCopy',userCopy);
    //   return [200, [userCopy], {}];
    // });

    // $httpBackend.whenPOST(/\/api\/v0\/login/)
    // .respond(function(url, data, headers){
    //   // console.log('responding in user whenGET: url, data, headers : ',url, data, headers);
    //   console.log('responding with userCopy',userCopy);
    //   return [200, [userCopy], {}];
    // });


    // // create a different api for settings, so the app doesn't
    // $httpBackend.whenGET(/\/api\/v0\/app-data/)
    // .respond(function(url, data, headers){
    //   // var peopleID = url.match(/\/api\/v0\/app-data\/([0-9]+)?/gi);
    //   console.log('responding with app-data: url, data, headers : ',url, data, headers);
    //   console.log('responding with app-data: peopleCopiesArr[0].installed_tabs.realize_app : ',peopleCopiesArr[0].installed_tabs.realize_app);
    //   return [200, [peopleCopiesArr[0].installed_tabs.realize_app],{}];
    // });

    // $httpBackend.whenPOST(/\/api\/v0\/app-data/)
    // .respond(function(url, data, headers){
    //   console.log('add people');
    //   people.push(data);
    //   return [200,people,{}];
    // });

    // $httpBackend.whenPUT(/\/api\/v0\/app-data/)
    //   .respond(function(url, data, headers){
    //   console.log('update people',data);
    //   angular.extend(people[data.id],data);
    //   return [200,[people[data.id]],{}];
    // });

    // $httpBackend.whenDELETE(/\/api\/v0\/app-data/)
    // .respond(function(url, data, headers){
    //   delete people[data.id];
    //   return [200,[people[data.id]],{}];
    // });

  }
]);
