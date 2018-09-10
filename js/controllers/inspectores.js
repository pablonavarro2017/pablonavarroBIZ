app.controller("inspectoresController", function (Upload, $window, $scope, $rootScope) {
    if ($rootScope.verificarPermisos("inspectoresController")) {
        var rs = $rootScope;
        var s = $scope;
        /* Popup Scope */
        rs.ps = s;
        rs.nombrePanelActual = "Inspectores";

        s.listaInspectores = [];

        /* ------------------------------------------------------- */

        /* Cargar inspectores */

        s.cargarInspectores = function () {
            var objPOST = {
                api: "getInspectores",
                updateSesion: true,
                fd: rs.getFormDataObj([]),
                casoSoloOK: "Ha ocurrido un error al cargar los datos de inspectores, intente de nuevo",
                casoOKconLista: function (listaDatos) {
                    s.listaInspectores = listaDatos;
                },
                casoFallo: function (data) {
                    if (data.error_code) {
                        rs.agregarAlerta("Ha ocurrido un error al cargar los datos de inspectores, código de error: " + data.error_code);
                    } else {
                        rs.agregarAlerta("Ha ocurrido un error al cargar los datos de inspectores, intente de nuevo");
                    }
                },
                forzarDebug: false,
                casoCatch: null
            }
            rs.solicitudPostTokenizada(objPOST);
        }
        s.cargarInspectores();

        /* ------------------------------------------------------- */

        /* Crear inspector */

        function crearInspector(configForm) {
            var objPOST = {
                api: "agregarInspector",
                fd: rs.getFormDataObj(configForm.fields),
                casoSoloOK: function () {
                    rs.agregarAlerta("Se ha agregado el inspector");
                    rs.cargarPopup('');
                    s.cargarInspectores();
                },
                casoOKconLista: "Ha ocurrido un error, intente de nuevo",
                casoFallo: "Ha ocurrido un error, intente de nuevo",
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

        s.preCrearInspector = function () {
            s.formCrearInspector = {
                titleForm: "Agregar Inspector",
                buttonSubmitName: "Agregar",
                buttonsDisabled: false,
                closeButton: function () {
                    rs.cargarPopup('');
                },
                functionSubmit: function () {
                    crearInspector(this)
                },
                fields: [{
                    fieldName: "Nombre del inspector",
                    varName: "nombre",
                    varValue: "",
                    required: true
                }, {
                    fieldName: "Cedula",
                    required: true,
                    varName: "cedula",
                    varValue: ""
                }],
                extraParams: {}
            };
            rs.cargarPopup("crearInspector");
        }

        /* Modificar inspector */

        function modificarInspector(configForm) {
            var objPOST = {
                api: "modificarInspector",
                fd: rs.getFDFromConfigForm(configForm),
                casoSoloOK: function () {
                    rs.agregarAlerta("La modificación se ha realizado correctamente");
                    rs.cargarPopup('');
                    s.cargarInspectores();
                },
                casoOKconLista: "Ha ocurrido un error, intente de nuevo",
                casoFallo: "Ha ocurrido un error, intente de nuevo",
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

        s.preModificarInspector = function (objInspector) {
            s.formModificarInspector = {
                titleForm: "Modificar Inspector",
                buttonSubmitName: "Modificar",
                buttonsDisabled: false,
                closeButton: function () {
                    rs.cargarPopup('');
                },
                functionSubmit: function () {
                    modificarInspector(this)
                },
                fields: [{
                    fieldName: "Nombre",
                    varName: "nombre",
                    varValue: objInspector.nombre,
                    required: true
                }, {
                    fieldName: "Cedula",
                    required: true,
                    varName: "cedula",
                    varValue: objInspector.cedula
                }],
                extraParams: {
                    idInspector: objInspector.idInspector
                }
            };
            rs.cargarPopup("modificarInspector");
        }

        /* ------------------------------------------------------- */

        /* Eliminar inspector */

        s.eliminarInspector = function (objInspector) {
            rs.preguntar("Se eliminará el inspector " + objInspector.nombre + ", ¿desea continuar?",
                function () {
                    var objPOST = {
                        api: "eliminarInspector",
                        fd: rs.getFDFromObj({
                            idInspector: objInspector.idInspector
                        }),
                        casoSoloOK: function () {
                            s.cargarInspectores();
                        },
                        casoOKconLista: "Ha ocurrido un error, intente de nuevo",
                        casoFallo: "Ha ocurrido un error, intente de nuevo",
                    }
                    rs.solicitudPostTokenizada(objPOST);
                });
        };

        /* ------------------------------------------------------- */

        /* Eliminar inspector */

        s.resetPassInspector = function (objInspector) {
            rs.preguntar("Se va a reestablecer la contraseña para el inspector " + objInspector.nombre + ", ¿desea continuar?",
                function () {
                    var objPOST = {
                        api: "resetPassInspector",
                        fd: rs.getFDFromObj({
                            idInspector: objInspector.idInspector
                        }),
                        casoSoloOK: "Se ha reestablecido la contraseña para el inspector " + objInspector.nombre + ", nombre de usuario " + objInspector.username,
                        casoOKconLista: "Ha ocurrido un error, intente de nuevo",
                        casoFallo: function(data){
                            rs.agregarAlerta("Ha ocurrido un error." + (data.error_code != null ? " ERROR: " + data.error_code : ""));
                        },
                    }
                    rs.solicitudPostTokenizada(objPOST);
                });
        };

        /* ------------------------------------------------------- */

    }

    $scope.$on("$destroy", function () {
        $rootScope.controllerDestruido();
    });
});
