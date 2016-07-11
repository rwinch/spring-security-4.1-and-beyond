'use strict';

angular.module('controller.textResources', [
	'secure-messaging-app.textResources-resource',
	'secure-messaging-app.misc',
	'ngAnimate',
	'ui.bootstrap'
])

.controller('textResourcesController', ['$scope', 'TextResourcesBundlesEndpoint', 'TextResourcesEndpoint', 'TextResBackup', 'TextResRestore', '$uibModal', 'errorService', function ($scope, TextResourcesBundlesEndpoint, TextResourcesEndpoint, TextResBackup, TextResRestore, $uibModal, errorService) {
	$scope.getVersionList = function() {
		TextResourcesBundlesEndpoint.versions.query().$promise.then(function(data) {
			$scope.versions = data;
		});	
	};

	$scope.isCurrentVersion = function(version) {
		return $scope.currentVersion === version;
	}

	$scope.getTextResources = function(version) {
		$scope.$emit('showSpinner', true);
		TextResourcesBundlesEndpoint.resources.get({
			'bundleVersion' : version
		}).$promise.then(function(data) {
			$scope.currentVersion = version;
			$scope.versionTextResources = data.textResources;

			TextResourcesBundlesEndpoint.resources.get({
				'bundleVersion' : version,
				'revision' : 0
			}).$promise.then(function(diffData) {
				$scope.filterInitialTextResourceResult(diffData.textResources);
				$scope.$emit('showSpinner', false);
			});
		});
	};

	//TODO: move this logic onto the Spring app
	$scope.filterInitialTextResourceResult = function(diffData) {
		var result = $scope.versionTextResources;
		var replace = $scope.versionTextResources.filter(function(textResource) {
			return _.find(diffData, function(obj) {
				return obj.id === textResource.id;
			});
		});
		if (replace.length > 0) {
			replace.forEach(function(resource) {
				var index = result.indexOf(resource);
				result.splice(index, 1);
			});

			diffData.forEach(function(resource) {
				result.push(resource);
			});

			$scope.versionTextResources = result;
		}
	}

	$scope.openTextResourceModal = function(textResource) {
		var appConfigResourceModalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'common/partials/resourceModal.tpl.html',
			controller: 'TextResourceCtrl',
			resolve: {
			modalData: function () {
					var modalData = {
						textResource : textResource,
						version : $scope.currentVersion
					}
			  	
			  		return modalData;
				}
			}
	    });

	    appConfigResourceModalInstance.result.then( function(resultTextResource) {
	    	$scope.currentVersion = $scope.printMajorMinorFromResource(resultTextResource);
	    	$scope.getTextResources($scope.currentVersion);
	    }, function () {
	      	console.log('Modal dismissed at: ' + new Date());
	    });
	};

	$scope.printFullVersionFromResource = function(resource) {
		if (resource != null) {
			var versionObj = resource.version;
			return versionObj.major + '.' + versionObj.minor + '.' + versionObj.revision;
		}
	};

	$scope.printMajorMinorFromResource = function(resource) {
		if (resource != null) {
			var versionObj = resource.version;
			return versionObj.major + '.' + versionObj.minor;
		}
	};

	$scope.backupTextRes = function () {
		$scope.$emit('showSpinner', true);
		TextResBackup.query().$promise.then(function(data) {
			var stringData = JSON.stringify(data.backupData, undefined, 2);
			var blob = new Blob([stringData], {type : 'plain/json'});
			$scope.$emit('showSpinner', false);
			saveToLocalFile(blob, 'textres_' + data.date + '.backup','plain/text');
			errorService.openErrorModal({title : "Success", message : "The text resources have been backed up in the file:  textres_" + data.date + ".backup"});
		}).catch(function (error) {
			console.log(error);
			$scope.$emit('showSpinner', false);
			errorService.openErrorModal({title : "Backup Failure", message : "The text resources could not be backed up. (" + error.statusText + " #" + error.status + ")"});
		});
	};

	$scope.restoreTextRes = function() {
		loadFromLocalFile(onLoadedCallback, '*')
	};

	$scope.exportTextRes = function(version) {
		$scope.$emit('showSpinner', true);
		TextResourcesBundlesEndpoint.exportResources.get({
			bundleVersion : version
		}).$promise.then(function(data) {
			$scope.$emit('showSpinner', false);
			var blob = new Blob([data.exportData], {type: 'text/csv'});
			var fileVersion = version.replace(".","_");
			saveToLocalFile(blob, 'exportedTextRes_' + fileVersion + '_' + data.date + '.csv','text/csv');
			errorService.openErrorModal({title : "Success", message : "The text resources have been exported to the file: exportedTextRes_" + fileVersion + "_" + data.date + ".csv"});
		}).catch(function (error) {
			console.log(error);
			$scope.$emit('showSpinner', false);
			errorService.openErrorModal({title : "Export Failure", message : "The text resources could not be exported. (" + error.statusText + " #" + error.status + ")"});
		});
	};

	var onLoadedCallback = function(fileReaderEvent) {
		$scope.$emit('showSpinner', true);
		TextResRestore.save({}, fileReaderEvent.target.result).$promise.then(function(data) {
			$scope.$emit('showSpinner', false);
			errorService.openErrorModal({title : 'Success', message : 'The text resources have been successfully restored.'});
		}).catch(function (error) {
			console.log(error);
			$scope.$emit('showSpinner', false);
			var messageBody = (error.status == 400) ? "The text resource backup data is incorrect or corrupted. Please try with a different file." : "The text resources could not be restored.";
			errorService.openErrorModal({title : "Restore Failure", message : messageBody + " (" + error.statusText + " #" + error.status + ")"});
		});
	};

	var init = function() {
		$scope.versions = [];
		$scope.versionTextResources = [];
		$scope.getVersionList();
	};

	init();

}])

.controller('TextResourceCtrl', ['$scope', '$uibModalInstance', 'modalData', 'TextResourcesEndpoint', 'errorService', function($scope, $uibModalInstance, modalData, TextResourcesEndpoint, errorService) {
	$scope.isPostCall = function() {
		return modalData.textResource == undefined;
	}

	$scope.ok = function() {
		$scope.$emit('showSpinner', true);

		$scope.resource.key = $scope.isPostCall() ? $scope.resourceKey : $scope.resource.key;
		$scope.modalData.version = $scope.isPostCall() ? $scope.resourceVersion : $scope.modalData.version;
		$scope.resource.value = $scope.resourceValue;

		TextResourcesEndpoint.save({
			bundleVersion : $scope.modalData.version
		}, $scope.resource)
		.$promise.then(function(result) {
			$scope.$emit('showSpinner', false);
			$uibModalInstance.close(result);
		})
		.catch(function(error) {
			$scope.$emit('showSpinner', false);
			console.log(error);
			$uibModalInstance.close();

			var errorTitle = $scope.isPostCall() ? "Add Text Resource Failure" : "Update Failure";
			var errorMsg = ($scope.isPostCall() ? "Failed to add a new text resource. (" : "Failed to update a text resource. (") + error.statusText + " #" + error.status + ")";
			errorService.openErrorModal({title : errorTitle, message : errorMsg});
		});
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	}

	$scope.headerMsg = $scope.isPostCall() ? "ADD A NEW KEY" : "ADD A NEW VALUE";
	$scope.resource = $scope.isPostCall() ? {} : {
		id: modalData.textResource.id,
		key: modalData.textResource.key,
		locale: modalData.textResource.locale,
		version: modalData.textResource.version
	}; //Javascript will only shallow copy, thus any changes made for the network call will reflect in the UI before the call actually returns
	//TODO: Clone text resource object more cleanly

	$scope.modalData = modalData;
}])