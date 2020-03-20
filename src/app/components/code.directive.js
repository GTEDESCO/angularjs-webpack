(function () {
  'use strict';
  angular.module('myApp').directive('codediretiva', function () {
    return {   
      template: require('./code.html')
    }
  }); 
})();
