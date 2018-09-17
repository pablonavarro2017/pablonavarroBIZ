/* CONTROLADOR PRINCIPAL */
var app = angular.module('app', ['ngFileUpload', 'ui.router', 'ngSanitize','com.2fdevs.videogular']);
app.controller("mainController", function (Upload, $sce,$window, $scope, $http, $filter, $rootScope, $interval, $location) {
    //app.controller("mainController", function (Upload, $window, $scope, $rootScope, $location, $http, $filter, $interval) {
    var rs = $rootScope;
    var s = $scope;

    rs.requestCount = 0;
    rs.solicitudPost = function (url, data, fnExito, fnError, header) {
        rs.requestCount++;
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
            responseType: header != undefined ? 'blob' : '',
        }
        $http.post('/api' + url, data, config).then(function (response) {
            fnExito(response.data, response);
        }, function (data) {
            fnError(data);
        }).finally(function () {
            rs.requestCount--;
            //            log('Requests Pendientes: ' + $scope.requestCount);
        });
    }
    // Sistema de alertas personalizados
    rs.listaAlerts = [];
    rs.ocultarAlerta = function (alerta) {
        alerta.classAlert = "ocultarAlert";
    }



    rs.requestCount = 0;
    rs.mostrarPopupPreguntar = false;
    /* Para mostrar una alerta en la parte inferior en todas las páginas */
    //*********************************************
    // Sistema de alertas personalizados
    rs.listaAlerts = [];
    rs.ocultarAlerta = function (alerta) {
        alerta.classAlert = "ocultarAlert";
    }
    rs.agregarAlerta = function (texto) {
        var alerta = {
            texto: texto
        };
        alerta.eliminarAlerta = function () {
            rs.listaAlerts.splice(rs.listaAlerts.indexOf(alerta), 1);
        }
        alerta.ocultarAlerta = function () {
            alerta.classAlert = "ocultarAlert";
            setTimeout(alerta.eliminarAlerta, 1500);
        }
        setTimeout(alerta.ocultarAlerta, 10000);
        rs.listaAlerts.push(alerta);
    };
    /* ↓↓ Pop Up para preguntar si o no ↓↓*/
    rs.preguntar = function (pregunta, funcionCasoSi, funcionCasoNo) {
        rs.panPreg = {};
        rs.panPreg.panPregMsj = pregunta;
        rs.panPreg.panPregFuncSi = function () {
            rs.mostrarPopupPreguntar = false;
            if (funcionCasoSi) {
                funcionCasoSi();
            };
        }
        rs.panPreg.panPregFuncNo = function () {
            rs.mostrarPopupPreguntar = false;
            if (funcionCasoNo) {
                funcionCasoNo();
            };
        }
        rs.panPreg.cerrar = function () {
            rs.mostrarPopupPreguntar = false;
            rs.panPreg.panPregFuncNo();
        }
        rs.mostrarPopupPreguntar = true;
    };
    /* ↑↑ Pop Up para preguntar si o no ↑↑*/
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

    /* Popup Scope */
    rs.ps = s;
    // include de un archivo hmtl de la carpeta inc
    rs.cargarPopup = function (nombreArchivo) {
        if (nombreArchivo != "") {
            s.popupUrl = "pop/" + nombreArchivo + ".html";
        } else {
            s.popupUrl = "";
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
    if (isBlog()){
        $location.path("blog");
    }
    document.getElementById('body').style.display='flex';
    document.getElementById('navid').style.display='flex';
});
