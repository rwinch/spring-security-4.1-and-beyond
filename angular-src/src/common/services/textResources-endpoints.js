angular.module('secure-messaging-app.textResources-resource', ['ngResource'])

.factory('TextResourcesBundlesEndpoint', ['$resource', 'BASE_API_ENDPOINT', 'API_ENDPOINTS', function($resource, BASE_API_ENDPOINT, API_ENDPOINTS) {
	var textResource =  {
		resources : $resource(BASE_API_ENDPOINT + API_ENDPOINTS.textResourceBundle + ':bundleVersion/', 
						{
							'bundleVersion' : '@bundleVersion',
							'platform' : 'web',
							'locale' : 'en'
						}),

		versions : $resource(BASE_API_ENDPOINT + API_ENDPOINTS.textResourceBundle + 'versions/'),

		exportResources : $resource(BASE_API_ENDPOINT + API_ENDPOINTS.textResourceBundle + ':bundleVersion/export',
			{
				'bundleVersion' : '@bundleVersion'
			})
	};

	return textResource;
}])

.factory('TextResourcesEndpoint', ['$resource', 'BASE_API_ENDPOINT', 'API_ENDPOINTS', function($resource, BASE_API_ENDPOINT, API_ENDPOINTS) {
	var textResource = $resource(BASE_API_ENDPOINT + API_ENDPOINTS.textResource + ':bundleVersion',
		{
			'bundleVersion' : '@bundleVersion'
		});

	return textResource;
}])

.factory('TextResBackup', ['$resource', 'BASE_API_ENDPOINT', 'API_ENDPOINTS', function($resource, BASE_API_ENDPOINT, API_ENDPOINTS) {
	var textResourceBackup = $resource(BASE_API_ENDPOINT + API_ENDPOINTS.textResource + 'backup', {}, {
		query: {
			method : 'GET'
		}
	});

	return textResourceBackup;
}])

.factory('TextResRestore', ['$resource', 'BASE_API_ENDPOINT', 'API_ENDPOINTS', function($resource, BASE_API_ENDPOINT, API_ENDPOINTS) {
	var textResourceRestore = $resource(BASE_API_ENDPOINT + API_ENDPOINTS.textResource + 'restore');
	return textResourceRestore;
}]);