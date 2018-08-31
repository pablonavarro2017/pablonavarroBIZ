app.controller("fsController", function (Upload, $window, $scope, $http, $filter, $rootScope) {

    $scope.message = "Ningún archivo";
    $scope.submit = function () { //function to call on form submit
        if ($scope.upload_form.file.$valid) { //check if from is valid
            $scope.upload($scope.file); //call upload function
        }
    }
    $scope.upload = function (file) {
        $rootScope.requestCount++;
        $scope.message = 'Subiendo Archivo';
        log($rootScope.requestCount)
        Upload.upload({
            url: '/api/uploadFile', //webAPI exposed to upload the file
            data: {
                file: file
            } //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise
            $scope.message = resp.data.mensaje;
        }, function (resp) { //catch error
            $scope.message = 'Error status: ' + resp.status;
        }).finally(function () {
            $rootScope.requestCount--;
        });
    };


    $scope.data = '';
    $scope.postIt = function () {
        $rootScope.solicitudPost("/getDirectories", {
            carpetaActual: './filesUploaded'
        }, function (res) {
            $scope.data = res.data;
            $scope.fs = res.data;
            $scope.urlDirecta({
                url: './filesUploaded'
            });
        }, function (res) {
            $scope.data = res;
        });
    }
    $scope.mostrarDirectorios = function () {
        $scope.postIt();
    }

    $scope.URLs = []

    $scope.carpetaActual = {
        nombresArchivosAMostrar: [],
        nombresFoldersAMostrar: [],
        urlActual: ''
    };

    $scope.urlDirecta = function (u) {
        //        log( $scope.URLs);
        var newURls = []
        for (var i = 0; i < $scope.URLs.length; i++) {
            var obj = $scope.URLs[i]
            if (obj.url == u.url) {
                break
            }
            newURls.push(obj);

        }
        $scope.URLs = newURls;
        log($scope.URLs);
        $scope.getFilesNameFromFolder(u.url);
    }


    $scope.getFilesNameFromFolder = function (currentFolderName) {
        log(currentFolderName)
        $scope.URLs.push({
            nombreFolder: currentFolderName.substr(currentFolderName.lastIndexOf('/') + 1),
            url: currentFolderName
        });
        $scope.carpetaActual.urlActual = currentFolderName;
        $scope.carpetaActual.nombresArchivosAMostrar = [];
        $scope.carpetaActual.nombresFoldersAMostrar = [];
        var carpetaArchivo = '';
        var rooFolder = '';
        var cont = 0;
        $scope.fs.folders.forEach((folderName) => {
            rooFolder = folderName.substr(0, folderName.lastIndexOf('/'));
            actualFolderName = folderName.substr(folderName.lastIndexOf('/') + 1);
            if (currentFolderName == rooFolder) {
                var fold = {
                    nombre: actualFolderName,
                    index: cont++
                }
                $scope.carpetaActual.nombresFoldersAMostrar.push(fold);
            }
        });
        $scope.fs.files.forEach((fileName) => {
            carpetaArchivo = fileName.substr(0, fileName.lastIndexOf('/'));
            $scope.fs.folders.forEach((folderName) => {
                if (folderName == currentFolderName && currentFolderName == carpetaArchivo) {
                    var arch = {
                        nombre: fileName.substr(fileName.lastIndexOf('/') + 1),
                        index: cont++
                    }
                    $scope.carpetaActual.nombresArchivosAMostrar.push(arch);
                }
            })
        });
    }
    $scope.openFile = function (fileName) {
        $rootScope.solicitudPost("/getFile", {
            rutaArchivo: $scope.carpetaActual.urlActual + '/' + fileName
        }, function (data, resp) {
            log(resp)  ;
            log(resp.headers('FileName'));
            var blob = new Blob([data]);
            saveAs(blob, resp.headers('FileName'));
        }, function (res) {
            log(res);
        },'blob');
    }
});
