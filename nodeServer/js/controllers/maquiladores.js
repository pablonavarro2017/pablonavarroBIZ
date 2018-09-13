app.controller("maquiladoresController", function (Upload, $window, $scope, $rootScope, $location, $http, $cookies, $interval, $filter) {
    if ($rootScope.verificarPermisos("maquiladoresController")) {
         var rs = $rootScope;
        var s = $scope;
        /* Popup Scope */
        rs.ps = s;
        rs.nombrePanelActual = "Maquiladores";

        s.listaMaquiladores = [];

        /* ------------------------------------------------------- */

        /* Cargar maquiladores */

        s.cargarMaquiladores = function () {
            var objPOST = {
                api: "getMaquiladores",
                updateSesion: true,
                fd: rs.getFormDataObj([]),
                casoSoloOK: "Ha ocurrido un error al cargar los datos de maquiladores, intente de nuevo",
                casoOKconLista: function (listaDatos) {
                    s.listaMaquiladores = listaDatos;
                },
                casoFallo: function (data) {
                    if (data.error_code) {
                        rs.agregarAlerta("Ha ocurrido un error al cargar los datos de maquiladores, código de error: " + data.error_code);
                    } else {
                        rs.agregarAlerta("Ha ocurrido un error al cargar los datos de maquiladores, intente de nuevo");
                    }
                },
                forzarDebug: false,
                casoCatch: null
            }
            rs.solicitudPostTokenizada(objPOST);
        }
        s.cargarMaquiladores();

        /* ------------------------------------------------------- */

        /* Crear inspector */

        function crearMaquilador(configForm) {
            var objPOST = {
                api: "agregarMaquilador",
                fd: rs.getFormDataObj(configForm.fields),
                casoSoloOK: function () {
                    rs.agregarAlerta("Se ha agregado el maquilador");
                    rs.cargarPopup('');
                    s.cargarMaquiladores();
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

        s.preCrearMaquilador = function () {
            s.formCrearMaquilador = {
                titleForm: "Agregar Maquilador",
                buttonSubmitName: "Agregar",
                buttonsDisabled: false,
                closeButton: function () {
                    rs.cargarPopup('');
                },
                functionSubmit: function () {
                    crearMaquilador(this)
                },
                fields: [{
                    fieldName: "Nombre del maquilador",
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
            rs.cargarPopup("crearMaquilador");
        }

        /* Modificar inspector */

        function modificarMaquilador(configForm) {
            var objPOST = {
                api: "modificarMaquilador",
                fd: rs.getFDFromConfigForm(configForm),
                casoSoloOK: function () {
                    rs.agregarAlerta("La modificación se ha realizado correctamente");
                    rs.cargarPopup('');
                    s.cargarMaquiladores();
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

        s.preModificarMaquilador = function (objMaquilador) {
            s.formModificarMaquilador = {
                titleForm: "Modificar Maquilador",
                buttonSubmitName: "Modificar",
                buttonsDisabled: false,
                closeButton: function () {
                    rs.cargarPopup('');
                },
                functionSubmit: function () {
                    modificarMaquilador(this)
                },
                fields: [{
                    fieldName: "Nombre",
                    varName: "nombre",
                    varValue: objMaquilador.nombre,
                    required: true
                }, {
                    fieldName: "Cedula",
                    required: true,
                    varName: "cedula",
                    varValue: objMaquilador.cedula
                }],
                extraParams: {
                    idMaquilador: objMaquilador.idMaquilador
                }
            };
            rs.cargarPopup("modificarMaquilador");
        }

        /* ------------------------------------------------------- */

        /* Eliminar inspector */

        s.eliminarMaquilador = function (objMaquilador) {
            rs.preguntar("Se eliminará el maquilador " + objMaquilador.nombre + ", ¿desea continuar?",
                function () {
                    var objPOST = {
                        api: "eliminarMaquilador",
                        fd: rs.getFDFromObj({
                            idMaquilador: objMaquilador.idMaquilador
                        }),
                        casoSoloOK: function () {
                            s.cargarMaquiladores();
                        },
                        casoOKconLista: "Ha ocurrido un error, intente de nuevo",
                        casoFallo: "Ha ocurrido un error, intente de nuevo",
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
