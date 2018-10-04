app.controller("audioStreamer", function (Upload, $sce, $window, $scope, $http, $filter, $rootScope, $interval, $location, $templateCache) {
    s = $scope;
    rs = $rootScope;
    rs.sa = s;
    rs.popupUrl = "";

    s.getAudioStream = function (url) {
        rs.solicitudPost("/getAudioStream", {
            url: ''
        }, function (data) {
            log(data);
        }, function (res) {
            rs.agregarAlerta('Error Al Stream del video');
            log(res);
        });
    }

});
