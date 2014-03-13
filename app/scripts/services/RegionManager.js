function Region(config) {
	var i, incoming, outgoing, initialState;

	this.population = config.population;
	this.id = config.id;
	this.name = config.name;
	this.connections = {
		incoming: {},
		outgoing: {}
	};

	this.states = [];

	initialState = {
		contactRate: {
			adults: {
				adults: 0,
				minors: 0
			},
			minors: {
				adults: 0,
				minors: 0
			}
		},
		travelRates: {
			incoming: {},
			outgoing: {}
		},
		susceptible: {
			adults: this.population.adults,
			minors: this.population.minors
		},
		exposed: {
			adults: 0,
			minors: 0
		},
		infected: {
			adults: 0,
			minors: 0
		},
		recovered: {
			adults: 0,
			minors: 0
		},
		deceased: {
			adults: 0,
			minors: 0
		}
	};

	incoming = config.connections.incoming;
	outgoing = config.connections.outgoing;

	for (i in incoming) {
		if (incoming.hasOwnProperty(i)) {
			this.connections.incoming[incoming[i]] = 0;
			initialState.travelRates.incoming[incoming[i]] = 0;
		}
	}

	for (i in outgoing) {
		if (outgoing.hasOwnProperty(i)) {
			this.connections.outgoing[outgoing[i]] = 0;
			initialState.travelRates.outgoing[outgoing[i]] = 0;
		}
	}

	this.states.push(initialState);

	this.addState = function(state) {
		this.states.push(state);
	};


	this.getState = function(i) {
		return this.states[i];
	};
}

PandemicApp.service('RegionManager', ['SocketManager', '$q', function(SocketManager, $q) {
	var socket = SocketManager.getConnection(),
		names = {}, me = this, loadPromise = $q.defer();

	me.regions = [];

	socket.addListener('return-region-config', function(data) {
		var i, c = 0;

		for (i in data) {
			if (data.hasOwnProperty(i)) {
				me.regions[c] = new Region(data[i]);
				names[i] = c;
				c++;
			}
		}

		loadPromise.resolve(me.regions);
	}, this);

	socket.addListener('state-update', function(data) {
		var i, c;

		for (i in data) {
			if (data.hasOwnPropety(i)) {
				c = names[i];
				me.regions[c].addState(data[i]);
			}
		}

	});

	socket.emit('request-region-config');

	me.onLoad = function(callback, scope) {
		return loadPromise.promise;
	};

	me.getRegion = function(name) {
		return regions[names[name]];
	};


	me.getStateForServer = function(i) {
		var state = {};

		me.regions.forEach(function(region) {
			state[region.name] = region.getState(i);
		});
	};
}]);
