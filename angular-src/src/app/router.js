'use strict'

var router = angular.module('secure-messaging-app.router', ['ngRoute',
    'controller.message',
  	'controller.textResources',
  	'controller.appConfig'
  ]);


router.config(['$routeProvider', function($routeProvider) {
	$routeProvider

    .when('/inbox', {
        templateUrl : '/app/message/message.tpl.html',
        controller  : 'messageController'
    })

    .when('/appConfig', {
      templateUrl : '/app/appConfig/appConfig.tpl.html',
      controller  : 'appConfigCtrl'
    })

    .when('/textResources', {
      templateUrl : '/app/textResources/textResources.tpl.html',
      controller  : 'textResourcesController'
    })

	.otherwise({redirectTo:'/'});
}]);