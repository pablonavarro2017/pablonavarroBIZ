app.controller("archivosController", function (Upload, $sce, $window, $scope, $http, $filter, $rootScope, $interval, $location) {
    s = $scope;
    rs = $rootScope;
    rs.sa = s;
    /**/
    $scope.subirArchivo = function () { //function to call on form submit
        if ($scope.upload_form.file.$valid && $scope.file) { //check if from is valid
            $scope.upload($scope.file); //call upload function
        } else {
            rs.agregarAlerta('Archivo Inválido');
        }
    }
    $scope.upload = function (file) {
        $rootScope.requestCount++;
        rs.agregarAlerta('Subiendo Archivo: ' + file.name+" - "+(file.size/1024/1024).toFixed(1)+" MB");
        Upload.upload({
            url: '/api/uploadFile', //webAPI exposed to upload the file
            data: {
                file: file,
                ruta: $scope.carpetaActual.urlActual
            } //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise
            rs.agregarAlerta(resp.data.mensaje);
            $scope.file = null;
            $scope.mostrarDirectorios();
            $scope.urlDirecta($scope.carpetaActual.urlActual);
        }, function (resp) { //catch error
            rs.agregarAlerta('Error status: ' + resp.status);
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
            carpetaArchivo = fileName.name.substr(0, fileName.name.lastIndexOf('/'));
            $scope.fs.folders.forEach((folderName) => {
                if (folderName == currentFolderName && currentFolderName == carpetaArchivo) {
                    nombre = fileName.name.substr(fileName.name.lastIndexOf('/'));
                    ext = nombre.slice((nombre.lastIndexOf(".") - 1 >>> 0) + 2);
                    var arch = {
                        nombre: nombre.substr(nombre.lastIndexOf('/') + 1),
                        index: cont++,
                        ext: ext,
                        size: fileName.size,
                        playingVideo: false
                    }
                    $scope.carpetaActual.nombresArchivosAMostrar.push(arch);
                }
            })
        });
        setIcon();
        s.playingVideo = false;
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
        s.nombreCarpeta = ""
        rs.cargarPopup('crearCarpeta');
        focus('mkDir');
    }

    $scope.mkDir = function (folderName) {
        if (validarNombre(folderName)) {
            $rootScope.solicitudPost("/mkDir", {
                rutaCarpeta: $scope.carpetaActual.urlActual + '/' + folderName
            }, function (data) {
                rs.cargarPopup('');
                s.carpetaActual.nombresFoldersAMostrar.push({
                    nombre: folderName,
                    index: s.carpetaActual.nombresFoldersAMostrar.length + 1
                });
                rs.agregarAlerta('Carpeta Creada');
            }, function (res) {
                rs.agregarAlerta('Error Al Crear Carpeta');
                log(res);
            });
        } else {
            rs.agregarAlerta('Nombre Inválido');
        }
    }
    $scope.player = function (audioName, mode) {
        if (mode == 'stop') {
            $scope.audio.pause();
            $scope.audio.currentTime = 0;
            $scope.audio.currentTrack = '';
        } else if (mode == 'pause') {
            if ($scope.audio) {
                $scope.audio.pause();
            }
        } else if (mode == 'play') {
            $scope.stopVideo();
            if (!$scope.audio || $scope.audio.src.search('undefined') > 0) { // primera vez reproduciendo o se había parado(stop) la canción anterior
                $scope.audio = new Audio('./filesUploaded/' + audioName);
            } else if ($scope.audio.src.search(audioName) < 0) { // Si se va a reproducir una canción en Pausa
                $scope.audio.pause();
                $scope.audio.currentTime = 0;
                $scope.audio = new Audio('./filesUploaded/' + audioName);
            }
            $scope.audio.play();
            $scope.audio.currentTrack = audioName;
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
        apk: 'android',
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
        if (nombre == undefined || nombre == "") {
            return false;
        }
        for (var i = 0; i < nombre.length; i++) {
            if (!nombre.charAt(i).match(/^[a-zA-Z].*/)) {
                return false;
            }
        }
        return true;
    }

    $scope.playVideo = function (a) {
        $scope.config = {
            preload: "none",
            sources: [

                {
                    src: $sce.trustAsResourceUrl("./filesUploaded/" + a.nombre),
                    type: "video/mp4"
                },

				],
            tracks: [
                {
                    src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
                    kind: "subtitles",
                    srclang: "en",
                    label: "English",
                    default: ""
					}
				],
            theme: {
                url: "https://unpkg.com/videogular@2.1.2/dist/themes/default/videogular.css"
            }
        };
        $scope.carpetaActual.nombresArchivosAMostrar.forEach((ar) => {
            ar.playingVideo = false;
        });
        $scope.player('', 'pause'); //Pausar una canción si se estaba reproduciendo
        a.playingVideo = true;
        $scope.playingVideo = true;
    }
    $scope.stopVideo = function (a) {
        $scope.config = {};
        if (a) {
            a.playingVideo = false;

        } else {
            $scope.carpetaActual.nombresArchivosAMostrar.forEach((ar) => {
                ar.playingVideo = false;
            });
        }
        $scope.playingVideo = false;
    }
    $scope.abrirImagen = function (nombre) {
        s.currentImage = $scope.carpetaActual.urlActual + '/' + nombre;
        rs.cargarPopup('verImagen');
    }

    $scope.abrirTexto = function (nombreArchivo) {
        $rootScope.solicitudPost("/getPlainText", {
            rutaArchivo: $scope.carpetaActual.urlActual + '/' + nombreArchivo
        }, function (data) {
            s.editingFile = nombreArchivo;
            s.fileContent = data;
            rs.cargarPopup("verEditarText");
        }, function (res) {
            rs.agregarAlerta('Error Al Crear Carpeta');
            log(res);
        });
    }
    $scope.deleteFile = function (a) {
        $rootScope.solicitudPost("/deleteFile", {
            rutaArchivo: $scope.carpetaActual.urlActual + '/' + a.nombre
        }, function (data) {
            if(data=="OK"){
                rs.agregarAlerta('Archivo Borrado: ' + a.nombre);
                $scope.carpetaActual.nombresArchivosAMostrar.splice($scope.carpetaActual.nombresArchivosAMostrar.indexOf(a),1);
            }else{
                rs.agregarAlerta('Error Al Borrar Archivo');
            }
        }, function (res) {
            rs.agregarAlerta('Error Al Borrar Archivo');
            log(res);
        });
    }
    s.parseInt = function(n){
        return parseInt(n);
    }
    /**/
    $scope.$on("$destroy", function () {
        $rootScope.controllerDestruido();
    });
});
