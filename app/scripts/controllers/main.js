PandemicApp.controller('DiseaseCtrl', [
	'$scope', '$modalInstance', 'DiseaseManager',
	function($scope, $modalInstance, DiseaseManager) {
		$scope.Disease = DiseaseManager;
		$scope.ok = function() {
			$modalInstance.close();
		};
	}
]);

PandemicApp.controller('RegionCtrl', [
	'$scope', '$modalInstance', 'Region',
	function($scope, $modalInstance, Region) {
		$scope.region = Region;
		$scope.ok = function() {
			$modalInstance.close();
		};
	}
]);

PandemicApp.controller('HelpCtrl', ['$scope', '$modalInstance',
	function($scope, $modalInstance) {
		$scope.ok = function() {
			$modalInstance.close();
		};
	}
]);

PandemicApp.controller('MainCtrl', [
	'$scope', 'RegionManager', 'SocketManager',
	'DiseaseManager', 'WatchManager', 'StateManager',
	'$modal',
	function($scope, RegionManager, SocketManager, DiseaseManager, WatchManager, StateManager, $modal) {
		var socket = SocketManager.getConnection(), already = false;

		$scope.regionsLoaded = false;

		RegionManager.onLoad().then(function(regions) {
			$scope.regionsLoaded = true;
			// WatchManager.addRegion('Oklahoma');
			// WatchManager.addRegion('Texas');
			// WatchManager.addRegion('Kansas');
			// WatchManager.addRegion('Colorado');
			//StateManager.play();
		}).catch (function(reason) {
			console.error('Failed to load regions:', reason);
		});

		$scope.regions = RegionManager.regions;

		$scope.Watch = WatchManager.watch;

		$scope.addWatch = WatchManager.addRegion;

		WatchManager.addUpdate(function(watch) {
			$scope.Watch = watch;

			if (!$scope.$$phase) {
				$scope.$apply();
			}
		});

		$scope.openDisease = function() {
			var modelInstance = $modal.open({
				templateUrl: 'views/Disease.html',
				controller: 'DiseaseCtrl',
				resolve: {
					DiseaseManager: function() {
						return DiseaseManager;
					}
				}
			});
		};

		$scope.openRegion = function(name) {
			var modelInstance = $modal.open({
					templateUrl: 'views/RegionPopup.html',
					controller: 'RegionCtrl',
					resolve: {
						Region: function() {
							return RegionManager.getRegion(name);
						}
					}
				});
		};

		$scope.openHelp = function(name) {
			var modelInstance = $modal.open({
				templateUrl: 'views/Help.html',
				controller: 'HelpCtrl'
			});
		};
	}
]);
