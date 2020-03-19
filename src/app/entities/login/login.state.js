(function() {
  'use strict';

  angular.module('myApp.login.state', [])
    .config(routeConfig);

  function routeConfig($stateProvider) {
    $stateProvider
      .state('login', {
          url: '/login',  
          template: require("./login.html"),
      });
  }
})();