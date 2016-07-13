'use strict';

angular.module('secure-messaging-app', [
  	'secure-messaging-app.router',
	'secure-messaging-app.util',
  	'ui.bootstrap',
  	'underscore'
])

.config(['$httpProvider', function($httpProvider) {
	$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}])

.constant('BASE_API_ENDPOINT', '')

.controller('appController', ['$scope', function ($scope) {
	$scope.updateCurrentActiveLink = function (clickedLink) {
		$scope.currentActiveLink = clickedLink;
	};

	$scope.isCurrentActiveLink = function (link) {
		return $scope.currentActiveLink === link;
	};
}])

.directive('headerDirective', function() {
	return {
		templateUrl : 'assets/js/common/directives/header/header.tpl.html'
  	};
})
;