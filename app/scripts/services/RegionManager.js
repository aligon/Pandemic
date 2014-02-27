PandemicApp.service('RegionManager', ['SocketManager', '$http', function(SocketManager, $http) {
	var socket = SocketManager.getConnection();

	socket.addListener('return-region-config', function(data) {
		console.log('region-config-received', data);
	}, this);

	socket.emit('request-region-config');
}]);
