'use strict';

angular.module('airedioApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/noChrome', {
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });
  });