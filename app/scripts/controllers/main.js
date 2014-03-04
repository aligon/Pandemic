PandemicApp.controller('MainCtrl', ['$scope', 'RegionManager', 'SocketManager', function($scope, RegionManager, SocketManager) {
	var socket = SocketManager.getConnection();

	$scope.regionsLoaded = false;

	RegionManager.onLoad().then(function(regions) {
		$scope.regionsLoaded = true;
	}).catch(function(reason) {
		console.error('Failed to load regions:', reason);
	});
}]);
