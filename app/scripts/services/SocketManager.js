function Socket() {
	var socket = io.connect('http://localhost:3000'),
		listeners = {}, queue = [], me = this;

	me.connected = false;

	function onConnectionSuccess() {
		queue.forEach(function(e) {
			socket.emit(e.name, e.data);
		});
	}

	//test the socket connection
	socket.on('handshake', function(data) {
		var key = (new Date()).getTime();

		console.log('Socket handshake recevied', data);
		socket.on('return-shake', function(data) {
			if (data.key === key) {
				console.log('Socket handshake successful');
				me.connected = true;
				onConnectionSuccess();
			} else {
				console.error('Socket handshake failed', data);
			}
		});
		socket.emit('shake', {key: key});
	});

	me.addListener = function(name, func, scope) {
		if (listeners[name]) {
			listeners[name].push({
				func: func,
				scope: scope
			});
		} else {
			listeners[name] = [{
				func: func,
				scope: scope
			}];

			socket.on(name, function() {
				var listener = listeners[name],
					args = arguments;

				listener.forEach(function(l) {
					l.func.apply(l.scope, args);
				});
			});
		}
	};

	me.emit = function(name, data) {
		if (!me.connected) {
			console.warn('emitting event before connection');
			queue.push({
				name: name,
				data: data
			});

			return;
		}

		socket.emit(name, data);
	};
}

PandemicApp.service('SocketManager', [function() {
	this.mainConnection = new Socket();

	this.getConnection = function() {
		return this.mainConnection;
	};
}]);
