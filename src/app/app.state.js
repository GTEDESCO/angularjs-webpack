(function() {
  'use strict';

  angular.module('atsWeb')
    .config(routeConfig);

  function routeConfig($stateProvider) {
    $stateProvider
      .state('index', {
          url: '/index',  
          template: require("./entities/main/main.html"),
          controller: "MainController",
          controllerAs: "$ctrl"
      });
  }
  })();