PandemicApp.directive('regionWatch', ['WatchManager', function(WatchManager) {
	return {
		scope: {
			watch: '='
		},
		templateUrl: 'views/Watch.html',
		link: function(scope, element) {
			var already = false;
			scope.removeWatch = function(region) {
				WatchManager.removeRegion(region);
			};
		}
	};
}]);
