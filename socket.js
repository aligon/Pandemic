function Socket(s) {
	var listeners, socket;

	this.socket = socket = s;

	listeners = {
		'handshake': function(data) {
			console.log('New Socket Connection');
			socket.emit('handshake-received');
		}
	};

	this.addController = function(controller) {
		var i, listeners = controller.listeners;

		if (!this.socket) {
			console.error('no socket to add controller too');
			return;
		}

		controller.socket = this;
		controller.emit = socket.emit;

		for (i in listeners) {
			if (listeners.hasOwnProperty(i)) {
				if (typeof listeners[i] === 'string') {
					this.addListener(i, controller[listeners[i]], controller);
				} else {
					this.addListener(i, listener, controller);
				}
			}
		}
	};

	this.addListener = function(name, func, scope) {
		this.socket.on(name, function() {
			func.apply(scope, arguments);
		});
	};

	return this;
}

function SocketManager() {
	var socket, controllers = [];

	this.addController = function(controller) {
		controllers.push(controller);
	};

	this.onConnect = function(s) {
		var i,
			socket = new Socket(s);

		controllers.forEach(function(controller) {
			socket.addController(controller);
		});
	};

	this.onError = function() {
		console.error('Socket.io error:', arguments);
	};


	return this;
}

module.exports = SocketManager;
