angular.module('ngLovefieldDemo', ['ngLovefield'])

.config(['$logProvider', '$lovefieldProvider', function($logProvider, $lovefieldProvider) {

    $logProvider.debugEnabled(true);
    $lovefieldProvider.setDbName('myDb');
    $lovefieldProvider.setDbVersion(1);

    $lovefieldProvider.setDbTables([
        {
            name: 'myTable',
            columns: [
                { name: 'id', type: 'INTEGER' },
                { name: 'text', type: 'STRING' }
            ],
            primaryKey: 'id'
        }
    ]);

}])

.controller('ngLovefieldDemoCtrl', ['$scope', '$lovefield', '$window', function($scope, $lovefield, $window) {

    $scope.initItems = function() {
        $scope.myItem = {};
        $scope.myItem.id = 0;
        $scope.myItem.text = 'Test ngLovefield';
        getAllItems();
    }

    $scope.createMyItem = function() {
        $scope.myItem.id = generateNextId();
        $lovefield.insertItem('myTable', $scope.myItem).then(function(result) {
            $window.location.reload();
        });
    }

    function getAllItems() {
        $lovefield.getAllItems('myTable').then(function(results) {
            $scope.myItems = results;
        });
    }

    function generateNextId() {
        var MIN = 1, MAX = 999;
        return Math.floor(Math.random() * (MAX - MIN)) + MIN;
    }

}]);