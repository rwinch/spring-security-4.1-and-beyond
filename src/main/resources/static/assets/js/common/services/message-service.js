'use strict';

angular.module('secure-messaging-app.message-service', [
	'secure-messaging-app.util',
	'ngResource'
])

.factory('messageEndpoints', ['$resource', 'BASE_API_ENDPOINT', function($resource, BASE_API_ENDPOINT) {
	var messageEndpoints =  {
		resource : $resource(BASE_API_ENDPOINT + 'messages/:id', { id : '@id' }),

		inbox : $resource(BASE_API_ENDPOINT + 'messages/inbox', {}, {
			query: {
				method : 'GET',
				isArray: true
			}
		}),

		sent : $resource(BASE_API_ENDPOINT + 'messages/sent', {}, {
			query: {
				method : 'GET',
				isArray: true
			}
		})

	};

	return messageEndpoints;

}])

.factory('messageService', ['$rootScope', '$location', 'commonService', function ($rootScope, $location, commonService) {
	var viewMessage = function(message) {
		console.log("***** View Message: " + message);
		commonService.setProperty(commonService.CURRENT_MESSAGE_KEY, message);
		$rootScope.$broadcast(commonService.EVENT_TYPES.CURRENT_MESSAGE_CHANGE_EVENT);
		$location.path('/view');
	};

	return {
		viewMessage: viewMessage
	}
}])
;
