PandemicApp.directive('regionsMap', ['RegionManager', function(RegionManager) {
	return {
		templateUrl: 'views/Map.html',
		link: function($scope, element) {
			var map = document.getElementById('map'),
				preview = $('.map-region-preview'),
				title = $('.map-region-preview .name'), showTimeout;

			function fillInPreview(region) {
				console.log(title);
				title.html(region.name);
			}

			map.addEventListener('load', function() {
				var currentId,
					svgRoot = map.contentDocument.documentElement; //get the svg once it loads

				$('.state', svgRoot).on('mouseover', function(e) {
					var el = $(this), id = el.attr('id'),
						top = e.pageY + 30, left = e.pageX;

					clearTimeout(showTimeout);
					showTimeout = setTimeout(function() {
						fillInPreview(RegionManager.getRegionId(id));
						currentId = id;
						preview.removeClass('hidden');
						preview.css({top: top, left: left});
					}, 500);

					el.on('mousemove', function(e) {
						top = e.pageY + 30;
						left = e.pageX;

						if (!preview.hasClass('hidden')) {
							preview.css({top: top, left: left});
						}
					});
				});

				$('.state', svgRoot).on('mouseout', function(e) {
					var id = $(this).attr('id');

					clearTimeout(showTimeout);
					$(this).unbind('mousemove');


					//if its current one open close it
					if (id === currentId) {
						preview.addClass('hidden');
					}
				});
			});
		}
	};
}]);
