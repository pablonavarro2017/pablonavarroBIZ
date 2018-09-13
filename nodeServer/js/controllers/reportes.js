/* Plantilla controller */
app.controller("reportesController", function (Upload, $window, $scope, $rootScope, $location, $http, $cookies, $interval, $filter) {
    if ($rootScope.verificarPermisos("reportesController")) {
        var rs = $rootScope;
        var s = $scope;
        rs.ps = s;
        $rootScope.nombrePanelActual = "Reportes";
        s.formatearFloat = formatearFloat;
        $scope.filteredValues = function () {
            return $scope.values_array.filter(function (val) {
                return $scope.skip_array.indexOf(val) === -1;
            });
        };
        /* Listas de datos necesarios para la revisión de calidad */

        //listas de datos Estáticos
        {
            s.tiposReporte = [
                {
                    nombre: 'Revisiones Efectuadas',
                    url: "inc/rep_Revisiones.html"
                },
                {
                    nombre: 'Reporte de Defectos',
                    url: "inc/rep_Defectos.html"
                },
                {
                    nombre: 'Reporte de Artículos',
                    url: "inc/rep_Articulos.html"
                }, {
                    nombre: 'Reporte de Maquiladores',
                    url: "inc/rep_Maquiladores.html"
                }, {
                    nombre: 'Reporte de Familias',
                    url: "inc/rep_Familias.html"
                },
                {
                    nombre: 'Reporte Clasificación',
                    url: "inc/rep_Clasificacion.html"
                },
                {
                    nombre: 'Reporte General',
                    url: "inc/rep_General.html"
                }
            ];

            s.tipoReporte = '';
            s.listaMaquiladores = [];
            s.listaDefectos = [];
            s.listaArticulos = [];
            s.listaFamilias = [];
            s.listaReporte = [];
            s.listaClasificacionesDefectos = [];

            s.cargarMaquiladores = function () {
                var objPOST = {
                    api: "getMaquiladores",
                    updateSesion: true,
                    fd: rs.getFormDataObj([]),
                    casoSoloOK: "Ha ocurrido un error al cargar los datos de maquiladores, intente de nuevo",
                    casoOKconLista: function (listaDatos) {
                        s.listaMaquiladores = listaDatos;
                        s.listaMaquiladores.unshift({
                            idMaquilador: undefined,
                            nombre: "Todos"
                        });
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

            s.cargarInspectores = function () {
                var objPOST = {
                    api: "getInspectores",
                    updateSesion: true,
                    fd: rs.getFormDataObj([]),
                    casoSoloOK: "Ha ocurrido un error al cargar los datos de Inspectores, intente de nuevo",
                    casoOKconLista: function (listaDatos) {
                        s.listaInspectores = listaDatos;
                        s.listaInspectores.unshift({
                            idInspector: undefined,
                            nombre: "Todos"
                        });
                    },
                    casoFallo: function (data) {
                        if (data.error_code) {
                            rs.agregarAlerta("Ha ocurrido un error al cargar los datos de Inspectores, código de error: " + data.error_code);
                        } else {
                            rs.agregarAlerta("Ha ocurrido un error al cargar los datos de Inspectores, intente de nuevo");
                        }
                    },
                    forzarDebug: false,
                    casoCatch: null
                }
                rs.solicitudPostTokenizada(objPOST);
            }
            s.cargarInspectores();

            s.cargarDefectos = function () {
                var objPOST = {
                    api: "getDefectos",
                    updateSesion: true,
                    fd: rs.getFormDataObj([]),
                    casoSoloOK: "Ha ocurrido un error al cargar la lista de defectos, intente de nuevo",
                    casoOKconLista: function (listaDatos) {
                        s.listaDefectos = listaDatos;
                        s.listaDefectos.unshift({
                            idDefecto: undefined,
                            nombre: "Todos"
                        });
                        s.listaDefectos.forEach(function (d) {
                            d.cantArticulos = 1;
                            d.clasificacionDefecto = getClasificacionDefecto(d) + ":";
                        });
                        s.listaDefectos2 = s.listaDefectos.slice(1);
                    },
                    casoFallo: function (data) {
                        if (data.error_code) {
                            rs.agregarAlerta("Ha ocurrido un error al cargar la lista de defectos, código de error: " + data.error_code);
                        } else {
                            rs.agregarAlerta("Ha ocurrido un error al cargar la lista de defectos, intente de nuevo");
                        }
                    },
                    forzarDebug: false,
                    casoCatch: null
                }
                rs.solicitudPostTokenizada(objPOST);
            }

            s.cargarClasificaciones = function () {
                var objPOST = {
                    api: "getClasificacionesDefectos",
                    updateSesion: true,
                    fd: rs.getFormDataObj([]),
                    casoSoloOK: "Ha ocurrido un error al cargar las clasificaciones de defectos, intente de nuevo",
                    casoOKconLista: function (listaDatos) {
                        s.listaClasificacionesDefectos = listaDatos;
                        s.listaClasificacionesDefectos.unshift({
                            idClasificacionDefectos: undefined,
                            nombre: "Todas"
                        });
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
            s.cargarClasificaciones();

            // Cargar select del filtro artículo
            function cargarSelectArticulos() {
                s.selectArticulo = {
                    fieldName: "",
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
                    varName: "idArticulo",
                    varValue: null,
                    required: true,
                    init: function () {
                        this.varValue = this.eConfig.dataSet[0].idArticulo;
                        this.eConfig.selectedName = this.eConfig.dataSet[0].nombre;
                        /* para tener acceso a este nivel desde eConfig */
                        this.eConfig.parent = this;
                        delete this.init;
                        return this;
                    }
                }.init();
            }

            /* Cargar artículos */
            s.cargarArticulos = function () {
                var objPOST = {
                    api: "getArticulos",
                    updateSesion: true,
                    fd: rs.getFormDataObj([]),
                    casoSoloOK: "Ha ocurrido un error al cargar los datos de articulos, intente de nuevo",
                    casoOKconLista: function (listaDatos) {
                        s.listaArticulos = listaDatos;
                        /* agregamos la propiedad nombre que es el dato que se va a mostrar en el jp-select */
                        s.listaArticulos.forEach(function (e) {
                            e.nombre = e.numero
                        })
                        s.listaArticulos.unshift({
                            nombre: "Todos",
                            idArticulo: undefined
                        });
                        cargarSelectArticulos();
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

            s.cargarFamiliasArticulos = function () {
                var objPOST = {
                    api: "getFamiliasArticulos",
                    updateSesion: true,
                    fd: rs.getFormDataObj([]),
                    casoSoloOK: "Ha ocurrido un error al cargar las familias de artículos, intente de nuevo",
                    casoOKconLista: function (listaDatos) {
                        s.listaFamilias = listaDatos;
                        s.listaFamilias.unshift({
                            idInspector: undefined,
                            nombre: "Todas"
                        });
                    },
                    casoFallo: function (data) {
                        if (data.error_code) {
                            rs.agregarAlerta("Ha ocurrido un error al cargar las familias de artículos, código de error: " + data.error_code);
                        } else {
                            rs.agregarAlerta("Ha ocurrido un error al cargar las familias de artículos, intente de nuevo");
                        }
                    },
                    forzarDebug: false,
                    casoCatch: null
                }
                rs.solicitudPostTokenizada(objPOST);
            }
            s.cargarFamiliasArticulos();

            function getClasificacionDefecto(defecto) {
                for (i in s.listaClasificacionesDefectos) {
                    if (defecto.fkClasificacionDefecto == s.listaClasificacionesDefectos[i].idClasificacionDefectos) {
                        return s.listaClasificacionesDefectos[i].nombre;
                    }
                }
            }
        }

        function formatearFecha(fecha) {
            return fecha.getFullYear() + "-" + (fecha.getMonth() + 1) + "-" + fecha.getDate() + " " +
                fecha.getHours() + ":" + fecha.getMinutes() + ":" + fecha.getSeconds();
        }

        s.dateUtcToCurrent = function (fechaSQL) {
            fechaSQL += ' UTC';
            var fecha = new Date(fechaSQL);
            return $filter('date')(new Date(fecha), "dd/MM/yyyy hh:mm:ss a", "-0600");
        }

        function getBottomDay(date) {
            var fecha = new Date(date);
            fecha.setHours(0);
            fecha.setMinutes(0);
            fecha.setSeconds(0);
            return fecha;
        }

        function getTopDay(date) {
            var fecha = new Date(date);
            fecha.setHours(23);
            fecha.setMinutes(59);
            fecha.setSeconds(59);
            return fecha;
        }

        function hoy(tipoReporte, ojito) {
            var fecha = new Date();
            var objReporte = {
                fechaIni: formatearFecha(currentDateToUTC(getBottomDay(fecha))),
                fechaFin: formatearFecha(currentDateToUTC(getTopDay(fecha))),
                cantidad: 0
            }
            cargarReporte(objReporte, tipoReporte, ojito);
        }

        function ayer(tipoReporte, ojito) {
            var fecha = new Date();
            fecha.setDate(fecha.getDate() - 1);
            fecha = formatearFecha(fecha);
            var objReporte = {
                fechaIni: formatearFecha(currentDateToUTC(getBottomDay(fecha))),
                fechaFin: formatearFecha(currentDateToUTC(getTopDay(fecha))),
                cantidad: 0
            }
            cargarReporte(objReporte, tipoReporte, ojito);
        }

        function u7Dias(tipoReporte, ojito) {
            var fecha1 = new Date();
            fecha1.setDate(fecha1.getDate() - 7);
            fecha1 = formatearFecha(fecha1);
            var fecha2 = new Date();
            fecha2.setDate(fecha2.getDate() - 1);
            fecha2 = formatearFecha(fecha2);
            var objReporte = {
                fechaIni: formatearFecha(currentDateToUTC(getBottomDay(fecha1))),
                fechaFin: formatearFecha(currentDateToUTC(getTopDay(fecha2))),
                cantidad: 0
            }
            cargarReporte(objReporte, tipoReporte, ojito);
        }

        function u30Dias(tipoReporte, ojito) {
            var objReporte = {};
            var fecha1 = new Date();
            fecha1.setDate(fecha1.getDate() - 30);
            fecha1 = formatearFecha(fecha1);
            var fecha2 = new Date();
            fecha2.setDate(fecha2.getDate() - 1);
            fecha2 = formatearFecha(fecha2);
            var objReporte = {
                fechaIni: formatearFecha(currentDateToUTC(getBottomDay(fecha1))),
                fechaFin: formatearFecha(currentDateToUTC(getTopDay(fecha2))),
                cantidad: 0
            }
            cargarReporte(objReporte, tipoReporte, ojito);
        }

        function personalizado(tipoReporte, ojito) {
            if (s.objFiltro.fechaIni && s.objFiltro.fechaFin) {
                var objReporte = {
                    fechaIni: formatearFecha(currentDateToUTC(getBottomDay(s.objFiltro.fechaIni))),
                    fechaFin: formatearFecha(currentDateToUTC(getTopDay(s.objFiltro.fechaFin))),
                    cantidad: 0
                }
                cargarReporte(objReporte, tipoReporte, ojito);
            } else {
                $rootScope.agregarAlerta("Debe seleccionar una fecha válida");
            }
        }

        function allRegistros(tipoReporte, ojito) {
            var objReporte = {
                /* solicitamos las facturas desde el año 2000 */
                fechaIni: formatearFecha(currentDateToUTC(new Date("2018-01-01 00:00:00"))),
                fechaFin: formatearFecha(currentDateToUTC(getTopDay(new Date()))),
                cantidad: 0
            };
            cargarReporte(objReporte, tipoReporte, ojito);
        }
        s.opciones = [
            {
                nombre: "Hoy",
                seleccionarCantidad: false,
                seleccionarFecha: false,
                funcion: hoy
            }
            , {
                nombre: "Ayer",
                seleccionarCantidad: false,
                seleccionarFecha: false,
                funcion: ayer
            }
            , {
                nombre: "Últimos 7 dias",
                seleccionarCantidad: false,
                seleccionarFecha: false,
                funcion: u7Dias
            }
            , {
                nombre: "Últimos 30 dias",
                seleccionarCantidad: false,
                seleccionarFecha: false,
                funcion: u30Dias
            }
            , {
                nombre: "Fecha personalizada",
                seleccionarCantidad: false,
                seleccionarFecha: true,
                funcion: personalizado
            }
            , {
                nombre: "Todos los registros",
                seleccionarCantidad: false,
                seleccionarFecha: false,
                funcion: allRegistros
            }
            ];

        s.buscarReporte = function (opcion, tipoReporte, ojito, popUp, id) {
            if (opcion) {
                s.popUP = popUp;
                s.idOjito = id;
                opcion.funcion(tipoReporte, ojito);
                s.opcionBK = opcion;
            } else {
                $rootScope.agregarAlerta("Debe seleccionar una opción");
            }
        };
        s.objFiltro = {};

        function cargarReporte(objReporte, tipoReporte, ojito) {
            objReporte.idMaquilador = s.objFiltro.idMaquilador;
            objReporte.idInspector = s.objFiltro.idInspector;
            objReporte.idFamilia = s.objFiltro.idFamilia;
            objReporte.idDefecto = s.objFiltro.idDefecto;
            objReporte.idClasificacionDefectos = s.objFiltro.idClasificacionDefectos;
            objReporte.idArticulo = s.selectArticulo.varValue;
            s.objFiltro.fechaIni2 = objReporte.fechaIni;
            s.objFiltro.fechaFin2 = objReporte.fechaFin;
            log(ojito);
            if (ojito == 1) {
                objReporte.idMaquilador = s.idOjito;
            } else if (ojito == 2) {
                objReporte.idArticulo = s.idOjito;
            } else if (ojito == 3) {
                objReporte.idDefecto = s.idOjito;
                objReporte.idMaquilador = s.objFiltroBK.idMaquilador;
            } else if (ojito == 4) {
                objReporte.idFamilia = s.idOjito;
            } else if (ojito == 5) {
                objReporte.idFamilia = s.objFiltroBK.idFamilia;
                objReporte.idDefecto = s.idOjito;
            } else if (ojito == 6) {
                //                objReporte.idFamilia = s.objFiltroBK.idFamilia;
                objReporte.idClasificacionDefectos = s.idOjito;
            }

            //             log(objReporte);
            var objPOST = {
                //                api: s.tipoReporte,
                api: tipoReporte,
                updateSesion: true,
                fd: rs.getFDFromObjOnNulls(objReporte),
                casoSoloOK: "Ha ocurrido un error un error al realizar la consulta, intente de nuevo",
                casoOKconLista: function (listaDatos) {
                    if (ojito == 0) {
                        s.listaReporte = listaDatos;
                        s.idDefectoP = s.objFiltro.idDefecto; /*Saber si es personalizado el reporte*/
                        s.objFiltroBK = objReporte;
                    } else {
                        s.objFiltroBK = objReporte;
                        rs.cargarPopup(s.popUP);
                        s.listaSubReporte = listaDatos;
                    }
                },
                casoFallo: function (data) {
                    if (data.error_code) {
                        rs.agregarAlerta("Ha ocurrido un error al realizar la consulta, código de error: " + data.error_code);
                    } else {
                        rs.agregarAlerta("Ha ocurrido un error al realizar la consulta, intente de nuevo");
                    }
                },
                forzarDebug: false,
                casoCatch: null
            }
            if (ojito == 0) {
                s.listaReporte = [];
            }
            s.listaSubReporte = [];
            rs.solicitudPostTokenizada(objPOST);
        }

        s.listaInspecciones = [];

        s.cargarInspeccion = function (i) {
            var objPOST = {
                api: "getDefectosXInspeccion",
                updateSesion: true,
                fd: rs.getFDFromObjOnNulls({
                    idInspeccion: i.idInspeccion
                }),
                casoSoloOK: "Ha ocurrido un error al cargar los defectos de la inspección, intente de nuevo",
                casoOKconLista: function (listaDatos) {
                    s.inspeccionSeleccionada = i;
                    s.inspeccionSeleccionada.listaDefectosXInspeccion = listaDatos;
                    rs.cargarPopup('verRevision');
                },
                casoFallo: function (data) {
                    if (data.error_code) {
                        rs.agregarAlerta("Ha ocurrido un error al cargar los defectos de la inspección, código de error: " + data.error_code);
                    } else {
                        rs.agregarAlerta("Ha ocurrido un error al cargar los defectos de la inspección, intente de nuevo");
                    }
                },
                forzarDebug: false,
                casoCatch: null
            }
            rs.solicitudPostTokenizada(objPOST);
        }

        s.cargarDefectosXArticulo = function (a) {
            var objPOST = {
                api: "getDefectosXArticulo",
                updateSesion: true,
                fd: rs.getFDFromObjOnNulls({
                    idArticulo: a.idArticulo,
                    fechaIni: s.objFiltro.fechaIni2,
                    fechaFin: s.objFiltro.fechaFin2
                }),
                casoSoloOK: "Ha ocurrido un error al cargar los defectos del artículo, intente de nuevo",
                casoOKconLista: function (listaDatos) {
                    s.listaDefectosXArticulo = listaDatos;
                    rs.cargarPopup('verDefectosXArticulo');
                },
                casoFallo: function (data) {
                    if (data.error_code) {
                        rs.agregarAlerta("Ha ocurrido un error al cargar los defectos del artículo, código de error: " + data.error_code);
                    } else {
                        rs.agregarAlerta("Ha ocurrido un error al cargar los defectos del artículo, intente de nuevo");
                    }
                },
                forzarDebug: false,
                casoCatch: null
            }
            rs.solicitudPostTokenizada(objPOST);
        }

        s.cargarDefectosXArticuloXMaquilador = function (d) {
            var objPOST = {
                api: "getArticuloXDefectosXMaquilador",
                updateSesion: true,
                fd: rs.getFDFromObjOnNulls({
                    idDefecto: d.idDefecto,
                    idMaquilador: d.idMaquilador,
                    fechaIni: s.objFiltro.fechaIni2,
                    fechaFin: s.objFiltro.fechaFin2
                }),
                casoSoloOK: "Ha ocurrido un error al cargar los defectos del artículo, intente de nuevo",
                casoOKconLista: function (listaDatos) {
                    s.listaArticulosDefectuosos = listaDatos;
                    rs.cargarPopup('verArticulosXDefecto');
                },
                casoFallo: function (data) {
                    if (data.error_code) {
                        rs.agregarAlerta("Ha ocurrido un error al cargar los defectos del artículo, código de error: " + data.error_code);
                    } else {
                        rs.agregarAlerta("Ha ocurrido un error al cargar los defectos del artículo, intente de nuevo");
                    }
                },
                forzarDebug: false,
                casoCatch: null
            }
            rs.solicitudPostTokenizada(objPOST);
        }

        s.cargarDefectosXFamilia = function (f) {
            var objPOST = {
                api: "getDefectosXFamilia",
                updateSesion: true,
                fd: rs.getFDFromObjOnNulls({
                    idFamilia: f.idFamilia,
                    fechaIni: s.objFiltro.fechaIni2,
                    fechaFin: s.objFiltro.fechaFin2
                }),
                casoSoloOK: "Ha ocurrido un error al cargar los defectos por familia, intente de nuevo",
                casoOKconLista: function (listaDatos) {
                    s.listaDefectosXFamilia = listaDatos;
                    rs.cargarPopup('verDefectosXFamilia');
                },
                casoFallo: function (data) {
                    if (data.error_code) {
                        rs.agregarAlerta("Ha ocurrido un error al cargar los defectos por familia, código de error: " + data.error_code);
                    } else {
                        rs.agregarAlerta("Ha ocurrido un error al cargar los defectos por familia, intente de nuevo");
                    }
                },
                forzarDebug: false,
                casoCatch: null
            }
            rs.solicitudPostTokenizada(objPOST);
        }
        s.personalizado = function () {
            if (s.idDefectoP > 0) {
                return true;
            } else {
                return false;
            }
        }

        /* ====================================================== */
        /* MODIFICAR REVISIÓN */

        s.objMRC = {};
        s.objMRC.defectos = [];

        s.getCantidadDefectosInspeccion = function () {
            var cantidad = 0;
            s.objMRC.defectos.forEach(function (d) {
                cantidad += d.cantArticulos;
            });
            return cantidad;
        }

        s.quitarDefectoRevision = function (d) {
            rs.preguntar('¿Está seguro que desea remover "' + d.nombreDefecto + '" de la lista de defectos de este revisión?',
                function () {
                    s.objMRC.defectos.splice(s.objMRC.defectos.indexOf(d), 1);
                })
        }

        s.cancelarModificacion = function () {
            rs.cargarPopup("");
        }

        s.mostrarSeleccionarDefectos = false;
        s.togglePanelAgregarDefectos = function () {
            s.mostrarSeleccionarDefectos = !s.mostrarSeleccionarDefectos;
        }

        s.agregarDefectoRevision = function (d, cantidad) {
            if (s.objMRC.defectos.indexOf(d) == -1) {
                /* si no está, lo agregamos la lista de defectos de la revisión */
                d.cantArticulos = 1;
                s.objMRC.defectos.push(d);
                rs.agregarAlerta("Se ha agregado el defecto '" + d.nombre + "'");
            } else {
                rs.agregarAlerta("El defecto '" + d.nombre + "' ya está agregado");
            }
        }

        /* configuración inputs para jp-inputs*/
        function inicializarFormsModificarInspeccion() {
            /* configuración del formulario de revisión de calidad */
            s.frmMRC = {};
            /* funciones de seteo de datos para el formulario */
            s.frmMRC.setMaquiladores = function (listaMaquiladores) {
                this.selectMaquilador.eConfig.dataSet = listaMaquiladores;
            }
            s.frmMRC.setArticulos = function (listaArticulos) {
                listaArticulos.forEach(function (e, i) {
                    e.nombre = e.numero;
                });
                this.selectArticulo.eConfig.dataSet = listaArticulos;
            }

            // Seleccion del maquilador
            s.frmMRC.selectMaquilador = {
                fieldName: "Maquilador",
                eTag: "customSelect",
                eConfig: {
                    notaPanelSeleccion: "Por favor seleccione el maquilador",
                    dataSet: s.listaMaquiladores.slice(1),
                    selectedName: s.inspeccionSeleccionada.nombreMaquilador,
                    fnElementoSeleccionado: function (e) {
                        this.parent.varValue = e.idMaquilador;
                        this.selectedName = e.nombre;
                    }
                },
                varName: "fkMaquilador",
                varValue: s.inspeccionSeleccionada.idMaquilador,
                required: true,
                init: function () {
                    /* para tener acceso a este nivel desde eConfig */
                    this.eConfig.parent = this;
                    delete this.init;
                    return this;
                }
            }.init();

            // Seleccion del artículo
            s.frmMRC.selectArticulo = {
                fieldName: "Artículo",
                eTag: "customSelect",
                eConfig: {
                    notaPanelSeleccion: "Por favor seleccione el artículo",
                    dataSet: s.listaArticulos.slice(1),
                    selectedName: s.inspeccionSeleccionada.numArticulo,
                    fnElementoSeleccionado: function (e) {
                        this.parent.varValue = e.idArticulo;
                        this.selectedName = e.numero;
                    }
                },
                varName: "fkArticulo",
                varValue: s.inspeccionSeleccionada.idArticulo,
                required: true,
                init: function () {
                    /* para tener acceso a este nivel desde eConfig */
                    this.eConfig.parent = this;
                    delete this.init;
                    return this;
                }
            }.init();

            // Cantida de artículos
            s.frmMRC.inputCantArticulos = {
                fieldName: "Cantidad de artículos",
                eTag: "input",
                eConfig: {
                    type: "number"
                },
                varName: "cantidadArticulos",
                varValue: parseInt(s.inspeccionSeleccionada.cantArticulos),
                required: true
            };

            // Cantida de artículos defectuosos
            s.frmMRC.inputCantArticulosDefectuosos = {
                fieldName: "Cant. artículos defectuosos",
                eTag: "input",
                eConfig: {
                    type: "number"
                },
                varName: "cantidadArticulosDefectuosos",
                varValue: parseInt(s.inspeccionSeleccionada.cantArticulosDefectuos),
                required: true
            };
        }

        function agregarDefectoXNombre(nombre, cantidad) {
            for (d in s.listaDefectos) {
                if (s.listaDefectos[d].nombre == nombre) {
                    s.listaDefectos[d].cantArticulos = cantidad;
                    s.objMRC.defectos.push(s.listaDefectos[d]);
                }
            }
        }

        s.preModificarInspeccion = function (i) {
            // vaciamos el obj de defectos para cargarlo de nuevo con la nueva selección
            s.objMRC.defectos = [];
            var objPOST = {
                api: "getDefectosXInspeccion",
                updateSesion: true,
                fd: rs.getFDFromObjOnNulls({
                    idInspeccion: i.idInspeccion
                }),
                casoSoloOK: "Ha ocurrido un error al cargar los defectos de la inspección, intente de nuevo",
                casoOKconLista: function (listaDatos) {
                    s.inspeccionSeleccionada = i;
                    for (d in listaDatos) {
                        agregarDefectoXNombre(listaDatos[d].nombreDefecto, parseInt(listaDatos[d].cantidad));
                    }
                    inicializarFormsModificarInspeccion();
                    rs.cargarPopup('modificarRevision');
                },
                casoFallo: function (data) {
                    if (data.error_code) {
                        rs.agregarAlerta("Ha ocurrido un error al cargar los defectos de la inspección, código de error: " + data.error_code);
                    } else {
                        rs.agregarAlerta("Ha ocurrido un error al cargar los defectos de la inspección, intente de nuevo");
                    }
                },
                forzarDebug: false,
                casoCatch: null
            }
            rs.solicitudPostTokenizada(objPOST);
        }


        s.guardarCambiosRevision = function () {
            var fd = new FormData();
            if (!s.frmMRC.inputCantArticulos.varValue || s.frmMRC.inputCantArticulos.varValue <= 0) {
                rs.agregarAlerta("La cantidad de artículos debe ser al menos 1");
                return;
            }

            if (s.frmMRC.inputCantArticulosDefectuosos.varValue == null || s.frmMRC.inputCantArticulosDefectuosos.varValue < 0) {
                rs.agregarAlerta("La cantidad de artículos defectuosos debe ser mayor que 0");
                return;
            }

            if (s.frmMRC.inputCantArticulosDefectuosos.varValue > 0 && s.objMRC.defectos.length == 0) {
                rs.agregarAlerta("No se puede guardar la revisión porque ha indicado que hay artículos defectuosos pero no ha agregado ningún defecto.");
                return;
            }

            if (!s.frmMRC.selectMaquilador.varValue) {
                rs.agregarAlerta("Debe seleccionar el maquilador");
                return;
            }

            if (!s.frmMRC.selectArticulo.varValue) {
                rs.agregarAlerta("Debe seleccionar el artículo que está revisando");
                return;
            }

            if (s.frmMRC.inputCantArticulos.varValue < s.frmMRC.inputCantArticulosDefectuosos.varValue) {
                rs.agregarAlerta("La cantidad de artículos defectuosos no puede ser mayor que la cantidad total de artículos. Corrija la inconsistencia e intente guardar la revisión de nuevo.");
                return;
            }

            var totalDefectos = 0;
            s.objMRC.defectos.forEach(function (d) {
                totalDefectos += d.cantArticulos;
            });

            if (s.frmMRC.inputCantArticulosDefectuosos.varValue == 0 && totalDefectos > 0) {
                rs.agregarAlerta("Ha indicado que no hay ningún artículo defectuoso pero ha agregado defectos. Corrija la inconsistencia e intente guardar la revisión de nuevo.");
                return;
            }

            if (totalDefectos < s.frmMRC.inputCantArticulosDefectuosos.varValue) {
                rs.agregarAlerta("Ha indicado que hay " + s.frmMRC.inputCantArticulosDefectuosos.varValue + " artículos defectuosos pero solamente ha registrado, en la lista de defectos, una totalidad de " + totalDefectos + " artículos defectuosos.");
                return;
            }

            function guardarModificacionInspeccion() {
                fd.append("cantidadArticulos", s.frmMRC.inputCantArticulos.varValue);
                fd.append("cantidadArticulosDefectuosos", s.frmMRC.inputCantArticulosDefectuosos.varValue);
                fd.append("idMaquilador", s.frmMRC.selectMaquilador.varValue);
                fd.append("idArticulo", s.frmMRC.selectArticulo.varValue);
                fd.append("idInspector", s.inspeccionSeleccionada.idInspector);
                fd.append("idInspeccion", s.inspeccionSeleccionada.idInspeccion);
                fd.append("fecha", s.inspeccionSeleccionada.fecha);

                var objListaDefectos = [];
                s.objMRC.defectos.forEach(function (d) {
                    objListaDefectos.push({
                        idDefecto: d.idDefecto,
                        cantArticulos: d.cantArticulos
                    });
                });

                fd.append("listaDefectos", JSON.stringify(objListaDefectos));

                var objPOST = {
                    api: "modificarInspeccion",
                    updateSesion: true,
                    fd: fd,
                    casoSoloOK: function () {
                        rs.agregarAlerta("Se ha modificado correctamente la revisión");
                        s.buscarReporte(s.opcionBK, 'reporteInspecciones', 0, '');
                        s.cancelarModificacion();
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

            if (s.frmMRC.inputCantArticulosDefectuosos.varValue == 0) {
                rs.preguntar("Ha indicado que no hay ningún artículo defectuoso. ¿Desea Continuar?", guardarModificacionInspeccion);
            } else {
                guardarModificacionInspeccion();
            }
        }

        /* ====================================================== */

    }

    /*Para Gráficos*/
    s.levantarPopUp = function (tipoReporte, nombreGrafica, modoGrafico) {
        if (s.listaReporte.length > 0) {
            s.nombreGrafica = nombreGrafica;
            rs.cargarPopup('graficoBarras');
            setTimeout(s.mostrarGrafico, 200, tipoReporte, modoGrafico);
        }
    }
    s.mostrarGrafico = function (tipoReporte, modoGrafico) {
        var labels = [];
        var data = [];
        s.nombreGrafica = s.nombreGrafica;
        if (tipoReporte == 1) {
            s.listaReporte.forEach(function (maq) {
                labels.push(maq.nombre);
                if (s.personalizado()) {
                    data.push(s.formatearFloat(maq.totalArtDefectuosos / maq.totalArticulosRevisados * 100));
                } else {
                    data.push(s.formatearFloat(maq.cantArtDefectuosos / maq.totalArticulosRevisados * 100));
                }
            })
        };
        var coloresFondo = ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'];
        var coloresBorde = ['rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'];

        s.canvas = document.createElement("canvas");
        s.myBarChart = new Chart(s.canvas, {
            type: modoGrafico,
            data: {
                labels: labels,
                datasets: [{
                    label: '% Artículos Defectuosos',
                    data: data,
                    backgroundColor: coloresFondo,
                    borderColor: coloresBorde,
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
        x = document.getElementById("idGrafica");
        x.innerHTML = '';
        x.insertBefore(s.canvas, x.lastChild);
    };

    s.$on("$destroy", function () {
        $rootScope.controllerDestruido();
    });
});
