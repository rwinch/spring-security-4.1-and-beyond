'use strict';

angular.module('xss-demo-app', [])

.controller('xssDemoController', ['$scope', function ($scope) {
	$scope.updateCurrentActiveLink = function (clickedLink) {
		$scope.currentActiveLink = clickedLink;
	};

	$scope.isCurrentActiveLink = function (link) {
		return $scope.currentActiveLink === link;
	};

	$scope.logout = function() {
	};

	var init = function() {
		$scope.currentPrincipal = {};
		$scope.currentPrincipal.firstName = '';
		$scope.currentPrincipal.lastName = '';
	};

	init();
}])

.directive('headerDirective', function() {
	return {
		templateUrl : 'assets/js/common/directives/header/header.tpl.html'
  	};
})
;