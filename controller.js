var spawn = require('child_process').spawn,
	regionConfig = require('./RegionConfig.json');

function Main() {
	this.listeners = {
		'request-region-config': 'emitRegionConfig'
	};

	this.emitRegionConfig = function() {
		this.socket.emit('return-region-config', regionConfig.Regions);
	};
}

module.exports = Main;
