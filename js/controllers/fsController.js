app.controller("fsController", function (Upload, $window, $scope, $http, $filter, $rootScope) {

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


    $scope.postIt = function () {
        $rootScope.solicitudPost("/getFiles", {}, function (res) {
            $scope.data = res;
            log(res);
        }, function (res) {
            $scope.data = res;
            log(res);
        });
    }
    $scope.postIt();
});
