'use strict'

angular.module('secure-messaging-app.message-controllers', [
	'secure-messaging-app.message-service',
	'secure-messaging-app.user-service',
	'secure-messaging-app.router',
	'secure-messaging-app.util',
	'ngAnimate',
	'underscore',
	'ui.bootstrap'
])

.controller('inboxMessagesController', ['$scope', '$rootScope', '$location', 'messageEndpoints', 'messageService', 'commonService', function ($scope, $rootScope, $location, messageEndpoints, messageService, commonService) {

	$scope.messageListType = "Inbox";

	$scope.viewMessage = function(message) {
		messageService.viewMessage(message);
	};

	$scope.deleteMessage = function(message) {
		messageService.deleteMessage(message, function(message, deleted) {
			if (deleted) {
				$scope.messages = _.reject($scope.messages, function(msg) {
					return msg.id == message.id
				});
			}
		});
	};

	$scope.getMessages = function() {
		messageEndpoints.inbox.query().$promise.then(function(data) {
			$scope.messages = data;
		});
	};

	var init = function() {
		$scope.getMessages();
	};

	init();
}])

.controller('sentMessagesController', ['$scope', '$rootScope', '$location', 'messageEndpoints', 'messageService', 'commonService', function ($scope, $rootScope, $location, messageEndpoints, messageService, commonService) {

	$scope.messageListType = "Sent";

	$scope.viewMessage = function(message) {
		messageService.viewMessage(message);
	};

	$scope.deleteMessage = function(message) {
		messageService.deleteMessage(message, function(message, deleted) {
			if (deleted) {
				$scope.messages = _.reject($scope.messages, function(msg) {
					return msg.id == message.id
				});
			}
		});
	};

	$scope.getMessages = function() {
		messageEndpoints.sent.query().$promise.then(function(data) {
			$scope.messages = data;
		});
	};

	var init = function() {
		$scope.getMessages();
	};

	init();
}])

.controller('viewMessageController', ['$scope', 'commonService', function ($scope, commonService) {

	$scope.$on(commonService.EVENT_TYPES.CURRENT_MESSAGE_CHANGE_EVENT, function() {
		console.log("***** " + commonService.EVENT_TYPES.CURRENT_MESSAGE_CHANGE_EVENT);
		$scope.currentMessage = commonService.getProperty(commonService.CURRENT_MESSAGE_KEY);
	});

	var init = function() {
		$scope.currentMessage = commonService.getProperty(commonService.CURRENT_MESSAGE_KEY);
	};

	init();
}])

.controller('composeMessageController', ['$scope', '$rootScope', '$location', 'userEndpoint', 'messageEndpoints', 'messageService', 'commonService', function ($scope, $rootScope, $location, userEndpoint, messageEndpoints, messageService, commonService) {

	$scope.getAllUsers = function() {
		userEndpoint.query().$promise.then(function(data) {
			$scope.users = data;
		});
	};

	$scope.sendMessage = function() {
		console.log("***** Send Message: " + $scope.newMessage);
		messageEndpoints.resource.save({}, $scope.newMessage)
			.$promise
			.then(function(result) {
				console.log("***** Message Sent: " + result);
				$location.path('/sent');
			})
			.catch(function(error) {
				console.log("***** Error Sending Message: " + error);
			});

	};

	var init = function() {
		$scope.newMessage = {};
		$scope.getAllUsers();
	};

	init();
}]);
