var PandemicApp = angular.module('PandemicApp', [
	'ngCookies',
	'ngResource',
	'ngSanitize',
	'ngRoute'
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