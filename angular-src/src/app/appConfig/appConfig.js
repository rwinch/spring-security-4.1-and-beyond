'use strict'

angular.module('controller.appConfig', [
	'secure-messaging-app.router',
	'secure-messaging-app.misc',
	'secure-messaging-app.pvp-resource',
	'secure-messaging-app.appconfig-resource',
	'ngAnimate',
	'ui.bootstrap'
])

.controller('appConfigCtrl', ['$scope', 'PlatformVersionProfileEndpoint', 'AppConfigEndpoint', 'AppConfigRestore', 'AppConfigBackup', '$uibModal', 'errorService', function ($scope, PlatformVersionProfileEndpoint, AppConfigEndpoint, AppConfigRestore, AppConfigBackup, $uibModal, errorService) {

	$scope.getPlatformVersionProfileList = function() {
		PlatformVersionProfileEndpoint.query().$promise.then(function(data) {
			$scope.updateCurrentPlatform(data[0])
			$scope.data = data;
		});
	};

	$scope.isCurrentActivePlatform = function(platform) {
		return $scope.currentPlatform == platform;
	};

	$scope.isCurrentVersionProfile = function(version, profile) {
		return (($scope.currentVersion == version) && ($scope.currentProfile == profile));
	};

	$scope.updateCurrentPlatform = function(appConfig) {
		$scope.appConfigs = [];
		$scope.currentPlatform = appConfig.platform;
		$scope.currentAppConfigList = appConfig;
	};

	$scope.loadKeys = function(version, profile, platform) {
		$scope.$emit('showSpinner', true);
		$scope.currentVersion = version;
		$scope.currentProfile = profile;

		AppConfigEndpoint.query({
			'appVersion' : version,
			'profile' : profile,
			'platform' : platform
		}).$promise.then(function(data) {
			$scope.$emit('showSpinner', false);
			console.log(data);
			$scope.appConfigs = data;
		});
	};

	$scope.openAppConfigResourceModal = function(appConfig) {
		var appConfigResourceModalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'common/partials/resourceModal.tpl.html',
			controller: 'AppConfigResourceCtrl',
			resolve: {
			modalData: function () {
					var modalData = {
						appConfig : appConfig,
						platform : $scope.currentPlatform,
						version : $scope.currentVersion,
						profile : $scope.currentProfile
					}

			  		return modalData;
				}
			}
	    });

	    appConfigResourceModalInstance.result.then( function(resultAppConfig) {
	    	$scope.loadKeys($scope.currentVersion, $scope.currentProfile, $scope.currentPlatform);
			var appConfigProfileModalInstance = $uibModal.open({
				animation: true,
				templateUrl: 'common/partials/appConfigProfileModal.tpl.html',
				controller: 'AppConfigProfileCtrl',
				resolve: {
					modalData: function () {
						return {
							profiles: $scope.currentAppConfigList.versionProfiles[0].profiles,
							resource: resultAppConfig
						};
					}
				}
			});
	    }, function () {
	    });
	};

	$scope.openAppConfigVersionModal = function () {
		var appConfigVersionModalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'common/partials/appConfigVersionModal.tpl.html',
			controller: 'AppConfigVersionCtrl',
			resolve: {
			modalData: function () {
					var modalData = {
						platform : $scope.currentPlatform
					}
			  		return modalData;
				}
			}
	    });

	    appConfigVersionModalInstance.result.then( function() {
	    	$scope.getPlatformVersionProfileList();
	    }, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
	};

	$scope.backupAppConfig = function () {
		$scope.$emit('showSpinner', true);
		AppConfigBackup.query().$promise.then(function(data) {
			var stringData = JSON.stringify(data.backupData, undefined, 2);
			var blob = new Blob([stringData], {type : 'text/json'});
			$scope.$emit('showSpinner', false);
			saveToLocalFile(blob, 'appconfig_' + data.date + '.backup', 'plain/text');
			errorService.openErrorModal({title : "Success", message : "The application configurations have been backed up in the file:  appconfig_" + data.date + ".backup"});
        }).catch(function (error) {
			console.log(error);
			$scope.$emit('showSpinner', false);
			errorService.openErrorModal({title : "Backup Failure", message : "The application configurations could not be backed up. (" + error.statusText + " #" + error.status + ")"});
		});
	};

	$scope.restoreAppConfig = function() {
		loadFromLocalFile(onLoadedCallback, '*')
	};

	var onLoadedCallback = function(readData) {
		$scope.$emit('showSpinner', true);
		AppConfigRestore.save({}, readData.target.result).$promise.then(function(data) {
			$scope.$emit('showSpinner', false);
			errorService.openErrorModal({title : 'Success', message : 'The application configurations have been successfully restored.'});
		}).catch(function (error) {
			console.log(error);
			$scope.$emit('showSpinner', false);
			var messageBody = (error.status == 400) ? "The applications configuration backup data is incorrect or corrupted. Please try with a different file." : "The application configurations could not be restored.";
			errorService.openErrorModal({title : "Restore Failure", message : messageBody + " (" + error.statusText + " #" + error.status + ")"});
		});
	};

	var init = function() {
		$scope.getPlatformVersionProfileList();
	};

	init();
}])

.controller('AppConfigResourceCtrl', ['$scope', '$uibModalInstance', 'modalData', 'AppConfigEndpoint', 'errorService', function($scope, $uibModalInstance, modalData, AppConfigEndpoint, errorService) {

	$scope.resource = modalData.appConfig == undefined ? {} : {
		createdOn: modalData.appConfig.createdOn,
		id: modalData.appConfig.id,
		key: modalData.appConfig.key,
		platform: modalData.appConfig.platform,
		profile: modalData.appConfig.profile,
		value: modalData.appConfig.value,
		version: modalData.appConfig.version
	};

	$scope.modalData = modalData;

	$scope.isPostCall = function() {
		return modalData.appConfig == undefined;
	}

	$scope.ok = function() {
		$scope.$emit('showSpinner', true);
		$scope.resource.value = $scope.resourceValue;
		$scope.resource.platform = $scope.modalData.platform;
		if ($scope.isPostCall()) {
			$scope.resource.key = $scope.resourceKey;
			AppConfigEndpoint.save({
				appVersion : $scope.modalData.version,
				profile : $scope.modalData.profile,
			}, $scope.resource)
			.$promise
				.then(function(result) {
					$scope.$emit('showSpinner', false);
					$uibModalInstance.close(result);
				})
				.catch(function(error) {
					$scope.$emit('showSpinner', false);
					console.log(error);
					$uibModalInstance.close();

					var errorTitle = "Add Key Failure";
					var errorMsg = "Failed to add a app config new key. (" + error.statusText + " #" + error.status + ")";
					errorService.openErrorModal({title : errorTitle, message : errorMsg});
			});
		} else {
			AppConfigEndpoint.update({
				appVersion : $scope.modalData.version,
				profile : $scope.modalData.profile,
			}, $scope.resource)
			.$promise
				.then(function(result) {
					$scope.$emit('showSpinner', false);
					$uibModalInstance.close(result);
				})
				.catch(function(error) {
					$scope.$emit('showSpinner', false);
					console.log(error);
					$uibModalInstance.close();

					var errorTitle = "Update Failure";
					var errorMsg = "Failed to update the app config value. (" + error.statusText + " #" + error.status + ")";
					errorService.openErrorModal({title : errorTitle, message : errorMsg });
				});
		}
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	}

	$scope.headerMsg = $scope.isPostCall() ? "ADD A NEW KEY" : "ADD A NEW VALUE";
}])

.controller('AppConfigVersionCtrl',  ['$scope', '$uibModalInstance', 'modalData', 'AppConfigEndpoint', function($scope, $uibModalInstance, modalData, AppConfigEndpoint) {
	$scope.modalData = modalData;
	
	$scope.ok = function() {
		$scope.$emit('showSpinner', true);
		$scope.modalData.profile = $scope.appConfigProfile;
		$scope.modalData.version = $scope.appConfigVersion;
		$scope.modalData.key = $scope.appConfigKey;
		$scope.modalData.value = $scope.appConfigValue;

		AppConfigEndpoint.save({
			appVersion : $scope.modalData.version,
			profile : $scope.modalData.profile,
		}, $scope.modalData)
		.$promise.then(function(result) {
			$scope.$emit('showSpinner', false);
			$uibModalInstance.close(result);
		});
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
}])

.controller('AppConfigProfileCtrl',  ['$scope', '$uibModalInstance', 'modalData', 'AppConfigEndpoint', function($scope, $uibModalInstance, modalData, AppConfigEndpoint) {
	$scope.modalData = modalData;
	$scope.profiles = _.reject(modalData.profiles, function(profile) {
		return profile == modalData.resource.profile;
	});

	var finalProfiles = [];
	var data = {};
	var postData = [];

	$scope.selectAll = false;

	$scope.selectAllProfiles = function () {
		$scope.selectAll = !$scope.selectAll;
		$scope.profileCheckboxModel = $scope.selectAll;
		if ($scope.selectAll == true) {
			_.each($scope.profiles, function(profile) {
				finalProfiles.push(profile);
			});
		} else {
			finalProfiles = [];
		}
	};

	$scope.toggleFinalProfileList = function(profile) {
		_.contains(finalProfiles, profile) ? finalProfiles = _.without(finalProfiles, profile) : finalProfiles.push(profile);
	};

	var setUpPostData = function() {
		_.each(finalProfiles, function(profile){
			data = {
				key: modalData.resource.key,
				platform: modalData.resource.platform,
				profile: profile,
				value: modalData.resource.value,
				version: modalData.resource.version
			}
			postData.push(data);
		});
	};

	$scope.ok = function() {
		$scope.$emit('showSpinner', true);
		setUpPostData();
		AppConfigEndpoint.batchSave({
			appVersion : modalData.resource.version
		}, postData)
		.$promise.then(function(result) {
				$scope.$emit('showSpinner', false);
			$uibModalInstance.close(result);
		})
		.catch(function(error) {
			$scope.$emit('showSpinner', false);
			$uibModalInstance.close();
		});
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
}]);