'use strict';

angular.module('secure-messaging-app', [
  	'secure-messaging-app.router',
	'secure-messaging-app.security-service',
	'secure-messaging-app.util',
  	'ui.bootstrap',
  	'underscore'
])

.config(['$httpProvider', function($httpProvider) {
	$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}])

.constant('BASE_API_ENDPOINT', '')

.controller('appController', ['$scope', '$location', 'commonService', 'securityService', function ($scope, $location, commonService, securityService) {
	$scope.updateCurrentActiveLink = function (clickedLink) {
		$scope.currentActiveLink = clickedLink;
	};

	$scope.isCurrentActiveLink = function (link) {
		return $scope.currentActiveLink === link;
	};

	$scope.$on(commonService.EVENT_TYPES.CURRENT_PRINCIPAL_CHANGE_EVENT, function() {
		console.log("***** " + commonService.EVENT_TYPES.CURRENT_PRINCIPAL_CHANGE_EVENT);
		$scope.currentPrincipal = commonService.getProperty(commonService.CURRENT_PRINCIPAL_KEY);
	});

	$scope.getCurrentPrincipal = function() {
		securityService.currentPrincipal();
	};

	$scope.logout = function() {
		securityService.logout();
	};

	$scope.goTo = function(view) {
		$location.path(view);
	};

	var init = function() {
		if($location.path() != '' && $location.path() != '/login') {
			$scope.getCurrentPrincipal();
		}
	};

	init();

}])

.directive('headerDirective', function() {
	return {
		templateUrl : 'assets/js/common/directives/header/header.tpl.html'
  	};
})
;