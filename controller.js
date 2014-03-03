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
			regionName: {
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
