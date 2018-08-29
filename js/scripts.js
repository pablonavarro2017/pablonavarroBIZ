var app = angular.module('app', ['ngFileUpload','ui.router']);
app.controller("mainController", function (Upload, $window, $scope, $http, $filter, $rootScope) {

   $scope.solicitudPost = function (url, data, fnExito, fnError, header) {
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
    $scope.message = "Ningún archivo";
    $scope.submit = function () { //function to call on form submit
        if ($scope.upload_form.file.$valid) { //check if from is valid
            $scope.upload($scope.file); //call upload function
        }
    }
    $scope.upload = function (file) {
        Upload.upload({
            url: 'http://localhost:9000/api/uploadFile', //webAPI exposed to upload the file
            data: {
                file: file
            } //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise
            $scope.message = resp.data.mensaje;
        }, function (resp) { //catch error
            $scope.message = 'Error status: ' + resp.status;
        });
    };
});

function log(o) {
    console.log(o);
}
window.onload = function () {
    $('.nav li a').on('click', function () {
        $('.navbar-collapse').collapse('hide');
    });
};



//    $scope.post = function () {
//        $scope.solicitudPost("/getUsers", {
//            fName: "Pablo",
//            lName: "Navarro"
//        }, function (res) {
//            $scope.data = res;
//        }, function (res) {
//            $scope.data = res;
//        });
//    }
