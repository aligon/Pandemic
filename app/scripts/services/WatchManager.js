PandemicApp.service('WatchManager', ['RegionManager', function(RegionManager) {
	var me = this;

	me.watch = [];

	function callUpdate() {
		if (me.updateFn) {
			me.updateFn.call(null, me.watch);
		}
	}

	/**
	 * Add a region to the watch list
	 * @param {String} name The name or id of the region
	 */
	me.addRegion = function(name) {
		var region = RegionManager.getRegion(name) || RegionManager.getRegionId(name);

		me.watch.push(region);
		callUpdate();
	};

	me.removeRegion = function(name) {
		me.watch = me.watch.reduce(function(prev, region) {
			if (region.name === name || region.id === name || '#' + region.id === name) {
				return prev;
			}

			prev.push(region);
			return prev;
		}, []);

		callUpdate();
	};

	me.removeAllRegions = function() {
		me.watch = [];
		callUpdate();
	};

	me.addUpdate = function(fn) {
		me.updateFn = fn;
	};

	RegionManager.addWatch(function() {
		var n = [];
		RegionManager.regions.forEach(function(region) {
			me.watch.forEach(function(watch) {
				if (watch.name === region.name) {
					n.push(region);
				}
			});
		});

		me.watch = n;
		callUpdate();
	});
}]);
