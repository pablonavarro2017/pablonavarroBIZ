app.controller("archivosController", function (Upload, $window, $scope, $http, $filter, $rootScope, $interval, $location) {
    s = $scope;
    rs = $rootScope;
    rs.sa = s;
    /**/
    $scope.message = "Ningún archivo";
    $scope.submit = function () { //function to call on form submit
        if ($scope.upload_form.file.$valid) { //check if from is valid
            $scope.upload($scope.file); //call upload function
        }
    }
    $scope.upload = function (file) {
        $rootScope.requestCount++;
        $scope.message = 'Subiendo Archivo';
        Upload.upload({
            url: '/api/uploadFile', //webAPI exposed to upload the file
            data: {
                file: file,
                ruta: $scope.carpetaActual.urlActual
            } //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise
            $scope.message = resp.data.mensaje;
            $scope.file = null;
            $scope.mostrarDirectorios();
            $scope.urlDirecta($scope.carpetaActual.urlActual);
        }, function (resp) { //catch error
            $scope.message = 'Error status: ' + resp.status;
        }).finally(function () {
            $rootScope.requestCount--;
        });
    };


    $scope.data = '';
    $scope.mostrarDirectorios = function () {
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

    $scope.URLs = []

    $scope.carpetaActual = {
        nombresArchivosAMostrar: [],
        nombresFoldersAMostrar: [],
        urlActual: './filesUploaded'
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
        //        log($scope.URLs);
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
                    nombre = fileName.substr(fileName.lastIndexOf('/'));
                    ext = nombre.slice((nombre.lastIndexOf(".") - 1 >>> 0) + 2);
                    var arch = {
                        nombre: nombre.substr(nombre.lastIndexOf('/') + 1),
                        index: cont++,
                        ext: ext
                    }
                    $scope.carpetaActual.nombresArchivosAMostrar.push(arch);
                }
            })
        });
        setIcon();
    }

    $scope.openFile = function (fileName) {
        $rootScope.solicitudPost("/getFile", {
            rutaArchivo: $scope.carpetaActual.urlActual + '/' + fileName
        }, function (data, resp) {
            var blob = new Blob([data]);
            saveAs(blob, resp.headers('FileName'));
        }, function (res) {
            log(res);
        }, 'blob');
    }


    $scope.preMKDir = function () {
        s.nombreCarpeta = "CARPETiNHA"
        rs.cargarPopup('crearCarpeta');
    }

    $scope.mkDir = function (folderName) {
        if (folderName != undefined && validarNombre(folderName)) {
            $rootScope.solicitudPost("/mkDir", {
                rutaCarpeta: $scope.carpetaActual.urlActual + '/' + folderName
            }, function (data) {
                rs.cargarPopup('');
                s.mostrarDirectorios();
                rs.agregarAlerta('Carpeta Creada');
            }, function (res) {
                rs.agregarAlerta('Error Al Crear Carpeta');
                log(res);
            });
        } else {
            rs.agregarAlerta('Nombre Inválido');
        }
    }

    var exts = {
        pdf: 'file-pdf-o',
        docx: 'file-word-o',
        xlsx: 'file-excel-o',
        pptx: 'file-powerpoint-o',
        mp3: 'music',
        avi: 'video-camera',
        mp4: 'video-camera',
        mkv: 'video-camera',
        png: 'file-image-o',
        ico: 'file-image-o',
        jpg: 'file-image-o',
        jpeg: 'file-image-o',
        gif: 'file-image-o',
        html: 'file-text-o',
        css: 'file-text-o',
        js: 'file-text-o',
        txt: 'file-text-o',
    }

    function setIcon() {
        $scope.carpetaActual.nombresArchivosAMostrar.forEach((file) => {
            if (exts[file.ext]) {
                file.icon = exts[file.ext];
            } else {
                file.icon = 'file-o'
            }
        })
    }

    function validarNombre(nombre) {
        for (var i = 0; i < nombre.length; i++) {
            if (!nombre.charAt(i).match(/^[a-zA-Z].*/)) {
                return false;
            }
        }
        return true;
    }

    /**/
    $scope.$on("$destroy", function () {
        $rootScope.controllerDestruido();
    });
});
