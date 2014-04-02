PandemicApp.service('DiseaseManager', function() {
	this.exposureRate = 0;
	this.infectionRate = 0;
	this.mortalityRate = 0;
	this.recoveryRate = 0;

	this.getStateForServer = function() {
		return {
			exposureRate: this.exposureRate,
			infectionRate: this.infectionRate,
			mortalityRate: this.mortalityRate,
			recoveryRate: this.recoveryRate
		};
	};

	this.getState = function() {
		return {
			exposureRate: this.exposureRate / 100, //its a %
			infectionRate: 1 / this.infectionRate, //1 / # of days to infection
			mortalityRate: 1 / this.mortalityRate, //1 / # of days to mortality
			recoveryRate: 1 / this.recoveryRate // 1 / # of days to recovery
		};
	};
});
