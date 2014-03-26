PandemicApp.service('StateManager', ['RegionManager', 'SocketManager', 'DiseaseManager',
	function(RegionManager, SocketManager, DiseaseManager) {
		var socket = SocketManager.getConnection(), me = this,
			cache = [], updateInterval, lastUpdateState, currentDiseaseState;

		function update() {
			if (cache.length <= 50 && lastUpdateState) {
				socket.emit('start-update', lastUpdateState);
				lastUpdateState = false;
			}

			RegionManager.applyState(cache.shift());
		}

		function startIter() {
			clearInterval(updateInterval);

			updateInterval = setInterval(function() { update(); }, 5000 - ((me.speed || 0) * 1000));
		}

		function buildLatestState(state) {
			var regions = RegionManager.regions,
				result = {};

			regions.forEach(function(region) {
				result[region.name] = region.getLatestState();
				result[region.name].susceptible = state[region.name].susceptible;
				result[region.name].exposed = state[region.name].exposed;
				result[region.name].infected = state[region.name].infected;
				result[region.name].recovered = state[region.name].recovered;
				result[region.name].deceased = state[region.name].deceased;
			});

			return result;
		}


		this.speed = 0;

		this.incrementSpeed = function() {
			this.speed++;
			startIter();
		};

		this.decrementSpeed = function() {
			if (this.speed - 1 >= 0) {
				this.speed--;
				startIter();
			}
		};

		this.play = function() {
			currentDiseaseState = DiseaseManager.getState();
			this.playing = true;
			socket.emit('start-update', {
				disease: currentDiseaseState,
				regions: RegionManager.getLatestState()
			});
			startIter();
		};

		this.pause = function() {
			this.playing = false;
			socket.emit('stop-update', true);
			this.cache = [];
			clearInterval(updateInterval);
		};

		socket.addListener('state-update', function(data) {
			cache.push(data);
			if (cache.length > 50) {
				lastUpdateState = {
					disease: currentDiseaseState,
					regions: buildLatestState(data)
				};

				socket.emit('stop-update', true);
			}
		});
	}
]);
