/*
 var underscore = angular.module('underscore', []);
 underscore.factory('_', ['$window', function() {
 return $window._; // assumes underscore has already been loaded on the page
 }]);*/

var puma = angular.module('puma', [
    'ngRoute',
    'isteven-multi-select',
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker',
    'NgSwitchery']);

puma.filter('toLocaleString', function () {
    return function (value) {
        return new Date(value).toLocaleString();
    };
});

puma.controller('pumaCheckController', function ($scope, $http) {
    $scope.pageModel = {
        "page": 1
    };

    $scope.query = function () {
        $http.get('/a/puma-check', {
            params: {
                taskName: $scope.taskName,
                taskGroupName: $scope.taskGroupName,
                success: $scope.success,
                page: $scope.pageModel.page
            }
        }).then(
            function (response) {
                $scope.list = response.data.list;
                $scope.pageModel = response.data.page;
            }
        );
    }

    $scope.query();
});

puma.controller('pumaCheckCreateController', function ($scope, $http) {
    $scope.templateBase = 'app/partials/puma-check/model/';
    $scope.SourceDsBuilderTemplate = 'ds-group';
    $scope.SourceFetcherTemplate = 'source-fetcher-update-id';
    $scope.TargetDsBuilderTemplate = 'ds-group';
    $scope.TargetFetcherTemplate = 'target-fetcher-single-line';
    $scope.ComparisonTemplate = 'comparison-full';
    $scope.MapperTemplate = 'mapper-default';
    $scope.model = {};

    $scope.changeTemplate = function (type, value) {
        $scope[type] = value;
    }

    $scope.create = function () {
        if ($scope.model && $scope.model.baseInfo && $scope.model.baseInfo.initTime) {
            $scope.model.baseInfo.initTime = new Date($scope.model.baseInfo.initTime).getTime();
        }

        $http.post('/a/puma-check', $scope.model).then(
            function (response) {
                alert('Success');
            }
        )
    }
});

puma.controller('simpleModalController', function ($scope, item) {
    $scope.item = item;
});

puma.controller('pumaMonitorController', function ($scope, $http, $modal, $interval) {
    $scope.query = function () {
        $http.get('/a/puma-status').then(
            function (response) {
                $scope.clients = response.data.clients;
                $scope.servers = response.data.servers;

                _.each($scope.clients, function (item) {
                    item.tablesStr = _.first(item.tables, 10).join('<br/>');

                    if (item.tables.length > 10) {
                        item.tablesStr += '<br/>Click to show more...'
                    }
                });

                _.each($scope.servers, function (item) {
                    item.targetStr = _.map(_.first(item.target.tables, 10), function (table) {
                        return table.schemaName + '.' + table.tableName;
                    }).join('<br/>');

                    if (item.target.tables.length > 10) {
                        item.targetStr += '<br/>Click to show more...'
                    }
                });
            }
        );
    };

    $scope.query();

    var interval = $interval(function () {
        if ($scope.autoRefresh) {
            $scope.query();
        }
    }, 5000);

    $scope.$on('$destroy', function () {
        $interval.cancel(interval);
    });

    $scope.openTables = function (item) {
        $modal.open({
            templateUrl: 'tables.html',
            controller: 'simpleModalController',
            resolve: {
                item: function () {
                    return item;
                }
            }
        });
    };

    $scope.openTarget = function (item) {
        $modal.open({
            templateUrl: 'target.html',
            controller: 'simpleModalController',
            resolve: {
                item: function () {
                    return item;
                }
            }
        });
    };
});


puma.controller('pumaCreateController', function ($scope, $http) {

    $scope.submit = function () {
        var database = $scope.database;
        var tables = $scope.tables.split(',');
        var serverNames = $scope.servers.split(',');
        var beginTimes = {};
        _.each(serverNames, function (serverName) {
            beginTimes[serverName] = $scope.beginTime;
        });

        var json = {
            database: database,
            tables: tables,
            serverNames: serverNames,
            beginTimes: beginTimes
        };

        $http.post('/a/puma-create', json).then(
            function (response) {
                alert('Success');
            }
        )
    }

    $scope.reset = function () {
        $scope.database = null;
        $scope.tables = null;
        $scope.servers = null;
        $scope.beginTime = null;
    }

});

puma.controller('pumaTargetController', function ($scope, $http) {

    $scope.init = true;
    $scope.pumaDto = {};

    $scope.search = function () {
        var postJson = {
            'database': $scope.pumaDto.database
        };
        $http.post('/a/puma-target', postJson).then(
            function (response) {
                if (response.data.status == "success") {
                    $scope.pumaDto = response.data.result;
                }
            }
        )
    }
});

puma.controller('pumaTaskCreateController', function ($scope, $http) {

    $scope.task = {
        targets: {
            database: ['table_0', 'table_1']
        },
        hosts: ['0.0.0.0', '1.1.1.1'],
        beginTime: 0
    };

    $scope.targets = [{
        database: null,
        tables: null
    }];

    $scope.submit = function () {


        $scope.task.targets[target.database]

        $http.post('/a/puma-task/create', $scope.pumaTaskJson).then(
            function (response) {
                alert('Success');
            }
        );
    }
});

puma.config(function ($routeProvider) {
    $routeProvider
        .when('/puma-monitor', {
            templateUrl: '/app/partials/puma-monitor.html'
        })
        .when('/puma-client', {
            templateUrl: '/app/partials/puma-client.html'
        })
        .when('/puma-server', {
            templateUrl: '/app/partials/puma-server.html'
        })
        .when('/puma-task', {
            templateUrl: '/app/partials/puma-task.html'
        })
        .when('/puma-target', {
            templateUrl: '/app/partials/puma-target.html',
            controller: 'pumaTargetController'
        })
        .when('/puma-create', {
            templateUrl: '/app/partials/puma-create.html',
            controller: 'pumaCreateController'
        })
        .when('/puma-check-create', {
            templateUrl: '/app/partials/puma-check/create.html',
            controller: 'pumaCheckCreateController'
        })
        .when('/puma-check', {
            templateUrl: '/app/partials/puma-check/list.html',
            controller: 'pumaCheckController'
        })
        .otherwise({
            'redirectTo': '/'
        });
});


$(function () {
    $(document).on('mouseenter', '[data-toggle="popover"]', function () {
        $(this).popover('show');
    });
    $(document).on('mouseleave', '[data-toggle="popover"]', function () {
        $(this).popover('hide');
    });
});