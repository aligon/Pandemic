function Region(config) {
	var i, incoming, outgoing, initialState, outCount = 0,
		CONNECTION_CONST = 0.05, me = this, chartOptions;

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
			this.connections.outgoing[outgoing[i]] = Math.round(CONNECTION_CONST * (this.population.adults / outCount));
			initialState.travelRates.outgoing[outgoing[i]] = Math.round(CONNECTION_CONST * (this.population.adults / outCount));
		}
	}

	this.states.push(initialState);

	this.initConnections = function(getRegion) {
		var me = this, i,
			incoming = me.connections.incoming;

		for (i in incoming) {
			if (incoming.hasOwnProperty(i)) {
				incoming[i] = Math.round(getRegion(i).getOutGoing());
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

	function updateWatch(state) {
		var sus = state.susceptible.adults + state.susceptible.minors,
			exp = state.exposed.adults + state.exposed.minors,
			inf = state.infected.adults + state.infected.minors,
			rec = state.recovered.adults + state.recovered.minors,
			dec = state.deceased.adults + state.deceased.minors,
			total = sus + exp + inf + rec + dec;

		me.chartsData.watch.pie.data = [
			{
				name: 'Susceptible',
				color: chartOptions.colorMap.Susceptible,
				value: sus,
				perc: Math.round(((sus / total) * 100) * 100) / 100
			},
			{
				name: 'Exposed',
				color: chartOptions.colorMap.Exposed,
				value: exp,
				perc: Math.round(((exp / total) * 100) * 100) / 100
			},
			{
				name: 'Infected',
				color: chartOptions.colorMap.Infected,
				value: inf,
				perc: Math.round(((inf / total) * 100) * 100) / 100
			},
			{
				name: 'Recovered',
				color: chartOptions.colorMap.Recovered,
				value: rec,
				perc: Math.round(((rec / total) * 100) * 100) / 100
			},
			{
				name: 'Deceased',
				color: chartOptions.colorMap.Deceased,
				value: dec,
				perc: Math.round(((dec / total) * 100) * 100) / 100
			}
		];
	}

	function updatePopupPopulation(state) {
		var sus = state.susceptible,
			susTotal = sus.adults + sus.minors,
			exp = state.exposed,
			expTotal = exp.adults + exp.minors,
			inf = state.infected,
			infTotal = inf.adults + inf.minors,
			rec = state.recovered,
			recTotal = rec.adults + rec.minors,
			dec = state.deceased,
			decTotal = dec.adults + dec.minors,
			minorTotal = sus.minors + exp.minors + inf.minors + rec.minors + dec.minors,
			adultTotal = sus.adults + exp.adults + inf.adults + rec.adults + dec.adults,
			total = minorTotal + adultTotal;

		me.chartsData.popup.population.total.data = [
			{
				name: 'Adults',
				color: chartOptions.colorMap.Susceptible,
				value: adultTotal,
				perc: Math.round(((adultTotal / total) * 100) * 100) / 100
			},
			{
				name: 'Minors',
				color: chartOptions.colorMap.Exposed,
				value: minorTotal,
				perc: Math.round(((minorTotal / total) * 100) * 100) / 100
			}
		];

		me.chartsData.popup.population.percentTotal.data = [
			{
				name: 'Susceptible',
				color: chartOptions.colorMap.Susceptible,
				value: susTotal,
				perc: Math.round(((susTotal / total) * 100) * 100) / 100
			},
			{
				name: 'Exposed',
				color: chartOptions.colorMap.Exposed,
				value: expTotal,
				perc: Math.round(((expTotal / total) * 100) * 100) / 100
			},
			{
				name: 'Infected',
				color: chartOptions.colorMap.Infected,
				value: infTotal,
				perc: Math.round(((infTotal / total) * 100) * 100) / 100
			},
			{
				name: 'Recovered',
				color: chartOptions.colorMap.Recovered,
				value: recTotal,
				perc: Math.round(((recTotal / total) * 100) * 100) / 100
			},
			{
				name: 'Deceased',
				color: chartOptions.colorMap.Deceased,
				value: decTotal,
				perc: Math.round(((decTotal / total) * 100) * 100) / 100
			}
		];

		me.chartsData.popup.population.percentAdults.data = [
			{
				name: 'Susceptible',
				color: chartOptions.colorMap.Susceptible,
				value: sus.adults,
				perc: Math.round(((sus.adults / adultTotal) * 100) * 100) / 100
			},
			{
				name: 'Exposed',
				color: chartOptions.colorMap.Exposed,
				value: exp.adults,
				perc: Math.round(((exp.adults / adultTotal) * 100) * 100) / 100
			},
			{
				name: 'Infected',
				color: chartOptions.colorMap.Infected,
				value: inf.adults,
				perc: Math.round(((inf.adults / adultTotal) * 100) * 100) / 100
			},
			{
				name: 'Recovered',
				color: chartOptions.colorMap.Recovered,
				value: rec.adults,
				perc: Math.round(((rec.adults / adultTotal) * 100) * 100) / 100
			},
			{
				name: 'Deceased',
				color: chartOptions.colorMap.Deceased,
				value: dec.adults,
				perc: Math.round(((dec.adults / adultTotal) * 100) * 100) / 100
			}
		];

		me.chartsData.popup.population.percentMinors.data = [
			{
				name: 'Susceptible',
				color: chartOptions.colorMap.Susceptible,
				value: sus.minors,
				perc: Math.round(((sus.minors / minorTotal) * 100) * 100) / 100
			},
			{
				name: 'Exposed',
				color: chartOptions.colorMap.Exposed,
				value: exp.minors,
				perc: Math.round(((exp.minors / minorTotal) * 100) * 100) / 100
			},
			{
				name: 'Infected',
				color: chartOptions.colorMap.Infected,
				value: inf.minors,
				perc: Math.round(((inf.minors / minorTotal) * 100) * 100) / 100
			},
			{
				name: 'Recovered',
				color: chartOptions.colorMap.Recovered,
				value: rec.minors,
				perc: Math.round(((rec.minors / minorTotal) * 100) * 100) / 100
			},
			{
				name: 'Deceased',
				color: chartOptions.colorMap.Deceased,
				value: dec.minors,
				perc: Math.round(((dec.minors / adultTotal) * 100) * 100) / 100
			}
		];

		me.chartsData.popup.population.susceptible.data = [
			{
				name: 'Adults',
				color: chartOptions.colorMap.Susceptible,
				value: sus.adults,
				perc: Math.round(((sus.adults / susTotal) * 100) * 100) / 100
			},
			{
				name: 'Minors',
				color: chartOptions.colorMap.Exposed,
				value: sus.minors,
				perc: Math.round(((sus.minors / susTotal) * 100) * 100) / 100
			}
		];

		me.chartsData.popup.population.exposed.data = [
			{
				name: 'Adults',
				color: chartOptions.colorMap.Susceptible,
				value: exp.adults,
				perc: Math.round(((exp.adults / expTotal) * 100) * 100) / 100
			},
			{
				name: 'Minors',
				color: chartOptions.colorMap.Exposed,
				value: exp.minors,
				perc: Math.round(((exp.minors / expTotal) * 100) * 100) / 100
			}
		];

		me.chartsData.popup.population.infected.data = [
			{
				name: 'Adults',
				color: chartOptions.colorMap.Susceptible,
				value: inf.adults,
				perc: Math.round(((inf.adults / infTotal) * 100) * 100) / 100
			},
			{
				name: 'Minors',
				color: chartOptions.colorMap.Exposed,
				value: inf.minors,
				perc: Math.round(((inf.minors / infTotal) * 100) * 100) / 100
			}
		];

		me.chartsData.popup.population.recovered.data = [
			{
				name: 'Adults',
				color: chartOptions.colorMap.Susceptible,
				value: rec.adults,
				perc: Math.round(((rec.adults / recTotal) * 100) * 100) / 100
			},
			{
				name: 'Minors',
				color: chartOptions.colorMap.Exposed,
				value: rec.minors,
				perc: Math.round(((rec.minors / recTotal) * 100) * 100) / 100
			}
		];

		me.chartsData.popup.population.deceased.data = [
			{
				name: 'Adults',
				color: chartOptions.colorMap.Susceptible,
				value: dec.adults,
				perc: Math.round(((dec.adults / decTotal) * 100) * 100) / 100
			},
			{
				name: 'Minors',
				color: chartOptions.colorMap.Exposed,
				value: dec.minors,
				perc: Math.round(((dec.minors / decTotal) * 100) * 100) / 100
			}
		];
	}

	function updatePopupTrends(state) {
		var total = me.chartsData.popup.trends.total,
			adult = me.chartsData.popup.trends.adult,
			minor = me.chartsData.popup.trends.minor,
			sus = state.susceptible,
			exp = state.exposed,
			inf = state.infected,
			rec = state.recovered,
			dec = state.deceased,
			label = total.labels.length + 1;

		total.labels.push(label);
		adult.labels.push(label);
		minor.labels.push(label);


		total.datasets.forEach(function(set) {
			if (set.name === 'susceptible') {
				set.data.push(sus.adults + sus.minors);
			} else if (set.name === 'exposed') {
				set.data.push(exp.adults + exp.minors);
			} else if (set.name === 'infected') {
				set.data.push(inf.adults + inf.minors);
			} else if (set.name === 'recovered') {
				set.data.push(rec.adults + rec.minors);
			} else if (set.name === 'deceased') {
				set.data.push(dec.adults + dec.minors);
			} else {
				console.error('WUT?!?!', set);
			}
		});

		adult.datasets.forEach(function(set) {
			if (set.name === 'susceptible') {
				set.data.push(sus.adults);
			} else if (set.name === 'exposed') {
				set.data.push(exp.adults);
			} else if (set.name === 'infected') {
				set.data.push(inf.adults);
			} else if (set.name === 'recovered') {
				set.data.push(rec.adults);
			} else if (set.name === 'deceased') {
				set.data.push(dec.adults);
			} else {
				console.error('WUT?!?!', set);
			}
		});

		minor.datasets.forEach(function(set) {
			if (set.name === 'susceptible') {
				set.data.push(sus.minors);
			} else if (set.name === 'exposed') {
				set.data.push(exp.minors);
			} else if (set.name === 'infected') {
				set.data.push(inf.minors);
			} else if (set.name === 'recovered') {
				set.data.push(rec.minors);
			} else if (set.name === 'deceased') {
				set.data.push(dec.minors);
			} else {
				console.error('WUT?!?!', set);
			}
		});

		console.log(total.datasets);

	}

	function updateCurrent(state) {
		me.currentState = state;

		updateWatch(state);

		updatePopupPopulation(state);

		updatePopupTrends(state);
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

	chartOptions = {
		colorMap: {
			'Susceptible': '#D1DE1F',
			'Exposed': '#DE8B1F',
			'Infected': '#D61C1C',
			'Recovered': '#18C418',
			'Deceased': 'black'
		},
		pie: {
			animateRotate: false,
			segmentStrokeColor: '#d3d3d3',
			strokeSegmentWidth: 1
		},
		bar: {}
	};

	this.chartsData = {
		watch: {
			pie: {
				options: chartOptions.pie,
				data: []
			}
		},
		popup: {
			population: {
				//break up of the adult/minors in the region
				total: {
					cls: 'total',
					title: 'Age Groups',
					options: chartOptions.pie,
					data: []
				},
				//break up of the susceptible, exposed, infected, recoverd, deceased of the total population
				percentTotal: {
					cls: 'pop-break',
					title: 'Population Break Up',
					options: chartOptions.pie,
					data: []
				},
				//break up of the susceptible, exposed, infected, recoverd, deceased adults
				percentAdults: {
					cls: 'adult-break',
					title: 'Adult Break Up',
					options: chartOptions.pie,
					data: []
				},
				//break up of the susceptible, exposed, infected, recoverd, deceased minors
				percentMinors: {
					cls: 'minor-break',
					title: 'Minor Break Up',
					options: chartOptions.pie,
					data: []
				},
				susceptible: {
					cls: 'sus-break',
					title: 'Susceptible Break Up',
					options: chartOptions.pie,
					data: []
				},
				exposed: {
					cls: 'exp-break',
					title: 'Exposed Break Up',
					options: chartOptions.pie,
					data: []
				},
				infected: {
					cls: 'inf-break',
					title: 'Infected Break Up',
					options: chartOptions.pie,
					data: []
				},
				recovered: {
					cls: 'rec-break',
					title: 'Recovered Break Up',
					options: chartOptions.pie,
					data: []
				},
				deceased: {
					cls: 'dec-break',
					title: 'Deceased Break Up',
					options: chartOptions.pie,
					data: []
				}
			},
			trends: {
				total: {
					cls: 'total-trend',
					title: 'Population Totals',
					options: chartOptions.bar,
					labels: [],
					datasets: [
						{
							name: 'susceptible',
							strokeColor: chartOptions.colorMap.Susceptible,
							pointColor: chartOptions.colorMap.Susceptible,
							pointStrokeColor: '#fff',
							fillColor: 'rgba(255,255, 255, 0)',
							data: []
						},
						{
							name: 'exposed',
							strokeColor: chartOptions.colorMap.Exposed,
							pointColor: chartOptions.colorMap.Exposed,
							pointStrokeColor: '#fff',
							fillColor: 'rgba(255,255, 255, 0)',
							data: []
						},
						{
							name: 'infected',
							strokeColor: chartOptions.colorMap.Infection,
							pointColor: chartOptions.colorMap.Infection,
							pointStrokeColor: '#fff',
							fillColor: 'rgba(255,255, 255, 0)',
							data: []
						},
						{
							name: 'recovered',
							strokeColor: chartOptions.colorMap.Recovered,
							pointColor: chartOptions.colorMap.Recovered,
							pointStrokeColor: '#fff',
							fillColor: 'rgba(255,255, 255, 0)',
							data: []
						},
						{
							name: 'deceased',
							strokeColor: chartOptions.colorMap.Deceased,
							pointColor: chartOptions.colorMap.Deceased,
							pointStrokeColor: '#fff',
							fillColor: 'rgba(255,255, 255, 0)',
							data: []
						}
					]
				},
				adult: {
					cls: 'adult-trend',
					title: 'Adult Totals',
					options: chartOptions.bar,
					labels: [],
					datasets: [
						{
							name: 'susceptible',
							strokeColor: chartOptions.colorMap.Susceptible,
							pointColor: chartOptions.colorMap.Susceptible,
							pointStrokeColor: '#fff',
							fillColor: 'rgba(255,255, 255, 0)',
							data: []
						},
						{
							name: 'exposed',
							strokeColor: chartOptions.colorMap.Exposed,
							pointColor: chartOptions.colorMap.Exposed,
							pointStrokeColor: '#fff',
							fillColor: 'rgba(255,255, 255, 0)',
							data: []
						},
						{
							name: 'infected',
							strokeColor: chartOptions.colorMap.Infection,
							pointColor: chartOptions.colorMap.Infection,
							pointStrokeColor: '#fff',
							fillColor: 'rgba(255,255, 255, 0)',
							data: []
						},
						{
							name: 'recovered',
							strokeColor: chartOptions.colorMap.Recovered,
							pointColor: chartOptions.colorMap.Recovered,
							pointStrokeColor: '#fff',
							fillColor: 'rgba(255,255, 255, 0)',
							data: []
						},
						{
							name: 'deceased',
							strokeColor: chartOptions.colorMap.Deceased,
							pointColor: chartOptions.colorMap.Deceased,
							pointStrokeColor: '#fff',
							fillColor: 'rgba(255,255, 255, 0)',
							data: []
						}
					]
				},
				minor: {
					cls: 'minor-trend',
					title: 'Minor Totals',
					options: chartOptions.bar,
					labels: [],
					datasets: [
						{
							name: 'susceptible',
							strokeColor: chartOptions.colorMap.Susceptible,
							pointColor: chartOptions.colorMap.Susceptible,
							pointStrokeColor: '#fff',
							fillColor: 'rgba(255,255, 255, 0)',
							data: []
						},
						{
							name: 'exposed',
							strokeColor: chartOptions.colorMap.Exposed,
							pointColor: chartOptions.colorMap.Exposed,
							pointStrokeColor: '#fff',
							fillColor: 'rgba(255,255, 255, 0)',
							data: []
						},
						{
							name: 'infected',
							strokeColor: chartOptions.colorMap.Infection,
							pointColor: chartOptions.colorMap.Infection,
							pointStrokeColor: '#fff',
							fillColor: 'rgba(255,255, 255, 0)',
							data: []
						},
						{
							name: 'recovered',
							strokeColor: chartOptions.colorMap.Recovered,
							pointColor: chartOptions.colorMap.Recovered,
							pointStrokeColor: '#fff',
							fillColor: 'rgba(255,255, 255, 0)',
							data: []
						},
						{
							name: 'deceased',
							strokeColor: chartOptions.colorMap.Deceased,
							pointColor: chartOptions.colorMap.Deceased,
							pointStrokeColor: '#fff',
							fillColor: 'rgba(255,255, 255, 0)',
							data: []
						}
					]
				}
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
