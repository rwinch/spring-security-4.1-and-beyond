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

.factory('messageService', ['$rootScope', '$location', 'messageEndpoints', 'commonService', function ($rootScope, $location, messageEndpoints, commonService) {
	var viewMessage = function(message) {
		console.log("***** View Message: " + message);
		commonService.setProperty(commonService.CURRENT_MESSAGE_KEY, message);
		$rootScope.$broadcast(commonService.EVENT_TYPES.CURRENT_MESSAGE_CHANGE_EVENT);
		$location.path('/view');
	};

	var deleteMessage = function(message, callback) {
		console.log("***** Delete Message: " + message);
		messageEndpoints.resource.delete({ id: message.id })
			.$promise
			.then(function(result) {
				console.log("***** Message Deleted: " + result);
				commonService.setProperty(commonService.CURRENT_MESSAGE_KEY, null);
				$rootScope.$broadcast(commonService.EVENT_TYPES.CURRENT_MESSAGE_CHANGE_EVENT);
				callback(message, true);
			})
			.catch(function(error) {
				console.log("***** Error Deleting Message: " + error);
				callback(message, false);
			});
	};

	return {
		viewMessage: viewMessage,
		deleteMessage: deleteMessage
	}
}])
;
