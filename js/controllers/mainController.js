var app = angular.module('app', ['ngFileUpload', 'ui.router']);
app.controller("mainController", function (Upload, $window, $scope, $http, $filter, $rootScope) {
    $rootScope.requestCount = 0;
    $rootScope.solicitudPost = function (url, data, fnExito, fnError, header) {
        $rootScope.requestCount++;
        var form_data = new FormData();
        if (data && !header) {
            for (var key in data) {
                form_data.append(key, data[key]);
            }
        }
        var config = {
            headers: {
                'Content-Type': 'application/json',
//                'Content-Type': header ? header : 'text/plain',
            },
            responseType: header!=undefined?'blob':'',
        }
        $http.post('/api' + url, data, config).then(function(response) {
            fnExito(response.data,response);
        }, function(data) {
            fnError(response.data);
        }).finally(function () {
            $rootScope.requestCount--;
//            log('Requests Pendientes: ' + $scope.requestCount);
        });
    }
});
