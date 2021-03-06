app.controller("audioStreamer", function (Upload, $sce, $window, $scope, $http, $filter, $rootScope, $interval, $location, $templateCache) {
    s = $scope;
    rs = $rootScope;
    rs.sa = s;
    rs.popupUrl = "";

    s.getAudioStream = function (url) {
        rs.progreso = 0;
        rs.classProgress = 'p0';
        rs.progressing = true;
        rs.solicitudPost("/getAudioStream", {
            url: url
        }, function (data) {
            rs.progressing = false;
            if (data.estado == 'OK') {
                rs.agregarAlerta('Descarga Completa: ' + data.data.videoTitle);
            } else {
                rs.agregarAlerta('Error al procesar URL');
            }
        }, function (res) {
            rs.agregarAlerta('Error Al Stream del video');
            log(res);
        });
    }

    //cliente io
    var socket = io();
    socket.on('progressing', function (data) {
        rs.progreso = data.progreso;
        rs.classProgress = data.progreso > 50 ? 'p' + data.progreso + ' over50' : 'p' + data.progreso;
        rs.progressing = true;
    });

});
