PandemicApp.directive('regionsMap', ['RegionManager', function(RegionManager) {
	var currentRegion, title, totalPop,	adultPop, minorPop, totalSus, adultSus, minorSus,
		totalExp, adultExp, minorExp, totalInf, adultInf,
		minorInf, totalRec, adultRec, minorRec, totalDec,
		adultDec, minorDec;

	function fillInPreview(region) {
		currentRegion = region.name;
		title.html(region.name);
		//population
		totalPop.html(region.population.adults + region.population.minors);
		adultPop.html(region.population.adults);
		minorPop.html(region.population.minors);
		//susceptible
		totalSus.html(region.currentState.susceptible.adults + region.currentState.susceptible.minors);
		adultSus.html(region.currentState.susceptible.adults);
		minorSus.html(region.currentState.susceptible.minors);
		//exposed
		totalExp.html(region.currentState.exposed.adults + region.currentState.exposed.minors);
		adultExp.html(region.currentState.exposed.adults);
		minorExp.html(region.currentState.exposed.minors);
		//infected
		totalInf.html(region.currentState.infected.adults + region.currentState.infected.minors);
		adultInf.html(region.currentState.infected.adults);
		minorInf.html(region.currentState.infected.minors);
		//recovered
		totalRec.html(region.currentState.recovered.adults + region.currentState.recovered.minors);
		adultRec.html(region.currentState.recovered.adults);
		minorRec.html(region.currentState.recovered.minors);
		//deceased
		totalDec.html(region.currentState.deceased.adults + region.currentState.deceased.minors);
		adultDec.html(region.currentState.deceased.adults);
		minorDec.html(region.currentState.deceased.minors);
	}

	function generateUpdateFunction(map, preview) {

		return function() {

			function fillInPreview(region) {

			}

			RegionManager.regions.forEach(function(region) {
				var svg = $(region.id, map),
					perc = region.getPercantage();

				svg.css('fill', 'rgba(212,66,66,' + prec + ')');

				if (currentRegion === region.name) {
					fillInPreview(region);
				}
			});
		};
	}

	return {
		templateUrl: 'views/Map.html',
		link: function($scope, element) {
			var map = document.getElementById('map'),
				preview = $('.map-region-preview'), showTimeout;

			title = $('.map-region-preview .name');
			totalPop = $('.map-region-preview .total-pop');
			adultPop = $('.map-region-preview .adult-pop');
			minorPop = $('.map-region-preview .minor-pop');
			totalSus = $('.map-region-preview .total-sus');
			adultSus = $('.map-region-preview .adult-sus');
			minorSus = $('.map-region-preview .minor-sus');
			totalExp = $('.map-region-preview .total-exp');
			adultExp = $('.map-region-preview .adult-exp');
			minorExp = $('.map-region-preview .minor-exp');
			totalInf = $('.map-region-preview .total-inf');
			adultInf = $('.map-region-preview .adult-inf');
			minorInf = $('.map-region-preview .minor-inf');
			totalRec = $('.map-region-preview .total-rec');
			adultRec = $('.map-region-preview .adult-rec');
			minorRec = $('.map-region-preview .minor-rec');
			totalDec = $('.map-region-preview .total-dec');
			adultDec = $('.map-region-preview .adult-dec');
			minorDec = $('.map-region-preview .minor-dec');

			RegionManager.addMap(generateUpdateFunction());

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
