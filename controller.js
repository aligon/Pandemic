var spawn = require('child_process').spawn,
	fs = require('fs'),
	regionConfig = require('./RegionConfig.json');

function Main() {
	var stopFlag = false;

	this.listeners = {
		'request-region-config': 'emitRegionConfig',
		'start-update': 'startUpdate',
		'stop-update': 'stopUpdate'
	};

	this.emitRegionConfig = function() {
		this.socket.emit('return-region-config', regionConfig.Regions);
	};

	function parseStateFromClient(data) {
		var result = {}, i;

		for (i in data) {
			if (data.hasOwnProperty(i)) {
				result[i] = {
					'susceptible-adults': data[i].susceptible.adults,
					'susceptible-minors': data[i].susceptible.minors,
					'exposed-adults': data[i].exposed.adults,
					'exposed-minors': data[i].exposed.minors,
					'infected-adults': data[i].infected.adults,
					'infected-minors': data[i].infected.minors,
					'recovered-adults': data[i].recovered.adults,
					'recovered-minors': data[i].recovered.minors,
					'deceased-adults': data[i].deceased.adults,
					'deceased-minors': data[i].deceased.minors,
					'contact-adult-adult': data[i].contactRate.adults.adults,
					'contact-adult-minor': data[i].contactRate.adults.minors,
					'contact-minor-minor': data[i].contactRate.minors.minors,
					'travelRates': data[i].travelRates
				};
			}
		}

		return result;
	}

	function parseStateForClient(data) {
		var result = {}, i;

		for (i in data) {
			if (data.hasOwnProperty(i)) {
				result[i] = {
					susceptible: {
						adults: data[i]['susceptible-adults'],
						minors: data[i]['susceptible-minors']
					},
					exposed: {
						adults: data[i]['exposed-adults'],
						minors: data[i]['exposed-minors']
					},
					infected: {
						adults: data[i]['infected-adults'],
						minors: data[i]['infected-minors']
					},
					recovered: {
						adults: data[i]['recovered-adults'],
						minors: data[i]['recovered-minors']
					},
					deceased: {
						adults: data[i]['deceased-adults'],
						minors: data[i]['deceased-minors']
					}
				};
			}
		}

		return result;
	}

	function generateNext(state, callback) {
		var waiting = 0, count = 0, region, thread = {}, regionlist = '', result = state.regions;

		function computeTravel(name, data) {
			var region = data[name], i,
				sus = 0, exp = 0, copy;

			function getRegionPerc(name, key) {
				var region = data[name],
					sub = region[key + '-adults'],
					total = region['susceptible-adults'] + region['exposed-adults'] + region['infected-adults'];

				return sub / total;
			}

			for (i in region.travelRates.incoming) {
				if (region.travelRates.incoming.hasOwnProperty(i)) {
					sus += region.travelRates.incoming[i] * getRegionPerc(i, 'susceptible');
					exp += region.travelRates.incoming[i] * getRegionPerc(i, 'exposed');
				}
			}

			for (i in region.travelRates.outgoing) {
				if (region.travelRates.outgoing.hasOwnProperty(i)) {
					sus -= region.travelRates.outgoing[i] * getRegionPerc(i, 'susceptible');
					exp -= region.travelRates.outgoing[i] * getRegionPerc(i, 'exposed');
				}
			}

			sus = Math.max(Math.round(region['susceptible-adults'] + sus), 0);
			exp = Math.max(Math.round(region['exposed-adults'] + exp + 10), 0);

			region['susceptible-adults'] = sus;
			region['exposed-adults'] = exp;

			copy = JSON.parse(JSON.stringify(region));

			delete copy.travelRates;

			return copy;
		}

		function maybeFinish(json) {
			var name;
			for (name in json) {
				if (json.hasOwnProperty(name) && result[name]) {
					result[name]['susceptible-adults'] = json[name]['susceptible-adults'];
					result[name]['susceptible-minors'] = json[name]['susceptible-minors'];
					result[name]['exposed-adults'] = json[name]['exposed-adults'];
					result[name]['exposed-minors'] = json[name]['exposed-minors'];
					result[name]['infected-adults'] = json[name]['infected-adults'];
					result[name]['infected-minors'] = json[name]['infected-minors'];
					result[name]['recovered-adults'] = json[name]['recovered-adults'];
					result[name]['recovered-minors'] = json[name]['recovered-minors'];
					result[name]['deceased-adults'] = json[name]['deceased-adults'];
					result[name]['deceased-minors'] = json[name]['deceased-minors'];
				}
			}

			waiting--;

			if (waiting === 0) {
				callback.call(null, result);
			}
		}

		function calcThread(json) {
			var inputFile = 'state-input-' + waiting + '.json',
				outputFile = 'state-output-' + waiting + '.json';

			fs.writeFile(inputFile, JSON.stringify(json), function(err) {
				if (err) {
					console.error('failed to write state to file wiping c drive');
				}

				var process = spawn('cp', [inputFile, outputFile]);

				process.on('close', function(code) {
					fs.readFile(outputFile, function(err, data) {
						if (err) {
							console.error('failed to read stat output file');
							return;
						}

						maybeFinish(JSON.parse(data));
					});
				});
			});
		}

		for (region in state.regions) {
			if (state.regions.hasOwnProperty(region)) {
				count++;

				regionlist += ',' + region;

				thread[region] = computeTravel(region, state.regions);

				if (count % regionConfig.MaxAllowedProcesses === 0) {
					waiting++;
					thread.disease = state.disease;

					calcThread(thread);
					thread = {};
					regionlist = '';
				}
			}
		}

		if (regionlist !== '') {
			waiting++;
			thread.regions = regionlist;
			thread.disease = state.disease;
			calcThread(thread);
		}

	}

	this.startUpdate = function(state) {
		var socket = this.socket;
		state.regions = parseStateFromClient(state.regions);
		//console.log(state.regions);

		stopFlag = false;

		function callback(regions) {
			socket.emit('state-update', parseStateForClient(regions));

			if (!stopFlag) {
				state.regions = regions;
				//console.log(state.regions);
				generateNext({
					disease: state.disease,
					regions: regions
				}, callback);
			}
		}

		generateNext(state, callback);
	};

	this.stopUpdate = function(data) {
		stopFlag = true;
	};


	/*
		State template:
		{
			regions: 'regionName1,regionName2',
			disease: {
				exposureRate: {Number},
				infectionRate: {Number},
				mortalityRate: {Number},
				recoveryRate: {Number}
			},
			regionName: {
				population: {
					adults: {Number},
					minors: {Number}
				},
				contact: {
					adults: {
						adults: {Number},
						minors: {Number}
					},
					minors: {
						adults: {Number},
						minors: {Number}
					},
				},
				susceptible: {
					adults: {Number},
					minors: {Number}
				},
				exposed: {
					adults: {Number},
					minors: {Number}
				},
				infected: {
					adults: {Number},
					minors: {Number}
				},
				recovered: {
					adults: {Number},
					minors: {Number}
				},
				deceased: {
					adults: {Number},
					minors: {Numner}
				}
			}
		}
	 */
}

module.exports = Main;
