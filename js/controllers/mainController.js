var app = angular.module('app', ['ngFileUpload', 'ui.router']);
app.controller("mainController", function (Upload, $window, $scope, $http, $filter, $rootScope) {

    $rootScope.solicitudPost = function (url, data, fnExito, fnError, header) {
        var form_data = new FormData();
        if (data && !header) {
            for (var key in data) {
                form_data.append(key, data[key]);
            }
        }

        var config = {
            headers: {
                'Content-Type': header ? header : 'text/plain'
            }
        }
        log(data);
        $http.post('/api' + url, data, config).then(function (response) {
            fnExito(response.data)
        }, function (response) {
            log(response);
            fnError(response.data)
        });
    }
});
