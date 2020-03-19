(function() {
  'use strict';

  angular.module('myApp')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  function routeConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/index');

    $stateProvider
      .state('index', {
          url: '/index',  
          template: require("./entities/main/main.html"),
          controller: "MainController",
          controllerAs: "$ctrl"
      });
  }
  })();