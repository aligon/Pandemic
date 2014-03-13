PandemicApp.directive('regionsMap', ['RegionManager', function(RegionManager) {
	return {
		templateUrl: 'views/Map.html',
		link: function(scope, element) {
			var map = document.getElementById('map');

			map.addEventListener('load', function() {
				var svgRoot = map.contentDocument.documentElement; //get the svg once it loads

				$('.state', svgRoot).on('mouseover', function(e) {
					var id = $(this).attr('id');

					console.log(id);
				});
			});
		}
	};
}]);
