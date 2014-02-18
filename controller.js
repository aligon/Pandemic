var spawn = require('child_process').spawn;

function Main(){
	this.listeners = {
		'event': 'funcname'
	}

	this.funcname = function(data){};
}

module.export = Main;