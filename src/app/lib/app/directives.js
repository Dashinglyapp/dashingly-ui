define(['app', 'realize-debugging'], function(app){
    app

    .directive('topLevelWidget', function() {
        return {
          restrict: 'E',
          templateUrl: 'partials/top-level-widget.tpl.html'
        };
     });

});

