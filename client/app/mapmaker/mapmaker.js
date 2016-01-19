'use strict';

angular.module('airedioApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/mapmaker/mapmaker.html',
        controller: 'MapmakerCtrl'
      });
  });
