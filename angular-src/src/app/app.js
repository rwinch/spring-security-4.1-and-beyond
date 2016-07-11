'use strict';

angular.module('secure-messaging-app', [
  	'secure-messaging-app.router',
	'secure-messaging-app.misc',
  	'ui.bootstrap',
  	'underscore'
])

.constant('BASE_API_ENDPOINT', '/')

.constant('API_ENDPOINTS', {
	message: 'messages/',
	appConfig: 'app-configs/',
	textResourceBundle: 'text-resource-bundles/',
	textResource: 'text-resources/'
})

.controller('appController', ['$scope', function ($scope) {
	$scope.updateCurrentActiveLink = function (clickedLink) {
		$scope.currentActiveLink = clickedLink;
	};

	$scope.isCurrentActiveLink = function (link) {
		return $scope.currentActiveLink === link;
	};

	$scope.$on('showSpinner', function (event, data) {
		$scope.showLoadingSpinner = data;
	});
}])

.directive('headerDirective', function() {
	return {
		templateUrl : 'common/directives/header/header.tpl.html'
  	};
});