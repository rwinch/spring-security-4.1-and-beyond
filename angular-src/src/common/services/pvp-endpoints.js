var endpoints = angular.module('secure-messaging-app.pvp-resource', ['ngResource']);

endpoints.factory('PlatformVersionProfileEndpoint', ['$resource', 'BASE_API_ENDPOINT', 'API_ENDPOINTS', function($resource, BASE_API_ENDPOINT, API_ENDPOINTS) {
	var versionProfile = $resource(BASE_API_ENDPOINT + API_ENDPOINTS.appConfig + 'platform-version-profiles', {}, {
		query: {
			method : 'GET',
			isArray: false
			}
	});
	
	return versionProfile;
}]);