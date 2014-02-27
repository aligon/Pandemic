function Socket(s) {
	var listeners, socket;

	this.socket = socket = s;

	socket.on('shake', function(data) {
		console.log('handshake received', data);
		socket.emit('return-shake', data);
	});

	socket.emit('handshake');


	this.addController = function(controller) {
		console.log('Controller Added', controller.listeners);
		var i, listeners = controller.listeners;

		if (!this.socket) {
			console.error('no socket to add controller too');
			return;
		}

		controller.socket = socket;

		for (i in listeners) {
			if (listeners.hasOwnProperty(i)) {
				console.log('Adding listener', i, controller[listeners[i]] || listener[i]);
				if (typeof listeners[i] === 'string') {
					this.addListener(i, controller[listeners[i]], controller);
				} else {
					this.addListener(i, listeners[i], controller);
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
		console.log('New Socket Connection', controllers);
		var i,
			socket = new Socket(s);

		controllers.forEach(function(controller) {
			socket.addController(new controller());
		});
	};

	this.onError = function() {
		console.error('Socket.io error:', arguments);
	};


	return this;
}

module.exports = SocketManager;
