var spawn = require('child_process').spawn;

function Main() {
	this.listeners = {
		'event': 'funcname'
	};

	this.funcname = function(data) {console.log('Test Event received', data)};
}

module.exports = Main;
