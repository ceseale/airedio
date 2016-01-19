'use strict';

describe('Controller: MapmakerCtrl', function () {

  // load the controller's module
  beforeEach(module('airedioApp'));

  var MapmakerCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MapmakerCtrl = $controller('MapmakerCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
