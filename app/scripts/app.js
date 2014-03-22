var PandemicApp = angular.module('PandemicApp', [
	'ngCookies',
	'ngResource',
	'ngSanitize',
	'ngRoute',
	'ngTagsInput',
	'angles'
]);

PandemicApp.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'views/main.html',
				controller: 'MainCtrl'
			})
			.otherwise({
				redirectTo: '/'
			});
	}]);

PandemicApp.filter('stateFilter', function() {
	return function(input, tags) {
		if (!tags || !tags.name || !tags.name.length) {
			return input;
		}

		return input.reduce(function(prev, current) {
			if (tags.name.indexOf(current.name) >= 0) {
				prev.push(current);
			}

			if (tags.name.indexOf(current.name.toLowerCase()) >= 0) {
				prev.push(current);
			}

			return prev;

		}, []);
	};
});
