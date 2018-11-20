app.controller("archivosController", function (Upload, $sce, $window, $scope, $http, $filter, $rootScope, $interval, $location, $templateCache) {
    s = $scope;
    rs = $rootScope;
    rs.sa = s;
    rs.popupUrl = "";
    s.archivosEnCola = 0;
    /**/
    $scope.subirArchivos = function () { //function to call on form submit
        if ($scope.upload_form.file.$valid && $scope.file) { //check if from is valid
            s.archivosEnCola += s.file.length;
            multiple = (s.archivosEnCola > 1 ? true : false);
            if (s.archivosEnCola < 50) {
                for (a in s.file) {
                    //                    log(s.file[a]);
                    s.upload(s.file[a], multiple);
                }
            } else {
                rs.agregarAlerta('No más de 50 archivos a la vez');
            }
        } else {
            rs.agregarAlerta('Archivo Inválido');
        }
    }
    $scope.upload = function (file, multiple, url) {
        $rootScope.requestCount++;
        //        rs.agregarAlerta('Subiendo Archivo: ' + file.name + " - " + (file.size / 1024 / 1024).toFixed(1) + " MB");
        Upload.upload({
            url: '/api/uploadFile', //webAPI exposed to upload the file
            data: {
                file: file,
                ruta: (url ? url : $scope.carpetaActual.urlActual)
            } //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise
            if (multiple == false) {
                rs.agregarAlerta(resp.data.mensaje);
            } else {
                s.archivosEnCola--;
                rs.agregarAlerta(resp.data.mensaje);
                if (s.archivosEnCola == 0) {
                    rs.agregarAlerta('Todos los archivos fueron subidos');
                }
            }
            $scope.file = null;
            $scope.mostrarDirectorios($scope.carpetaActual.urlActual);
        }, function (resp) { //catch error
            rs.agregarAlerta('Error status: ' + resp.status);
        }, function (evt) {
            //            log(evt);
            var progressPercentage = parseInt(100.0 *
                evt.loaded / evt.total);
            rs.pushBar({
                texto: "Subiendo: " + file.name + " - " + (file.size / 1024 / 1024).toFixed(1) + " MB",
                progress: evt.loaded,
                total: evt.total,
                percentage: progressPercentage
            })
        }).finally(function () {
            $rootScope.requestCount--;
        });
    };


    $scope.data = '';
    $scope.mostrarDirectorios = function (url) {
        $rootScope.solicitudPost("/getDirectories", {
            carpetaActual: './filesUploaded'
        }, function (res) {
            $scope.data = res.data;
            $scope.fs = res.data;

            url = (!url ? './filesUploaded' : url);
            $scope.urlDirecta({
                url
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
        var newURls = []
        for (var i = 0; i < $scope.URLs.length; i++) {
            var obj = $scope.URLs[i]
            if (obj.url == u.url) {
                break
            }
            newURls.push(obj);
        }
        $scope.URLs = newURls;
        $scope.getFilesNameFromFolder(u.url);
    }


    $scope.getFilesNameFromFolder = function (currentFolderName) {
        $scope.URLs.push({
            nombreFolder: currentFolderName.substr(currentFolderName.lastIndexOf('/') + 1),
            url: currentFolderName
        });
        s.listaReproduccion = [];
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
                    index: cont++,
                    subOption: false
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
                        playingVideo: false,
                        subOption: false
                    }
                    if (ext == 'mp3' || ext == 'ogg') {
                        s.listaReproduccion.push(arch.nombre);
                    }
                    $scope.carpetaActual.nombresArchivosAMostrar.push(arch);
                }
            })
        });
        //        log(s.listaReproduccion);
        setIcon();
        s.playingVideo = false;
    }
    s.listaReproduccion = [];
    $scope.openFile = function (archivo) { //Descargar as Binary
        $rootScope.solicitudPost("/getFile", {
            rutaArchivo: $scope.carpetaActual.urlActual + '/' + archivo.nombre,
            size: archivo.size,
            fileName: archivo.nombre
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
                $scope.audio = new Audio($scope.carpetaActual.urlActual + '/' + audioName);
            } else if ($scope.audio.src.search(audioName) < 0) { // Si se va a reproducir una canción en Pausa
                $scope.audio.pause();
                $scope.audio.currentTime = 0;
                $scope.audio = new Audio($scope.carpetaActual.urlActual + '/' + audioName);
            }
            $scope.audio.play();
            $scope.audio.onended = function () {
                var songIndex = s.listaReproduccion.indexOf(audioName);
                if (songIndex != s.listaReproduccion.length - 1) {
                    $scope.player(s.listaReproduccion[songIndex + 1], 'play');
                }
            };
            $scope.audio.currentTrack = audioName;
        }
    }

    var exts = {
        pdf: 'file-pdf-o',
        docx: 'file-word-o',
        xlsx: 'file-excel-o',
        pptx: 'file-powerpoint-o',
        mp3: 'music',
        ogg: 'music',
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
            if (!nombre.charAt(i) == "." && !nombre.charAt(i).match(/^[a-zA-Z].*/)) {
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

    $scope.abrirTexto = function (a) {
        $rootScope.solicitudPost("/getPlainText", {
            rutaArchivo: $scope.carpetaActual.urlActual + '/' + a.nombre
        }, function (data) {
            s.editingFile = a;
            s.editingFile.fileContent = data;
            rs.cargarPopup("verEditarText");
        }, function (res) {
            rs.agregarAlerta('Error Al Crear Carpeta');
            log(res);
        });
    }
    $scope.preBorrarArchivo = function (a) {
        s.confirm = {};
        s.confirm.a = a;
        s.confirm.funcionSi = s.deleteFile;
        s.confirm.message = "Desea eliminar el archivo: " + a.nombre;
        rs.cargarPopup("popUpConfimar");
    }
    $scope.deleteFile = function (a) {
        $rootScope.solicitudPost("/deleteFile", {
            rutaArchivo: $scope.carpetaActual.urlActual + '/' + a.nombre
        }, function (data) {
            if (data == "OK") {
                rs.agregarAlerta('Archivo Borrado: ' + a.nombre);
                $scope.carpetaActual.nombresArchivosAMostrar.splice($scope.carpetaActual.nombresArchivosAMostrar.indexOf(a), 1);
                rs.cargarPopup('');
            } else {
                rs.agregarAlerta('Error Al Borrar Archivo');
            }
        }, function (res) {
            rs.agregarAlerta('Error Al Borrar Archivo');
            log(res);
        });
    }
    $scope.writeFile = function (a, salir) {
        $rootScope.solicitudPost("/writeFile", {
            rutaArchivo: $scope.carpetaActual.urlActual + '/' + a.nombre,
            nuevoContenido: a.fileContent
        }, function (data) {
            if (data == "OK") {
                salir ? rs.cargarPopup('') : '';
                rs.agregarAlerta('Archivo Actualizado: ' + a.nombre);
            } else {
                rs.agregarAlerta('Error Al Actualizar Archivo');
            }
        }, function (res) {
            rs.agregarAlerta('Error Al Actualizar Archivo');
            log(res);
        });
    }
    $scope.preRenameFile = function (f) {
        s.renamingFile = f;
        rs.cargarPopup('renombrar');
        focus('newFileName');
        s.renameF = s.renameFile;
    }
    $scope.renameFile = function (a, newName) {
        if (validarNombre(newName)) {
            $rootScope.solicitudPost("/renameFile", {
                rutaArchivo: $scope.carpetaActual.urlActual + '/' + a.nombre,
                nuevoNombre: newName,
                ruta: $scope.carpetaActual.urlActual + '/'
            }, function (data) {
                if (data == "OK") {
                    a.nombre = newName;
                    $scope.mostrarDirectorios($scope.carpetaActual.urlActual);
                    rs.cargarPopup('');
                    rs.agregarAlerta('Archivo Actualizado: ' + a.nombre);
                } else {
                    rs.agregarAlerta('Error Al Actualizar Archivo');
                }
            }, function (res) {
                rs.agregarAlerta('Error Al Actualizar Archivo');
                log(res);
            });
        } else {
            rs.agregarAlerta('Nombre Inválido');
        }
    }
    $scope.preMKText = function (f) {
        s.newFile = {
            title: '',
            content: ''
        };
        rs.cargarPopup('nuevoText');
        focus('newTextFile');
    }
    $scope.mkTextFile = function (newFile) {
        if (validarNombre(newFile.title)) {
            $rootScope.solicitudPost("/mkTextFile", {
                rutaArchivo: $scope.carpetaActual.urlActual + '/' + newFile.title,
                contenido: newFile.content
            }, function (data) {
                if (data == "OK") {
                    $scope.mostrarDirectorios($scope.carpetaActual.urlActual);
                    rs.cargarPopup('');
                    rs.agregarAlerta('Archivo Creado: ' + newFile.title);
                } else {
                    rs.agregarAlerta('Error Al Crear Archivo');
                }
            }, function (res) {
                rs.agregarAlerta('Error Al Crear Archivo');
                log(res);
            });
        } else {
            rs.agregarAlerta('Nombre Inválido');
        }
    }
    $scope.guardar = function (e) {
        var key = e.keyCode ? e.keyCode : e.which;
        if (e.ctrlKey && key == 83) { //Ctrl + S
            e.preventDefault();
            return true;
        }
        return false;
    }
    s.parseInt = function (n) {
        return parseInt(n);
    }

    $scope.delDir = function (dirName) {
        if (validarNombre(newFile.title)) {
            $rootScope.solicitudPost("/delDir", {
                dirPath: $scope.carpetaActual.urlActual + '/' + dirPath,
                contenido: newFile.content
            }, function (data) {
                if (data == "OK") {
                    $scope.mostrarDirectorios($scope.carpetaActual.urlActual);
                    rs.cargarPopup('');
                    rs.agregarAlerta('Archivo Creado: ' + newFile.title);
                } else {
                    rs.agregarAlerta('Error Al Crear Archivo');
                }
            }, function (res) {
                rs.agregarAlerta('Error Al Crear Archivo');
                log(res);
            });
        } else {
            rs.agregarAlerta('Nombre Inválido');
        }
    }

    function getFolderURL(fileURL) {
        return fileURL.substr(0, fileURL.lastIndexOf('/'))
    }

    s.openSubOptions = function (a, e) {
        if (rs.openedOptions) { //habían subOption abiertas y se cierran primero
            s.carpetaActual.nombresArchivosAMostrar.forEach((file) => {
                file.subOption = false;
            })
            s.carpetaActual.nombresFoldersAMostrar.forEach((folder) => {
                folder.subOption = false;
            })
        }
        rs.openedOptions = false; // Se setea en falso para que no se cierre en la funcion asd del rootScope (funcion que se ejecuta después)
        a.subOption = true // Se activa la subOptions del archivo
        if (e) { // solo en carpetas se pasa este parametro
            e.stopPropagation(); // se evita que se abra la carpeta
            rs.asd(); // se llama la funcion asd del RootScope
        }
    }

    $scope.preRenameFolder = function (f, e) {
        s.renamingFile = f;
        rs.cargarPopup('renombrar');
        focus('newFileName');
        s.renameF = s.renameFolder;
        f.subOption = false;
        e.stopPropagation();
    }
    $scope.renameFolder = function (a, newName) {
        if (validarNombre(newName)) {
            $rootScope.solicitudPost("/renameDir", {
                rutaCarpeta: $scope.carpetaActual.urlActual + '/' + a.nombre,
                nuevoNombre: $scope.carpetaActual.urlActual + '/' + newName
            }, function (data) {
                if (data == "OK") {
                    a.nombre = newName;
                    $scope.mostrarDirectorios($scope.carpetaActual.urlActual);
                    rs.cargarPopup('');
                    rs.agregarAlerta('Carpeta Actualizada: ' + a.nombre);
                } else {
                    rs.agregarAlerta('Error Al Actualizar Carpeta');
                }
            }, function (res) {
                rs.agregarAlerta('Error Al Actualizar Carpeta');
                log(res);
            });
        } else {
            rs.agregarAlerta('Nombre Inválido');
        }
    }
    $scope.preBorrarCarpeta = function (c, e) {
        s.confirm = {};
        s.confirm.a = c;
        s.confirm.funcionSi = s.deleteFolder;
        c.subOption = false;
        e.stopPropagation();
        s.confirm.message = "Desea eliminar la carpeta " + c.nombre;
        rs.cargarPopup("popUpConfimar");
    }
    $scope.deleteFolder = function (c) {
        $rootScope.solicitudPost("/delDir", {
            rutaCarpeta: $scope.carpetaActual.urlActual + '/' + c.nombre
        }, function (data) {
            if (data == "OK") {
                rs.agregarAlerta('Carpeta Borrada: ' + c.nombre);
                $scope.mostrarDirectorios($scope.carpetaActual.urlActual);
                rs.cargarPopup('');
            } else {
                rs.agregarAlerta('Error Al Borrar Carpeta');
            }
        }, function (res) {
            rs.agregarAlerta('Error Al Borrar Carpeta');
            log(res);
        });
    }

    s.log = function (e, o) {
        log(o);
    }
    /**/
    $scope.$on("$destroy", function () {
        $rootScope.controllerDestruido();
    });


    s.traverseFileTree = function (item, path) {
        path = path || "";
        if (item.isFile) {
            // Get file
            item.file(function (file) {
                //                console.log("File:", path + file.name);
            });
        } else if (item.isDirectory) {
            // Get folder contents
            var dirReader = item.createReader();
            dirReader.readEntries(function (entries) {
                for (var i = 0; i < entries.length; i++) {
                    //                    log(i + ' - ' + path + item.name);
                    s.traverseFileTree(entries[i], path + item.name + "/");
                }
            });
        }
    }

    s.subirCarpeta = function () {
        var carpetas = []
        var cantArch = s.folder.length;
        s.archivosEnCola += cantArch;
        for (let i = 0; i < cantArch; i++) {
            var c = $scope.carpetaActual.urlActual + '/' + getFolderURL(s.folder[i].webkitRelativePath)
            if (carpetas.indexOf(c) < 0) {
                carpetas.push(c)
            }
        };
        //        log(carpetas);
        $rootScope.solicitudPost("/makeMultDirs", {
            dirs: carpetas
        }, function (data) {
            if (data == "OK") {
                var multiple = cantArch > 1 ? true : false;
                for (let i = 0; i < cantArch; i++) {
                    var a = $scope.carpetaActual.urlActual + '/' + getFolderURL(s.folder[i].webkitRelativePath); //filePath
                    s.upload(s.folder[i], multiple, a);
                }
            } else if (data == "DUPL") {
                rs.agregarAlerta('Carpeta ya existe');
            } else {
                rs.agregarAlerta('Error al crear carpeta');

            }
        }, function (res) {
            s.errorCounter++;
            rs.agregarAlerta('Error Al Crear Carpetas');
            log(res);
        });
    }

    s.getCarpetas = function (items, f) {
        var carpetas = [];
        var archivos = [];
        var rutasArchivos = [];
        s.cont = 1;
        for (var i = 0; i < items.length; i++) {
            var item = items[i].webkitGetAsEntry();
            s.getCarpetasAux(item, carpetas, archivos, rutasArchivos, '', f);
        }
    }
    s.getCarpetasAux = function (item, carpetas, archivos, rutasArchivos, path, f) {
        path = path || "";
        if (item.isDirectory) {
            // Get folder contents
            var dirReader = item.createReader();
            dirReader.readEntries(function (entries) {
                s.cont += entries.length;
                for (var i = 0; i < entries.length; i++) {
                    var folderName = $scope.carpetaActual.urlActual + '/' + path + item.name;
                    if (carpetas.indexOf(folderName) == -1) {
                        carpetas.push(folderName);
                    }
                    s.getCarpetasAux(entries[i], carpetas, archivos, rutasArchivos, path + item.name + "/", f);
                }
                s.cont--;
                if (s.cont == 0) {
                    f(carpetas, archivos, rutasArchivos);
                }
            });
        } else if (item.isFile) {
            item.file(function (file) {
                rutasArchivos.push($scope.carpetaActual.urlActual + '/' + path);
                archivos.push(file);
                s.cont--;
                if (s.cont == 0) {
                    f(carpetas, archivos, rutasArchivos);
                }
            });
        }
    }

    s.subirCarpetaDragAndDrop = function (items) {
        s.getCarpetas(items, (carpetas, archivos, rutasArchivos) => {
            $rootScope.solicitudPost("/makeMultDirs", {
                dirs: carpetas
            }, function (data) {
                if (data == "OK") {
                    var cantArch = archivos.length;
                    s.archivosEnCola += cantArch;
                    var multiple = cantArch > 1 ? true : false;
                    for (let i = 0; i < cantArch; i++) {
                        var ruta = rutasArchivos[i];
                        s.upload(archivos[i], multiple, ruta);
                    }
                } else if (data == "DUPL") {
                    rs.agregarAlerta('Carpeta ya existe');
                } else {
                    rs.agregarAlerta('Error al crear carpeta');

                }
            }, function (res) {
                s.errorCounter++;
                rs.agregarAlerta('Error Al Crear Carpetas');
                log(res);
            });
        });
    }

    $scope.preGetYT = function () {
        s.nombreCarpeta = ""
        rs.cargarPopup('bajarUrl');
        rs.mode = 'mp3';
        focus('idURL');
    }

    $scope.preGetListYT = function () {
        s.nombreCarpeta = ""
        rs.cargarPopup('bajarUrl');
        rs.mode = 'list';
        focus('idURL');
    }

    s.getAudioStream = function (url) {
        if (typeof (url) == 'object') {
            var videoName = url['data-title'];
//            rs.agregarAlerta('Descargando ' + videoName);
            url = 'https://www.youtube.com/watch?v=' + url['data-video-id'];
        }
        rs.cargarPopup('');
        rs.progreso = 0;
        rs.classProgress = 'p0';
//        rs.progressing = true;
        rs.solicitudPost("/getAudioStream", {
            url: url,
            folderPath: s.carpetaActual.urlActual + '/',
            videoName: videoName ? videoName : undefined
        }, function (data) {
            rs.progressing = false;
            if (data.estado == 'OK') {
                $scope.mostrarDirectorios($scope.carpetaActual.urlActual);
                rs.agregarAlerta('Descarga Completa: ' + data.data.videoTitle);
            } else {
                if (videoName != undefined) {
                    rs.agregarAlerta('Error al descargar: ' + videoName + ', comprueba permisos del video');
                } else {
                    rs.agregarAlerta('Error al procesar URL del video');
                }
            }
            var newURL = rs.listaEsperaPlayList.shift();
            if (newURL != undefined) {
                s.getAudioStream(newURL);
            }
        }, function (res) {
            rs.agregarAlerta('Error Al Stream del video');
            log(res);
        });
    }
    rs.listaEsperaPlayList = [];
    s.getPlayList = function (url) {
        rs.cargarPopup('');
        //        log(url);
        rs.solicitudPost("/getPlayList", {
            url: url,
            path: $scope.carpetaActual.urlActual
        }, function (data) {
            if (data.estado == 'OK') {
                //                log(data.data)
                rs.listaEsperaPlayList = data.data;
                var newURL = rs.listaEsperaPlayList.shift();
                if (newURL != undefined) {
                    s.getAudioStream(newURL);
                }
            } else {
                rs.agregarAlerta('Error al procesar URL');
            }
        }, function (res) {
            rs.agregarAlerta('Error Al Bajar PlayList');
            log(res);
        });
    }
    var socket = io();
    socket.on('progressing', function (data) {
//        rs.classProgress = data.progreso > 50 ? 'p' + data.progreso + ' over50' : 'p' + data.progreso;
//        rs.progressing = true;
//        rs.progreso = data.progreso;
        rs.pushBar({
            texto: 'Descargando: ' + data.videoName,
            progress: data.progreso,
            total: 100,
            percentage: data.progreso
        })
    });

    s.convertToMp4 = function (url) {
        rs.solicitudPost("/convertToMp4", {
            videoPath: ($scope.carpetaActual.urlActual + '/' + url.nombre).substring(2),
            videoName: url.nombre
        }, function (data) {
            if (data == 'OK') {
                $scope.mostrarDirectorios($scope.carpetaActual.urlActual);
                rs.agregarAlerta('Conversion Completa Completa');
            } else {
                rs.agregarAlerta('Error al procesar Archivo');
            }
        }, function (res) {
            rs.agregarAlerta('Error al procesar Archivo');
            log(res);
        });
    }
    socket.on('converting', function (data) {
        log(data);
    });

});
app.directive('myDir', function () {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, element, attrs) {

            function dragOverHandler(ev) {
                ev.preventDefault();
                element.addClass('dragHereOn');
            }

            function dropHandler(ev) {
                //                console.log('File(s) dropped');
                ev.preventDefault();
                if (ev.dataTransfer.items) {
                    var items = event.dataTransfer.items;
                    s.subirCarpetaDragAndDrop(items);
                }
                s.dragZone = false;
            }

            function dragLeaveHandler(ev) {
                ev.preventDefault();
                //                log('myDir - LEAVE')
                element.removeClass('dragHereOn');
            }

            element.on('dragover', dragOverHandler);
            element.on('drop', dropHandler);
            element.on('dragleave', dragLeaveHandler);
        }
    };
});

app.directive('lauchDragZone', function () {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, element, attrs) {
            function dragOverHandler(ev) {
                ev.preventDefault();
                s.dragZone = true;
            }
            element.on('dragover', dragOverHandler);
        }
    };
});

app.directive('dragLayer', function () {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, element, attrs) {
            function dragLeaveHandler(ev) {
                ev.preventDefault();
                s.dragZone = false;
            }
            element.on('dragleave', dragLeaveHandler);
        }
    };
});
