define(['app', 'angular', 'moment', 'angular-charts'], function(app, angular, moment){
    app.register.controller('ChartCtrl', ['$scope', 'sync', 'user', function($scope, sync, user){
        $scope.hashkey = $scope.widgetData.hashkey;

        sync.views('readOne', {scope: 'user', scopeHash: user.getProp('hashkey'), resourceHash: $scope.widgetData.endpoints[0]}).then(function(data){
            $scope.allChartData = data;
            $scope.chartConfig = {
                title : data.name,
                legend: {
                    display: false,
                    position: 'left'
                },
                labels : false,
                xAxisMaxTicks: 3
            };

            var series = [];
            var chartData = [];
            var i;
            for(i = 0; i < data.data.y.length; i++){
                series.push(data.data.y[i].label);
            }

            for(i = 0; i < data.data.y[0].data.length; i++){
                var y = [];
                var x = data.data.x.data[i];
                var m = moment(x).format("M/D");
                for(var j = 0; j < data.data.y.length; j++){
                    y.push(data.data.y[j].data[i]);
                }
                chartData.push({
                    x: m,
                    y: y,
                    tooltip: m
                });
            }


            $scope.chartData = {
                series: series,
                data: chartData
            };
        });
    }]);
});

