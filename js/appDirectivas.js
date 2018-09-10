app.directive('jpInput', function () {
    return {
        restrict: 'E',
        scope: {
            eData: '='
        },
        templateUrl: function (elem, attr) {
            return 'jp/jp_inputs.html';
        },
        controller: function ($scope) {
            var s = $scope;
            s.eConfig = s.eData.eConfig;
        }
    };
});


app.directive('jpForm', function () {
    return {
        restrict: 'E',
        scope: {
            configForm: '='
        },
        templateUrl: function (elem, attr) {
            return 'jp/jp_forms.html';
        }
    };
});
