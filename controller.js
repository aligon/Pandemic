var spawn = require('child_process').spawn,
	regionConfig = require('./RegionConfig.json');

function Main() {
	this.listeners = {
		'request-region-config': 'emitRegionConfig'
	};

	this.emitRegionConfig = function() {
		this.socket.emit('return-region-config', regionConfig.Regions);
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
