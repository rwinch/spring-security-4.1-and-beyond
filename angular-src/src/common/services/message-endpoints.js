var endpoints = angular.module('secure-messaging-app.message-resource', ['ngResource']);

endpoints.factory('MessageEndpoint', ['$resource', 'BASE_API_ENDPOINT', 'API_ENDPOINTS', function($resource, BASE_API_ENDPOINT, API_ENDPOINTS) {
	var messages =  {
		inbox : $resource(BASE_API_ENDPOINT + API_ENDPOINTS.message, {}, {
			query: {
				method : 'GET',
				isArray: false
			}
		}),

		sent : $resource(BASE_API_ENDPOINT + API_ENDPOINTS.message + '/sent', {}, {
			query: {
				method : 'GET',
				isArray: false
			}
		})
	};

	return messages;

}]);