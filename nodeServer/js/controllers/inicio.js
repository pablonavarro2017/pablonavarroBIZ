app.controller("inicioController", function (Upload, $window, $scope, $rootScope, $location, $http, $cookies, $interval, $filter, $log) {
    if ($rootScope.verificarSesion()) {
        var rs = $rootScope;
        var s = $scope;
        rs.nombrePanelActual = "Inicio";
    }
    else{
        $location.path("login");
    }
    $scope.$on("$destroy", function () {
        $rootScope.controllerDestruido("inicioController");
    });
});
