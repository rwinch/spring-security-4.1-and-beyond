var endpoints = angular.module('secure-messaging-app.appconfig-resource', ['ngResource']);

endpoints.factory('AppConfigEndpoint', ['$resource', 'BASE_API_ENDPOINT', 'API_ENDPOINTS', function($resource, BASE_API_ENDPOINT, API_ENDPOINTS) {
	var appConfigs = $resource(BASE_API_ENDPOINT + API_ENDPOINTS.appConfig + ':appVersion/:profile',
		{
			'appVersion' : '@appVersion',
			'profile' : '@profile'
		}, {
			'update': { method: 'put'},
			'batchSave': {method: 'POST', isArray: true}
		});

	return appConfigs;
}])

.factory('AppConfigBackup', ['$resource', 'BASE_API_ENDPOINT', 'API_ENDPOINTS', function($resource, BASE_API_ENDPOINT, API_ENDPOINTS) {
	var appConfigBackup = $resource(BASE_API_ENDPOINT + API_ENDPOINTS.appConfig + 'backup', {}, {
		query: {
			method : 'GET'
		}
	});

	return appConfigBackup;
}])

.factory('AppConfigRestore', ['$resource', 'BASE_API_ENDPOINT', 'API_ENDPOINTS', function($resource, BASE_API_ENDPOINT, API_ENDPOINTS) {
    var appConfigRestore = $resource(BASE_API_ENDPOINT + API_ENDPOINTS.appConfig + 'restore');
    return appConfigRestore;
}]);