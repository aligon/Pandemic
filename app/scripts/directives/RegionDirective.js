PandemicApp.directive('regionList', ['RegionManager', '$q', function(RegionManager, $q) {
	return {
		templateUrl: 'views/Regions.html',
		scope: {
			regions: '=',
			openRegion: '='
		},
		link: function(scope, element) {
			scope.getRegion = function(s) {
				var p = $q.defer(), result;

				result = RegionManager.regions.filter(function(r) {
					return r.name.toLowerCase().indexOf(s) === 0;
				});

				result = result.map(function(r) {
					return r.name;
				});

				p.resolve(result);

				return p.promise;
			};
		}
	};
}]);
