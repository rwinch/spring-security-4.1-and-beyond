'use strict';

angular.module('secure-messaging-app.security-service', [
	'secure-messaging-app.util',
	'ngResource'
])

.factory('securityEndpoints', ['$resource', 'BASE_API_ENDPOINT', function($resource, BASE_API_ENDPOINT) {
	var securityEndpoints =  {
		currentPrincipal : $resource(BASE_API_ENDPOINT + 'principal', {}, {
			query: {
				method : 'GET',
				isArray: false
			}
		}),

		logout : $resource(BASE_API_ENDPOINT + 'logout')
	};

	return securityEndpoints;

}])

.factory('securityService', ['$rootScope', '$location', 'securityEndpoints', 'commonService', function ($rootScope, $location, securityEndpoints, commonService) {
	var currentPrincipal = function() {
		console.log("***** Current Principal");
		securityEndpoints.currentPrincipal.query()
			.$promise
			.then(function(result) {
				console.log("***** Current Principal: " + result);
				commonService.setProperty(commonService.CURRENT_PRINCIPAL_KEY, result);
				$rootScope.$broadcast(commonService.EVENT_TYPES.CURRENT_PRINCIPAL_CHANGE_EVENT);
			})
			.catch(function(error) {
				console.log("***** Error Current Principal: " + error);
			});
	};

	var logout = function() {
		console.log("***** Logout");
		securityEndpoints.logout.save()
			.$promise
			.then(function(result) {
				console.log("***** Logout Success: " + result);
				commonService.setProperty(commonService.CURRENT_PRINCIPAL_KEY, null);
				$rootScope.$broadcast(commonService.EVENT_TYPES.CURRENT_PRINCIPAL_CHANGE_EVENT);
				window.location.href = "/";
			})
			.catch(function(error) {
				console.log("***** Logout Failed: " + error);
			});
	};

	return {
		currentPrincipal: currentPrincipal,
		logout: logout
	}
}])
;