'use strict'

angular.module('secure-messaging-app.util', [
    'ngAnimate',
    'ui.bootstrap'
])

.factory('commonService', function() {

    var _properties = {};

    var _eventTypes = {
        CURRENT_MESSAGE_CHANGE_EVENT : 'CURRENT_MESSAGE_CHANGE_EVENT'
    };

    return {
        CURRENT_MESSAGE_KEY: 'CURRENT_MESSAGE',

        EVENT_TYPES: _eventTypes,

        setProperty: function (key, value) {
            _properties[key] = value;
        },

        getProperty: function (key) {
            return _properties[key];
        }
    }
})

.controller('errorModalController', ['$scope', '$uibModalInstance', 'modalData', function($scope, $uibModalInstance, modalData) {
    $scope.headerMsg = modalData.errorTitle;
    $scope.errorMsg = modalData.errorMessage;

    $scope.ok = function() {
        $uibModalInstance.close();
    }
}])

.factory('errorService', ['$uibModal', function($uibModal) {
    function openErrorModal(args){
        $uibModal.open({
            animation: true,
            templateUrl: 'common/partials/errorModal.tpl.html',
            controller: 'errorModalController',
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
}])
;