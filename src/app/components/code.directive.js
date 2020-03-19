(function () {
  'use strict';
  angular.module('myApp').directive('code', function () {
    return {   
      template: require('./code.html')
    }
  }); 
})();
