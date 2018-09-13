/* Plantilla controller */
app.controller("defectosController", function (Upload, $window, $scope, $rootScope, $location, $http, $cookies, $interval, $filter) {
    if ($rootScope.verificarPermisos("defectosController")) {
        var rs = $rootScope;
        var s = $scope;
        /* Popup Scope */
        rs.ps = s;
        rs.nombrePanelActual = "Defectos";
        s.mostrarElementosOcultos = false;
        s.toggleElementosOcultos = function () {
            s.mostrarElementosOcultos = !s.mostrarElementosOcultos;
        }
        s.listaDefectos = [];
        s.listaClasificacionesDefectos = [];

        {
            s.cargarDefectos = function () {
                var objPOST = {
                    api: "getDefectos",
                    updateSesion: true,
                    fd: rs.getFormDataObj([]),
                    casoSoloOK: "Ha ocurrido un error al cargar los datos de los defectos, intente de nuevo",
                    casoOKconLista: function (listaDatos) {
                        s.listaDefectos = listaDatos;
                        s.listaDefectos.forEach(function (d) {
                            d.fkClasificacionDefecto = parseInt(d.fkClasificacionDefecto);
                            d.penalizacion = parseFloat(d.penalizacion);
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
                        s.listaClasificacionesDefectos.forEach(function (c) {
                            c.idClasificacionDefectos = parseInt(c.idClasificacionDefectos);
                        });
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

            s.agregarDefecto = function (objDefecto) {
                objDefecto.penalizacion = parseFloat(objDefecto.penalizacion);
                log(objDefecto);
                var objPOST = {
                    api: "agregarDefecto",
                    updateSesion: true,
                    fd: rs.getFDFromObj(objDefecto),
                    casoSoloOK: function () {
                        s.cargarDefectos();
                        rs.cargarPopup('');
                        rs.agregarAlerta("Se creó el defecto exitosamente")
                    },
                    casoOKconLista: "Ha ocurrido un error al agregar el defectos, intente de nuevo",
                    casoFallo: function (data) {
                        if (data.error_code) {
                            rs.agregarAlerta("Ha ocurrido un error al agregar el defectos, código de error: " + data.error_code);
                        } else {
                            rs.agregarAlerta("Ha ocurrido un error al agregar el defectos, intente de nuevo");
                        }
                    },
                    forzarDebug: false,
                    casoCatch: null
                }
                if (objPOST.fd != undefined) {
                    rs.solicitudPostTokenizada(objPOST);
                } else {
                    rs.agregarAlerta("Rellene los campos vacíos")
                }
            }

            s.preModificarDefecto = function (d) {
                s.objModificarDefecto = JSON.clone(d);
                rs.cargarPopup('modificarDefecto');
            }

            s.modificarDefecto = function (objModificarDefecto) {
                log(objModificarDefecto);
                var objPOST = {
                    api: "modificarDefecto",
                    updateSesion: true,
                    fd: rs.getFDFromObj(objModificarDefecto),
                    casoSoloOK: function () {
                        s.cargarDefectos();
                        rs.cargarPopup('');
                        rs.agregarAlerta("Se modificó el defecto exitosamente")
                    },
                    casoOKconLista: "Ha ocurrido un error al modificar el defectos, intente de nuevo",
                    casoFallo: function (data) {
                        if (data.error_code) {
                            rs.agregarAlerta("Ha ocurrido un error al modificar el defectos, código de error: " + data.error_code);
                        } else {
                            rs.agregarAlerta("Ha ocurrido un error al modificar el defectos, intente de nuevo");
                        }
                    },
                    forzarDebug: false,
                    casoCatch: null
                }
                if (objPOST.fd != undefined) {
                    rs.solicitudPostTokenizada(objPOST);
                } else {
                    rs.agregarAlerta("Rellene los campos vacíos")
                }
            }

            s.preBorrarDefecto = function (d) {
                rs.preguntar('¿Está seguro que desea borrar el defecto ' + '"' + d.nombre + '"' + '?', function () {
                    log("Borrando " + d.nombre);
                    var objPOST = {
                        api: "eliminarDefecto",
                        fd: rs.getFDFromObj({
                            idDefecto: d.idDefecto
                        }),
                        casoSoloOK: function () {
                            rs.agregarAlerta("Se eliminó el defecto " + d.nombre);
                            s.cargarDefectos();
                        },
                        casoOKconLista: "Ha ocurrido un error, intente de nuevo",
                        casoFallo: "Ha ocurrido un error, intente de nuevo",
                    }
                    rs.solicitudPostTokenizada(objPOST);
                }, function () {
                    rs.agregarAlerta("Acción Cancelada");
                })
            }

            s.preModificarClasificacion = function (c) {
                log(c);
                s.objModificarClasificacion = JSON.clone(c);
                rs.cargarPopup('modificarClasificacion');
            }

            s.modificarClasificacion = function (objModificarClasificacion) {
                log(objModificarClasificacion);
                var objPOST = {
                    api: "modificarClasificacionDefecto",
                    updateSesion: true,
                    fd: rs.getFDFromObj(objModificarClasificacion),
                    casoSoloOK: function () {
                        s.cargarClasificacionesDefectos();
                        s.cargarDefectos();
                        rs.cargarPopup('');
                        rs.agregarAlerta("Se modificó la clasificación exitosamente")
                    },
                    casoOKconLista: "Ha ocurrido un error al modificar la clasificación, intente de nuevo",
                    casoFallo: function (data) {
                        if (data.error_code) {
                            rs.agregarAlerta("Ha ocurrido un error al modificar la clasificación, código de error: " + data.error_code);
                        } else {
                            rs.agregarAlerta("Ha ocurrido un error al modificar la clasificación, intente de nuevo");
                        }
                    },
                    forzarDebug: false,
                    casoCatch: null
                }
                if (objPOST.fd != undefined) {
                    rs.solicitudPostTokenizada(objPOST);
                } else {
                    rs.agregarAlerta("Rellene los campos vacíos")
                }
            }
            s.agregarClasificacion = function (objCrearClasificacion) {
                log(objCrearClasificacion);
                var objPOST = {
                    api: "agregarClasificacionDefecto",
                    updateSesion: true,
                    fd: rs.getFDFromObj(objCrearClasificacion),
                    casoSoloOK: function () {
                        s.cargarClasificacionesDefectos();
                        rs.cargarPopup('')
                        rs.agregarAlerta("Se creó el defecto exitosamente")
                    },
                    casoOKconLista: "Ha ocurrido un error al agregar el defectos, intente de nuevo",
                    casoFallo: function (data) {
                        if (data.error_code) {
                            rs.agregarAlerta("Ha ocurrido un error al agregar el defectos, código de error: " + data.error_code);
                        } else {
                            rs.agregarAlerta("Ha ocurrido un error al agregar el defectos, intente de nuevo");
                        }
                    },
                    forzarDebug: false,
                    casoCatch: null
                }
                if (objPOST.fd != undefined) {
                    rs.solicitudPostTokenizada(objPOST);
                } else {
                    rs.agregarAlerta("Rellene los campos vacíos")
                }
            }

            s.preBorrarClasificacion = function (c) {
                log(c);
                rs.preguntar('¿Está seguro que desea borrar la clasificación ' + '"' + c.nombre + '"' + '?', function () {
                    log("Borrando " + c.nombre);
                    var objPOST = {
                        api: "eliminarClasificacionDefectos",
                        fd: rs.getFDFromObj({
                            idClasificacionDefectos: c.idClasificacionDefectos
                        }),
                        casoSoloOK: function () {
                            s.cargarClasificacionesDefectos();
                            rs.cargarPopup('')
                            rs.agregarAlerta("Se borró la clasificación exitosamente")
                        },
                        casoOKconLista: "Ha ocurrido un error, intente de nuevo",
                        casoFallo: function (data) {
                            if (data.error_code) {
                                rs.agregarAlerta("Ha ocurrido un error al borrar la clasificación, código de error: " + data.error_code);
                            } else {
                                rs.agregarAlerta("Ha ocurrido un error al borrar la clasificación, intente de nuevo");
                            }
                        },
                    }
                    rs.solicitudPostTokenizada(objPOST);
                }, function () {
                    rs.agregarAlerta("Acción Cancelada");
                })
            }
        }

        /* SUBIDA MASIVA DE DEFECTOS */
        {
            s.formAgregarArticulosDesdeExcel = {};
            s.archivoExcelProcesadoCorrectamente = false;

            function existeDefecto(nombre) {
                for (i in s.listaDefectos) {
                    if (nombre == s.listaDefectos[i].nombre) {
                        return true;
                    }
                }
                return false;
            }

            function getIDClasificacionDefecto(nombre) {
                for (i in s.listaClasificacionesDefectos) {
                    if (nombre == s.listaClasificacionesDefectos[i].nombre) {
                        return s.listaClasificacionesDefectos[i].idClasificacionDefectos;
                    }
                }
                return -1;
            }

            s.prepararSubidaDeDefectos = function () {
                /* verificamos si el numero de columnas es el correco */
                /* [
                ["Número de artículo","Descripción del artículo"],
                ["Número de artículo","Descripción del artículo"]
                ] */
                if (ExcelFileContentInJSON != null && ExcelFileContentInJSON[0].data[0].length == 3) {
                    // verificamos cuales artículos se van a subir y cuales ya están
                    s.listaDefectosSubir = [];
                    s.listaDefectosDuplicados = [];
                    for (i in ExcelFileContentInJSON[0].data) {
                        var objDefecto = {
                            nombre: ExcelFileContentInJSON[0].data[i][0],
                            clasificacion: ExcelFileContentInJSON[0].data[i][1],
                            penalizacion: ExcelFileContentInJSON[0].data[i][2]
                        };
                        if (objDefecto.penalizacion == undefined) {
                            objDefecto.penalizacion = 0;
                        }
                        if (existeDefecto(objDefecto.nombre)) {
                            s.listaDefectosDuplicados.push(objDefecto);
                        } else {
                            var idClasificacionDefecto = getIDClasificacionDefecto(objDefecto.clasificacion);
                            if (idClasificacionDefecto > 0) {
                                objDefecto.fkClasificacionDefecto = idClasificacionDefecto;
                                objDefecto.agregar = true;
                            } else {
                                rs.agregarAlerta("La clasificación '" + objDefecto.clasificacion + "' del defecto '" + objDefecto.nombre + "' no existe, debe agregarla antes de continuar con la carga de datos");
                                return;
                                objDefecto.agregar = false;
                            }
                            s.listaDefectosSubir.push(objDefecto);
                        }
                    }
                    s.archivoExcelProcesadoCorrectamente = true;
                } else {
                    s.listaDefectosSubir = [];
                    s.listaDefectosDuplicados = [];
                    s.archivoExcelProcesadoCorrectamente = false;
                    rs.agregarAlerta('Al parecer, el archivo seleccionado es incorrecto. Se esperaba un archivo con 3 columnas "Nombre del defecto", "Clasificación" y "Porcentaje de descuento"');
                }
            }

            s.preSubirArticulos = function () {
                s.listaDefectosSubir = [];
                s.listaDefectosDuplicados = [];
                s.archivoExcelProcesadoCorrectamente = false;
                ExcelFileContentInJSON = null;
                rs.cargarPopup("agregarDefectosDesdeArchivo");
            }

            s.procesarSubidaDeDefectosMasivos = function () {
                var listaDefectosSubir = [];
                for (i in s.listaDefectosSubir) {
                    if (s.listaDefectosSubir[i].agregar) {
                        listaDefectosSubir.push(s.listaDefectosSubir[i]);
                    }
                }
                if (listaDefectosSubir.length == 0) {
                    rs.agregarAlerta("No hay defectos para agregar");
                    return;
                }

                rs.preguntar("Se van a agregar '" + listaDefectosSubir.length + "' defectos nuevos. ¿Desea continuar?",
                    function () {
                        var fd = new FormData();
                        fd.append("listaDefectos", JSON.stringify(listaDefectosSubir));
                        var objPOST = {
                            api: "agregarListaDefectos",
                            updateSesion: true,
                            fd: fd,
                            casoSoloOK: function () {
                                s.listaDefectosSubir = [];
                                s.listaDefectosDuplicados = [];
                                s.archivoExcelProcesadoCorrectamente = false;
                                ExcelFileContentInJSON = null;
                                rs.cargarPopup('');
                                s.cargarDefectos();
                                rs.agregarAlerta("Se han agregado todos los defectos correctamente");
                            },
                            casoOKconLista: "",
                            casoFallo: function (data) {
                                rs.agregarAlerta("Ha ocurrido un problema al agregar todos los defectos");
                                s.cargarDefectos();
                                rs.cargarPopup('');
                            }
                        }
                        rs.solicitudPostTokenizada(objPOST);
                    });
            }
        }

        s.cargarClasificacionesDefectos();
        s.cargarDefectos();
    }

    $scope.$on("$destroy", function () {
        $rootScope.controllerDestruido();
    });
});
