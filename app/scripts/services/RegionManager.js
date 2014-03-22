function Region(config) {
	var i, incoming, outgoing, initialState, outCount = 0,
		CONNECTION_CONST = 0.05, me = this;

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
			adults: 100000,
			minors: 100000
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
	outCount = outgoing.length;
	for (i in outgoing) {
		if (outgoing.hasOwnProperty(i)) {
			this.connections.outgoing[outgoing[i]] = CONNECTION_CONST * (this.population.adults / outCount);
			initialState.travelRates.outgoing[outgoing[i]] = CONNECTION_CONST * (this.population.adults / outCount);
		}
	}

	this.states.push(initialState);

	this.initConnections = function(getRegion) {
		var me = this, i,
			incoming = me.connections.incoming;

		for (i in incoming) {
			if (incoming.hasOwnProperty(i)) {
				incoming[i] = CONNECTION_CONST * getRegion(i).getOutGoing();
			}
		}

		initialState.travelRates.incoming = incoming;
	};

	this.getOutGoing = function() {
		return CONNECTION_CONST * (this.population.adults / outCount);
	};

	this.addState = function(state) {
		var latest = this.getLatestState();

		if (!state.contactRate) {
			state.contactRate = latest.contactRate;
		}

		if (!state.travelRates) {
			state.travelRates = latest.travelRates;
		}

		this.states.push(state);
		this.latestState = state;
		updateCurrent(state);
	};

	function updateCurrent(state) {
		var colorMap = {
				'Susceptible': '#D1DE1F',
				'Exposed': '#DE8B1F',
				'Infected': '#D61C1C',
				'Recovered': '#18C418',
				'Deceased': 'black'
			},
			sus = state.susceptible.adults + state.susceptible.minors,
			exp = state.exposed.adults + state.exposed.minors,
			inf = state.infected.adults + state.infected.minors,
			rec = state.recovered.adults + state.recovered.minors,
			dec = state.deceased.adults + state.deceased.minors,
			total = sus + exp + inf + rec + dec;

		me.currentState = state;

		me.chartsData.watch.pie.data = [
			{
				name: 'Susceptible',
				color: colorMap.Susceptible,
				value: sus,
				perc: Math.round(((sus / total) * 100) * 100) / 100
			},
			{
				name: 'Exposed',
				color: colorMap.Exposed,
				value: exp,
				perc: Math.round(((exp / total) * 100) * 100) / 100
			},
			{
				name: 'Infected',
				color: colorMap.Infected,
				value: inf,
				perc: Math.round(((inf / total) * 100) * 100) / 100
			},
			{
				name: 'Recovered',
				color: colorMap.Recovered,
				value: rec,
				perc: Math.round(((rec / total) * 100) * 100) / 100
			},
			{
				name: 'Deceased',
				color: colorMap.Deceased,
				value: dec,
				perc: Math.round(((dec / total) * 100) * 100) / 100
			}
		];
	}


	this.getState = function(i) {
		return this.states[i];
	};

	this.resetToState = function(i) {
		this.states = this.states.slice(0, i);
		this.latestState = this.getLatestState();
		updateCurrent(this.latestState);
	};

	this.previewState = function(i) {
		this.currentState = this.getState(i);
	};

	this.getLatestState = function() {
		return this.states[this.states.length - 1];
	};

	this.getPercantage = function() {
		var totalPop = this.population.adults + this.population.minors,
			totalDec = this.currentState.deceased.adults + this.currentState.deceased.minors;

		return totalDec / totalPop;
	};

	this.latestState = initialState;
	this.chartsData = {
		watch: {
			pie: {
				options: {
					animateRotate: false,
					segmentStrokeColor: '#d3d3d3',
					strokeSegmentWidth: 1
				},
				data: []
			}
		}
	};

	updateCurrent(initialState);
}

PandemicApp.service('RegionManager', ['SocketManager', '$q', function(SocketManager, $q) {
	var socket = SocketManager.getConnection(),
		names = {}, ids = {}, me = this, loadPromise = $q.defer();

	me.regions = [];

	socket.addListener('return-region-config', function(data) {
		var i, c = 0;

		for (i in data) {
			if (data.hasOwnProperty(i)) {
				me.regions[c] = new Region(data[i]);
				names[i] = c;
				ids[data[i].id] = c;
				c++;
			}
		}

		me.regions.forEach(function(region) {
			region.initConnections(me.getRegion);
		});

		loadPromise.resolve(me.regions);

		callUpdates();
	}, this);

	socket.emit('request-region-config');

	function callUpdates() {
		if (me.mapUpdateFn) {
			me.mapUpdateFn.call();
		}

		if (me.watchUpdateFn) {
			me.watchUpdateFn.call();
		}
	}

	me.applyState = function(data) {
		var i, c;

		for (i in data) {
			if (data.hasOwnProperty(i)) {
				c = names[i];
				me.regions[c].addState(data[i]);
			}
		}

		callUpdates();
	};

	me.previewState = function(i) {
		me.regions.forEach(function(region) {
			region.previewState(i);
		});

		callUpdates();
	};

	me.onLoad = function(callback, scope) {
		return loadPromise.promise;
	};

	me.getRegion = function(name) {
		return me.regions[names[name]];
	};

	me.getRegionId = function(id) {
		return me.regions[ids['#' + id]];
	};

	me.getState = function(i) {
		var state = {};

		me.regions.forEach(function(region) {
			state[region.name] = region.getState(i);
		});

		return state;
	};

	me.getLatestState = function() {
		var state = {};

		me.regions.forEach(function(region) {
			state[region.name] = region.getLatestState();
		});

		return state;
	};

	me.addMap = function(updateFn) {
		me.mapUpdateFn = updateFn;
		me.mapUpdateFn.call();
	};

	me.addWatch = function(updateFn) {
		me.watchUpdateFn = updateFn;
		me.watchUpdateFn.call();
	};
}]);
