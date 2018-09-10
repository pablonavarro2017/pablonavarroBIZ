/* LOGIN */
app.controller("loginController", function (Upload, $window, $scope, $http, $filter, $rootScope,$interval,$location) {
    var scope = $scope;
    var rs = $rootScope;
//    if (!rs.verificarSesion()) { OJO
    if (rs.verificarSesion()) {
        rs.nombrePanelActual = "Iniciar Sesión";
        scope.showFormRegistro = false;
        scope.showRegistrar = function () {
            scope.showFormRegistro = true;
        }
        scope.hideRegistrar = function () {
            scope.showFormRegistro = false;
        }
        scope.login = function (configForm) {
            /*var objPOST = {
                api: "iniciarSesion",
                fd: rs.getFormDataObj(configForm.fields),
                casoSoloOK: "Los datos de inicio se sesión son incorrectos",
                casoOKconLista: function (listaDatos) {
                    rs.abrirSesion(listaDatos[0]);
                    $location.path("");
                },
                casoFallo: "Los datos de inicio se sesión son incorrectos",
                forzarDebug: false,
                casoCatch: null,
                fnInicioSolicitud: function () {
                    configForm.buttonsDisabled = true;
                },
                fnFinSolicitud: function () {
                    configForm.buttonsDisabled = false;
                }
            }
            rs.solicitudPost(objPOST);*/
            rs.abrirSesion({});
            $location.path("");
        };
        scope.configFormLogin = {
            titleForm: "Iniciar Sesión",
            buttonSubmitName: "Iniciar Sesión",
            buttonsDisabled: false,
            functionSubmit: function () {
                scope.login(this)
            },
            fields: [{
                fieldName: "Nombre de usuario",
                varName: "username",
                varValue: "",
                required: true
            }, {
                fieldName: "Contraseña",
                eTag: "input",
                eConfig: {
                    type: "password"
                },
                required: true,
                varName: "pass",
                varValue: ""
            }]
        };
    } else {
        $location.path("");
    }
    $scope.$on("$destroy", function () {
        $rootScope.controllerDestruido();
    });
});
