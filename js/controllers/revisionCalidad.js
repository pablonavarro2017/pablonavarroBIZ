/* Plantilla controller */
app.controller("revisionCalidadController", function (Upload, $window, $scope, $rootScope, $location, $http, $cookies, $interval, $filter) {
    if ($rootScope.verificarPermisos("revisionCalidadController")) {
        var rs = $rootScope;
        var s = $scope;
        s.formatearFloat = formatearFloat;
        $rootScope.nombrePanelActual = "Revisión de Calidad";

        /* Listas de datos necesarios para la revisión de calidad */
        s.listaMaquiladores = [];
        s.listaArticulos = [];
        s.listaDefectos = [];
        s.listaClasificacionesDefectos = [];

        s.mostrarSeleccionarDefectos = false;
        s.togglePanelAgregarDefectos = function () {
            s.mostrarSeleccionarDefectos = !s.mostrarSeleccionarDefectos;
        }

        /* Carga de datos necesarios para la revisión */
        {
            /* Cargar maquiladores */

            s.cargarMaquiladores = function () {
                var objPOST = {
                    api: "getMaquiladores",
                    updateSesion: true,
                    fd: rs.getFormDataObj([]),
                    casoSoloOK: "Ha ocurrido un error al cargar los datos de maquiladores, intente de nuevo",
                    casoOKconLista: function (listaDatos) {
                        s.listaMaquiladores = listaDatos;
                        s.frmRC.setMaquiladores(listaDatos);
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

            /* Cargar artículos */
            s.cargarArticulos = function () {
                var objPOST = {
                    api: "getArticulos",
                    updateSesion: true,
                    fd: rs.getFormDataObj([]),
                    casoSoloOK: "Ha ocurrido un error al cargar los datos de articulos, intente de nuevo",
                    casoOKconLista: function (listaDatos) {
                        s.listaArticulos = listaDatos;
                        s.frmRC.setArticulos(listaDatos);
                    },
                    casoFallo: function (data) {
                        if (data.error_code) {
                            rs.agregarAlerta("Ha ocurrido un error al cargar los datos de articulos, código de error: " + data.error_code);
                        } else {
                            rs.agregarAlerta("Ha ocurrido un error al cargar los datos de articulos, intente de nuevo");
                        }
                    },
                    forzarDebug: false,
                    casoCatch: null
                }
                rs.solicitudPostTokenizada(objPOST);
            }
            s.cargarArticulos();

            function getClasificacionDefecto(defecto) {
                for (i in s.listaClasificacionesDefectos) {
                    if (defecto.fkClasificacionDefecto == s.listaClasificacionesDefectos[i].idClasificacionDefectos) {
                        return s.listaClasificacionesDefectos[i].nombre;
                    }
                }
            }

            /* Cargar defectos */
            s.cargarDefectos = function () {
                var objPOST = {
                    api: "getDefectos",
                    updateSesion: true,
                    fd: rs.getFormDataObj([]),
                    casoSoloOK: "Ha ocurrido un error al cargar los datos de los defectos, intente de nuevo",
                    casoOKconLista: function (listaDatos) {
                        s.listaDefectos = listaDatos;
                        s.listaDefectos.forEach(function (d) {
                            d.cantArticulos = 1;
                            d.clasificacionDefecto = getClasificacionDefecto(d) + ":";
                        });
                    },
                    casoFallo: function (data) {
                        if (data.error_code) {
                            rs.agregarAlerta("Ha ocurrido un error al cargar los datos de los defectos, código de error: " + data.error_code);
                        } else {
                            rs.agregarAlerta("Ha ocurrido un error al cargar los datos de los defectos, intente de nuevo");
                        }
                    },
                    forzarDebug: false,
                    casoCatch: null
                }
                rs.solicitudPostTokenizada(objPOST);
            }

            s.cargarClasificacionesDefectos = function () {
                var objPOST = {
                    api: "getClasificacionesDefectos",
                    updateSesion: true,
                    fd: rs.getFormDataObj([]),
                    casoSoloOK: "Ha ocurrido un error al cargar las clasificaciones de defectos, intente de nuevo",
                    casoOKconLista: function (listaDatos) {
                        s.listaClasificacionesDefectos = listaDatos;
                        s.cargarDefectos();
                    },
                    casoFallo: function (data) {
                        if (data.error_code) {
                            rs.agregarAlerta("Ha ocurrido un error al cargar las clasificaciones de defectos, código de error: " + data.error_code);
                        } else {
                            rs.agregarAlerta("Ha ocurrido un error al cargar las clasificaciones de defectos, intente de nuevo");
                        }
                    },
                    forzarDebug: false,
                    casoCatch: null
                }
                rs.solicitudPostTokenizada(objPOST);
            }
            s.cargarClasificacionesDefectos();
        }

        // para almancenar la información de la revisión de calidad
        s.objRC = {};
        s.objRC.defectos = [];

        s.getCantidadDefectosRevision = function () {
            var cantidad = 0;
            s.objRC.defectos.forEach(function (d) {
                cantidad += d.cantArticulos;
            });
            return cantidad;
        }

        function limpiarFormularioRevision() {
            s.objRC = {};
            s.objRC.defectos = [];

            s.frmRC.inputCantArticulos.varValue = 1;
            s.frmRC.inputCantArticulosDefectuosos.varValue = 0;
            s.frmRC.selectArticulo.varValue = null;
            s.frmRC.selectArticulo.eConfig.selectedName = "Seleccionar artículo";
            s.frmRC.selectMaquilador.varValue = null;
            s.frmRC.selectMaquilador.eConfig.selectedName = "Seleccionar maquilador";
            s.listaDefectos.forEach(function (d) {
                d.cantArticulos = 1;
            });
        }

        s.restablecerRevision = function () {
            rs.preguntar("¿Está seguro que desea limpiar el formulario? Esto eliminará toda la información de la revisión actual",
                limpiarFormularioRevision);
        }

        /* configuración inputs para jp-inputs*/
        {
            /* configuración del formulario de revisión de calidad */
            s.frmRC = {};
            /* funciones de seteo de datos para el formulario */
            s.frmRC.setMaquiladores = function (listaMaquiladores) {
                this.selectMaquilador.eConfig.dataSet = listaMaquiladores;
            }
            s.frmRC.setArticulos = function (listaArticulos) {
                listaArticulos.forEach(function (e, i) {
                    e.nombre = e.numero;
                });
                this.selectArticulo.eConfig.dataSet = listaArticulos;
            }

            // Seleccion del maquilador
            s.frmRC.selectMaquilador = {
                fieldName: "Maquilador",
                eTag: "customSelect",
                eConfig: {
                    notaPanelSeleccion: "Por favor seleccione el maquilador",
                    dataSet: s.listaMaquiladores,
                    selectedName: "Seleccionar maquilador",
                    fnElementoSeleccionado: function (e) {
                        this.parent.varValue = e.idMaquilador;
                        this.selectedName = e.nombre;
                    }
                },
                varName: "fkMaquilador",
                varValue: null,
                required: true,
                init: function () {
                    /* para tener acceso a este nivel desde eConfig */
                    this.eConfig.parent = this;
                    delete this.init;
                    return this;
                }
            }.init();

            // Seleccion del artículo
            s.frmRC.selectArticulo = {
                fieldName: "Artículo",
                eTag: "customSelect",
                eConfig: {
                    notaPanelSeleccion: "Por favor seleccione el artículo",
                    dataSet: s.listaArticulos,
                    selectedName: "Seleccionar artículo",
                    fnElementoSeleccionado: function (e) {
                        this.parent.varValue = e.idArticulo;
                        this.selectedName = e.nombre;
                    }
                },
                varName: "fkArticulo",
                varValue: null,
                required: true,
                init: function () {
                    /* para tener acceso a este nivel desde eConfig */
                    this.eConfig.parent = this;
                    delete this.init;
                    return this;
                }
            }.init();

            // Cantida de artículos
            s.frmRC.inputCantArticulos = {
                fieldName: "Cantidad de artículos",
                eTag: "input",
                eConfig: {
                    type: "number"
                },
                varName: "cantidadArticulos",
                varValue: 1,
                required: true
            };

            // Cantida de artículos defectuosos
            s.frmRC.inputCantArticulosDefectuosos = {
                fieldName: "Cant. artículos defectuosos",
                eTag: "input",
                eConfig: {
                    type: "number"
                },
                varName: "cantidadArticulosDefectuosos",
                varValue: 0,
                required: true
            };
        }

        s.agregarDefectoRevision = function (d) {
            if (s.objRC.defectos.indexOf(d) == -1) {
                /* si no está, lo agregamos la lista de defectos de la revisión */
                s.objRC.defectos.push(d);
                rs.agregarAlerta("Se ha agregado el defecto '" + d.nombre + "'");
            } else {
                rs.agregarAlerta("El defecto '" + d.nombre + "' ya está agregado");
            }
        }
        s.quitarDefectoRevision = function (d) {
            rs.preguntar('¿Está seguro que desea remover "' + d.nombre + '" de la lista de defectos de este revisión?',
                function () {
                    s.objRC.defectos.splice(s.objRC.defectos.indexOf(d), 1);
                })
        }

        s.guardarRevision = function () {
            var fd = new FormData();
            if (!s.frmRC.inputCantArticulos.varValue || s.frmRC.inputCantArticulos.varValue <= 0) {
                rs.agregarAlerta("La cantidad de artículos debe ser al menos 1");
                return;
            }

            if (s.frmRC.inputCantArticulosDefectuosos.varValue == null || s.frmRC.inputCantArticulosDefectuosos.varValue < 0) {
                rs.agregarAlerta("La cantidad de artículos defectuosos debe ser mayor que 0");
                return;
            }

            if (s.frmRC.inputCantArticulosDefectuosos.varValue > 0 && s.objRC.defectos.length == 0) {
                rs.agregarAlerta("No se puede guardar la revisión porque ha indicado que hay artículos defectuosos pero no ha agregado ningún defecto.");
                return;
            }

            if (!s.frmRC.selectMaquilador.varValue) {
                rs.agregarAlerta("Debe seleccionar el maquilador");
                return;
            }

            if (!s.frmRC.selectArticulo.varValue) {
                rs.agregarAlerta("Debe seleccionar el artículo que está revisando");
                return;
            }

            if (s.frmRC.inputCantArticulos.varValue < s.frmRC.inputCantArticulosDefectuosos.varValue) {
                rs.agregarAlerta("La cantidad de artículos defectuosos no puede ser mayor que la cantidad total de artículos. Corrija la inconsistencia e intente guardar la revisión de nuevo.");
                return;
            }

            var totalDefectos = 0;
            s.objRC.defectos.forEach(function (d) {
                totalDefectos += d.cantArticulos;
            });

            if (s.frmRC.inputCantArticulosDefectuosos.varValue == 0 && totalDefectos > 0) {
                rs.agregarAlerta("Ha indicado que no hay ningún artículo defectuoso pero ha agregado defectos. Corrija la inconsistencia e intente guardar la revisión de nuevo.");
                return;
            }

            if (totalDefectos < s.frmRC.inputCantArticulosDefectuosos.varValue) {
                rs.agregarAlerta("Ha indicado que hay " + s.frmRC.inputCantArticulosDefectuosos.varValue + " artículos defectuosos pero solamente ha registrado, en la lista de defectos, una totalidad de " + totalDefectos + " artículos defectuosos.");
                return;
            }

            function guardarInspeccion() {
                fd.append("cantidadArticulos", s.frmRC.inputCantArticulos.varValue);
                fd.append("cantidadArticulosDefectuosos", s.frmRC.inputCantArticulosDefectuosos.varValue);
                fd.append("idMaquilador", s.frmRC.selectMaquilador.varValue);
                fd.append("idArticulo", s.frmRC.selectArticulo.varValue);
                fd.append("idInspector", rs.infoSesion.idUsuario);

                var objListaDefectos = [];
                s.objRC.defectos.forEach(function (d) {
                    objListaDefectos.push({
                        idDefecto: d.idDefecto,
                        cantArticulos: d.cantArticulos
                    });
                });

                fd.append("listaDefectos", JSON.stringify(objListaDefectos));

                var objPOST = {
                    api: "agregarInspeccion",
                    updateSesion: true,
                    fd: fd,
                    casoSoloOK: function () {
                        limpiarFormularioRevision();
                        rs.agregarAlerta("Se ha guardado correctamente la revisión");
                    },
                    casoOKconLista: "",
                    casoFallo: function (data) {
                        if (data.error_code) {
                            rs.agregarAlerta("Ha ocurrido un error al guardar la revisión. Verifique que los datos de todos los campos sean correctos, código de error: " + data.error_code);
                        } else {
                            rs.agregarAlerta("Ha ocurrido un error al guardar la revisión, intente de nuevo");
                        }
                    }
                }
                rs.solicitudPostTokenizada(objPOST);
            }

            if (s.frmRC.inputCantArticulosDefectuosos.varValue == 0) {
                rs.preguntar("Ha indicado que no hay ningún artículo defectuoso. ¿Desea Continuar?", guardarInspeccion);
            } else {
                guardarInspeccion();
            }
        }
    }

    $scope.$on("$destroy", function () {
        $rootScope.controllerDestruido();
    });
});
