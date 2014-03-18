PandemicApp.controller('MainCtrl', ['$scope', 'RegionManager', 'SocketManager', 'DiseaseManager', 'WatchManager',
	function($scope, RegionManager, SocketManager, DiseaseManager, WatchManager) {
		var socket = SocketManager.getConnection();

		$scope.regionsLoaded = false;

		RegionManager.onLoad().then(function(regions) {
			$scope.regionsLoaded = true;
			WatchManager.watch.push(RegionManager.getRegion('Oklahoma'));
		}).catch (function(reason) {
			console.error('Failed to load regions:', reason);
		});


		$scope.Disease = DiseaseManager;

		$scope.regions = RegionManager.regions;

		$scope.Watch = WatchManager.watch;
	}
]);
