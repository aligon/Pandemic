PandemicApp.controller('MainCtrl', ['$scope', 'RegionManager', 'SocketManager', 'DiseaseManager', 'WatchManager', 'StateManager',
	function($scope, RegionManager, SocketManager, DiseaseManager, WatchManager, StateManager) {
		var socket = SocketManager.getConnection();

		$scope.regionsLoaded = false;

		RegionManager.onLoad().then(function(regions) {
			$scope.regionsLoaded = true;
			WatchManager.addRegion('Oklahoma');
			WatchManager.addRegion('Texas');
			WatchManager.addRegion('Kansas');
			WatchManager.addRegion('Colorado');
			StateManager.play();
		}).catch (function(reason) {
			console.error('Failed to load regions:', reason);
		});


		$scope.Disease = DiseaseManager;

		$scope.regions = RegionManager.regions;

		$scope.Watch = WatchManager.watch;

		WatchManager.addUpdate(function(watch) {
			$scope.Watch = watch;
			$scope.$apply();
		});
	}
]);
