function Region(config) {
	var i, incoming, outgoing;

	this.population = config.population;
	this.id = config.id;
	this.name = config.name;
	this.connections = {
		incoming: {},
		outgoing: {}
	};

	incoming = config.connections.incoming;
	outgoing = config.connections.outgoing;

	for (i in incoming) {
		if (incoming.hasOwnProperty(i)) {
			this.connections.incoming[incoming[i]] = 0;
		}
	}

	for (i in outgoing) {
		if (outgoing.hasOwnProperty(i)) {
			this.connections.outgoing[outgoing[i]] = 0;
		}
	}
}

PandemicApp.service('RegionManager', ['SocketManager', '$http', function(SocketManager, $http) {
	var socket = SocketManager.getConnection(),
		names = {}, c = 0;

	this.regions = [];

	socket.addListener('return-region-config', function(data) {
		var i;

		for (i in data) {
			if (data.hasOwnProperty(i)) {
				regions[c] = new Region(data[i]);
				names[i] = c;
				c++;
			}
		}
	}, this);

	socket.emit('request-region-config');

	this.getRegion = function(name) {
		return regions[names[name]];
	};
}]);
