PandemicApp.controller('MainCtrl', ['$scope', 'RegionManager', 'SocketManager', 'DiseaseManager', 'WatchManager', 'StateManager',
	function($scope, RegionManager, SocketManager, DiseaseManager, WatchManager, StateManager) {
		var socket = SocketManager.getConnection();

		$scope.regionsLoaded = false;

		RegionManager.onLoad().then(function(regions) {
			$scope.regionsLoaded = true;
			WatchManager.watch.push(RegionManager.getRegion('Oklahoma'));
			StateManager.play();
		}).catch (function(reason) {
			console.error('Failed to load regions:', reason);
		});


		$scope.Disease = DiseaseManager;

		$scope.regions = RegionManager.regions;

		$scope.Watch = WatchManager.watch;
	}
]);
