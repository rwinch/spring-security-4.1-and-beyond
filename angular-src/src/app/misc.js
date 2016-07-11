'use strict'

angular.module('secure-messaging-app.misc', [
    'ngAnimate',
    'ui.bootstrap'
])

.controller('ErrorModalCtrl', ['$scope', '$uibModalInstance', 'modalData', function($scope, $uibModalInstance, modalData) {
    $scope.headerMsg = modalData.errorTitle;
    $scope.errorMsg = modalData.errorMessage;

    $scope.ok = function() {
        $uibModalInstance.close();
    }
}])

.factory('errorService', ['$uibModal', function($uibModal){
    function openErrorModal(args){
        $uibModal.open({
            animation: true,
            templateUrl: 'common/partials/errorModal.tpl.html',
            controller: 'ErrorModalCtrl',
            resolve: {
                modalData: function () {
                    var modalData = {
                        errorTitle : args.title,
                        errorMessage : args.message
                    };
                    return modalData;
                }
            }
        });
    }

    return {
        openErrorModal : openErrorModal
    }
}]);
;
