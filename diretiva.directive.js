(function () {
  'use strict';
  angular.module('myApp').directive('diretiva', function () {
    return {   
      template: require('./diretiva.html')
    }
  }); 
})();
