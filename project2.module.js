(function() {

  angular
    .module('project2', ['ui.router'])
    .config(function($stateProvider, $urlRouterProvider){
      $urlRouterProvider.otherwise('/ex1');

      $stateProvider
        .state('ex1', {
          url: '/ex1',
          templateUrl: 'content.html',
          controller: 'StripsController',
          controllerAs: 'ctrl',
          resolve: {
            solution: function(StripsFactory) {
              return StripsFactory.example1();
            }
          }
        })
        .state('ex2', {
          url: '/ex2',
          templateUrl: 'content.html',
          controller: 'StripsController',
          controllerAs: 'ctrl',
          resolve: {
            solution: function(StripsFactory) {
              return StripsFactory.example2();
            }
          }
        })
        .state('ex3', {
          url: '/ex3',
          templateUrl: 'content.html',
          controller: 'StripsController',
          controllerAs: 'ctrl',
          resolve: {
            solution: function(StripsFactory) {
              return StripsFactory.example3();
            }
          }
        })
    })
    .factory('StripsFactory', [StripsFactory])
    .controller('StripsController', ['solution', StripsController]);

  function StripsFactory() {
    var StripsFactory = {
      example1: example1,
      example2: example2,
      example3: example3
    };

    function example1() {
      return {
        moves: [
          { name: 'ex1'}
        ],
        current: [
          { name: 'ex1'}
        ],
        stack: [
          { name: 'ex1'}
        ],
        slotA: [
          { name: 'A'},
          { name: 'B'}
        ],
        slotB: [

        ],
        slotC: [
          { name: 'C'}
        ],
        slotD: [
          { name: 'D'}
        ],
        arm: [
          { name: 'E'}
        ]
      }
    }

    function example2() {
      return {
        moves: [
          { name: 'ex2'}
        ],
        current: [
          { name: 'ex2'}
        ],
        stack: [
          { name: 'ex2'}
        ],
        slotA: [
          { name: 'ex2'}
        ],
        slotB: [
          { name: 'ex2'}
        ],
        slotC: [
          { name: 'ex2'}
        ],
        slotD: [
          { name: 'ex2'}
        ],
        arm: [
          { name: 'ex2'}
        ]
      }
    }

    function example3() {
      return {
        moves: [
          { name: 'ex3'}
        ],
        current: [
          { name: 'ex3'}
        ],
        stack: [
          { name: 'ex3'}
        ],
        slotA: [
          { name: 'ex3'}
        ],
        slotB: [
          { name: 'ex3'}
        ],
        slotC: [
          { name: 'ex3'}
        ],
        slotD: [
          { name: 'ex3'}
        ],
        arm: [
          { name: 'ex3'}
        ]
      }
    }
    
    return StripsFactory;
  }

  function StripsController(solution) {
    var vm = this;
    vm.solution = solution;
  }

})();