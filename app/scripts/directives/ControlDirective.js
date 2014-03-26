PandemicApp.directive('appControls', ['StateManager', 'RegionManager', function(StateManager, RegionManager) {
	return {
		templateUrl: 'views/Controls.html',
		link: function(scope, element) {
			scope.state = 'pause';

			scope.togglePlay = function(state) {
				console.log('Toggle play', state);

				if (state === 'pause' && !StateManager.playing) {
					StateManager.speed = 0;
					StateManager.play();
					scope.state = 'play';
				} else {
					StateManager.pause();
					scope.state = 'pause';
				}
			};

			scope.setSpeedFast = function() {
				console.log('fast');
				if (StateManager.speed === 0) {
					StateManager.incrementSpeed();
				} else if (StateManager.speed === 2) {
					StateManager.decrementSpeed();
				}
			};

			scope.setSpeedSuperFast = function() {
				console.log('super fast');
				if (StateManager.speed === 0) {
					StateManager.speed = 1;
					StateManager.incrementSpeed();
				} else if (StateManager.speed === 1) {
					StateManager.incrementSpeed();
				}
			};
		}
	};
}]);
