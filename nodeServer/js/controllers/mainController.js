/* CONTROLADOR PRINCIPAL */
var app = angular.module('app', ['ngFileUpload', 'ui.router', 'ngSanitize', 'com.2fdevs.videogular']);
app.controller("mainController", function (Upload, $sce, $window, $scope, $http, $filter, $rootScope, $interval, $location, $templateCache) {
    //app.controller("mainController", function (Upload, $window, $scope, $rootScope, $location, $http, $filter, $interval) {
    var rs = $rootScope;
    var s = $scope;

    rs.requestCount = 0;
    rs.solicitudPost = function (url, data, fnExito, fnError, header) {
        rs.requestCount++;

        var esBlob = header != undefined ? true : false;
        if (esBlob == true) {
            var size = data.size;
            var fileName = data.fileName;
            data.size = undefined;
            data.fileName = undefined;
        }

        var form_data = new FormData();
        if (data && !header) {
            for (var key in data) {
                form_data.append(key, data[key]);
            }
        }

        var config = {
            responseType: header != undefined ? 'blob' : '',
            eventHandlers: {
                progress: function (event) { //Cada chunk en la transferencia de datos
                    if (esBlob == true) {
                        rs.pushBar({
                            texto: 'Descargando: ' + fileName,
                            progress: event.loaded,
                            total: size,
                            percentage: parseInt(event.loaded / size * 100)
                        })
                    }
                },
                load: function (ev) { //Fin de la transferencia de datos
                    if (esBlob == true) {
                        rs.pushBar({
                            texto: 'Descargando: ' + fileName,
                            progress: size,
                            total: size,
                            percentage: 100
                        });
                    }
                }
                /*load: function (ev) {}, readystatechange: function (ev) {}*/
            },
            headers: {
                'Content-Type': 'application/json',
                //                'Content-Type': header ? header : 'text/plain',
            }

        }
        $http.post('/api' + url, data, config).then(function (response) {
            fnExito(response.data, response);
        }, function (data) {
            log(data);
            fnError(data);
        }).finally(function () {
            rs.requestCount--;
            rs.progressing = false;
            //            log('Requests Pendientes: ' + $scope.requestCount);
        });
    }
    rs.requestCount = 0;

    // Sistema de alertas personalizados
    /* Para mostrar una alerta en la parte inferior en todas las páginas */
    //*********************************************
    // Sistema de alertas personalizados
    rs.listaAlerts = [];
    rs.bars = [];
    rs.ocultarAlerta = function (alerta) {
        alerta.classAlert = "ocultarAlert";
    }
    rs.agregarAlerta = function (texto, bar) {
        var alerta = {
            texto: texto,
        };
        alerta.ocultarAlerta = function () {
            alerta.classAlert = "ocultarAlert";
            setTimeout(alerta.eliminarAlerta, 1500);
        }
        if (typeof (bar) == 'object') { //Progress Bar
            if (bar.source) {
                alerta.source = bar.source;
            }
            alerta.percentage = bar.percentage;
            alerta.progress = bar.progress;
            alerta.total = bar.total;
            alerta.eliminarAlerta = function () {
                rs.bars.splice(rs.bars.indexOf(alerta), 1);
            }
            rs.bars.push(alerta);
        } else { //alertas comunes
            alerta.eliminarAlerta = function () {
                rs.listaAlerts.splice(rs.listaAlerts.indexOf(alerta), 1);
            }
            rs.listaAlerts.push(alerta);
            setTimeout(alerta.ocultarAlerta, 5000);
        }
        return alerta;
    };

    rs.pushBar = function (bar) {
        var found = false
        for (var i = 0; i < rs.bars.length; i++) {
            var b = rs.bars[i];
            if (b.texto == bar.texto) {
                if (bar.source) {
                    b.source = bar.source;
                }
                b.progress = bar.progress;
                b.total = bar.total;
                b.percentage = bar.percentage;
                found = true;
                if (b.percentage == "100") {
                    setTimeout(b.ocultarAlerta, 1200);
                }
            }
        }
        if (found == false) {
            rs.agregarAlerta(bar.texto, bar);
        }
    }

    // ----------------------------------------
    s.fullScreen = function () {
        var elem = document.body; // Make the body go full screen.
        var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) || (document.mozFullScreen || document.webkitIsFullScreen);
        if (isInFullScreen) {
            cancelFullScreen(document);
        } else {
            requestFullScreen(elem);
        }
        return false;
    }

    // include de un archivo hmtl de la carpeta inc
    rs.cargarPopup = function (nombreArchivo) {
        if (nombreArchivo != "") {
            rs.popupUrl = "pop/" + nombreArchivo + ".html";
        } else {
            rs.popupUrl = "";
        }
    };

    // para mostrar el nombre del panel actual
    rs.nombrePanelActual = "";

    // PARA CONTROLAR LA SESION

    // **** Datos de la sesión ****
    rs.infoSesion = {
        idUsuario: 0,
        nombre: "",
        username: "",
        tipoUsuario: 0
    }

    rs.sesionIniciada = false; /* OJO */
    rs.sesionIniciada = true; /* OJO */

    var controllers = [
        "defectosController",
        "inicioController",
        "inspectoresController",
        "articulosController",
        "reportesController",
        "revisionCalidadController",
        "maquiladoresController"
    ]
    // 1 admin, 2 inspector, 3 maquilador
    permisosXTipoUsuario = {
        1: {
            "revisionCalidadController": false,
            "defectosController": true,
            "inspectoresController": true,
            "articulosController": true,
            "reportesController": true,
            "maquiladoresController": true
        },
        2: {
            "revisionCalidadController": true,
            "defectosController": false,
            "inspectoresController": false,
            "articulosController": false,
            "reportesController": false,
            "maquiladoresController": false
        }
    }

    rs.verificarSesion = function () {
        /*if (rs.sesionIniciada) {
            return true;
        } else if (localStorage.sesion) {
            rs.infoSesion = JSON.parse(localStorage.sesion);
            rs.sesionIniciada = true;
            return true;
        } else {
            return false;
        }*/
        return true;
    }
    rs.verificarPermisos = function (controllerName) {
        /* verificamos si la sesión está activa */
        if (rs.verificarSesion()) {
            /* verificamos si tiene los permisos */
            /*if (permisosXTipoUsuario[rs.infoSesion.tipoUsuario][controllerName]) {
                return true;
            } else {
                /* tiene sesión activa pero no tiene permisos para
                ingresar a la funcionalidad que está solicitando,
                se redirecciona a la página principal
                $location.path("");
                return false;
            }*/
            return true;
        } else {
            // no tiene sesion activa, se redirecciona a login
            $location.path("login");
            return false;
        }
        $location.path("login");
        return false;
    }
    rs.abrirSesion = function (loginInfo) {
        /*rs.infoSesion = loginInfo;
        localStorage.setItem("sesion", JSON.stringify(rs.infoSesion));
        localStorage.setItem("requestTokenDate", new Date());
        localStorage.setItem("sesionTokenDate", new Date());*/
        rs.sesionIniciada = true;
    }
    rs.cerrarSesion = function () {
        //        rs.infoSesion = {
        //            idUsuario: 0,
        //            nombre: "",
        //            username: "",
        //            tipoUsuario: 0
        //        }
        //        localStorage.removeItem("sesion");
        //        localStorage.removeItem("requestTokenDate");
        //        localStorage.removeItem("sesionTokenDate");
        rs.sesionIniciada = false;
        $location.path("login");
    };

    /* Funcion generica para solicitudes http */
    var hostAPI = "/sandbox/pablobiz/api/";
    rs.getFDFromConfigForm = function (configForm) {
        var fd = new FormData();
        configForm.fields.forEach(function (o) {
            fd.append(o.varName, o.varValue);
        });
        for (e in configForm.extraParams) {
            fd.append(e, configForm.extraParams[e]);
        }
        return fd;
    }

    rs.getFDFromObj = function (obj) {
        var fd = new FormData();
        for (e in obj) {
            if (obj[e] == '' || obj[e] == null) {
                log(typeof (obj[e]));
                if (typeof (obj[e]) != 'number') {
                    fd = null;
                    return fd;
                }
            }
            fd.append(e, obj[e]);
        }
        return fd;
    }

    rs.getFDFromObjOnNulls = function (obj) {
        var fd = new FormData();
        for (e in obj) {
            if (obj[e] != null) {
                fd.append(e, obj[e]);
            }
        }
        return fd;
    }

    // setea la variable fechaHora
    function actualizarFechaHora() {
        rs.fechaHora = $filter('date')(new Date(), "dd/MM/yyyy hh:mm:ss a", "-0600");
    }
    $interval(actualizarFechaHora, 1000);

    //--------------------------------------------

    rs.controllerDestruido = function () {
        s.cargarPopup("");
    };

    s.cargarPopup("");

    /* cambiar contraseña */
    function cambiarPass(configForm) {
        var objPOST = {
            api: "cambiarPass",
            fd: rs.getFDFromConfigForm(configForm),
            casoSoloOK: function () {
                rs.agregarAlerta("Los datos se han actualizado correctamente");
                rs.cargarPopup('');
                rs.infoSesion.username = configForm.fields[0].varValue;
            },
            casoOKconLista: "Ha ocurrido un error, intente de nuevo",
            casoFallo: function (data) {
                rs.agregarAlerta("ERROR: " + data.error_code);
            },
            forzarDebug: false,
            casoCatch: null,
            fnInicioSolicitud: function () {
                configForm.buttonsDisabled = true;
            },
            fnFinSolicitud: function () {
                configForm.buttonsDisabled = false;
            }
        }
        rs.solicitudPostTokenizada(objPOST);
    };

    s.preCambiarPass = function () {
        s.formCambiarPass = {
            titleForm: "Cambiar Contraseña",
            buttonSubmitName: "Cambiar",
            buttonsDisabled: false,
            closeButton: function () {
                rs.cargarPopup('');
            },
            functionSubmit: function () {
                cambiarPass(this)
            },
            fields: [{
                fieldName: "Nombre de usuario",
                varName: "newUsername",
                varValue: rs.infoSesion.username,
                required: true
                }, {
                fieldName: "Contraseña actual",
                varName: "currentPass",
                varValue: "",
                eTag: "input",
                eConfig: {
                    type: "password"
                },
                required: true
                }, {
                fieldName: "Nueva Contraseña",
                required: true,
                varName: "newPass",
                varValue: "",
                eTag: "input",
                eConfig: {
                    type: "password"
                },
                required: true
                }],
            extraParams: {
                idUser: rs.infoSesion.idUsuario
            }
        };
        rs.cargarPopup("cambiarPass");
    }

    rs.formatearFecha = function (fecha) {
        return $filter('date')(new Date(fecha), "dd/MM/yyyy hh:mm:ss a", "-0600")
    }
    //    if (isBlog()) {
    //        $location.path("blog");
    //    }
    rs.sa = {}
    rs.openedOptions = false;
    rs.asd = function () {
        if (rs.openedOptions && rs.sa.fs) { // Habían subOptions abiertas y el scope es el de archivos
            rs.sa.carpetaActual.nombresArchivosAMostrar.forEach((file) => {
                file.subOption = false; // todas las subOptions se cierran
            })
            rs.sa.carpetaActual.nombresFoldersAMostrar.forEach((folder) => {
                folder.subOption = false; // todas las subOptions se cierran
            })
        }
        rs.openedOptions = true; // Se aumenta para que el próximo click cierre las subOptions
    }

    document.getElementById('body').style.display = 'flex';
    document.getElementById('navid').style.display = 'flex';


});
