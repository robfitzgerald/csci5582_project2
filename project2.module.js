(function () {

  angular
    .module('project2', ['ui.router'])
    .config(function ($stateProvider, $urlRouterProvider) {
      //$urlRouterProvider.otherwise(function ($injector) {
      //  var $state = $injector.get('$state');
      //  $state.go('ex3');
      //});

      $stateProvider
        .state('ex1', {
          url: '/ex1',
          templateUrl: 'content.html',
          controller: 'StripsController',
          controllerAs: 'ctrl',
          resolve: {
            result: function (StripsFactory) {
              console.log('ex1.resolve beginning')
              return 5;/*StripsFactory.example1();*/
            }
          }
        })
        .state('ex2', {
          url: '/ex2',
          templateUrl: 'content.html',
          controller: 'StripsController',
          controllerAs: 'ctrl',
          resolve: {
            result: function (StripsFactory) {
              console.log('ex2.resolve beginning')
              return 10;/*StripsFactory.example2();*/
            }
          }
        })
        .state('ex3', {
          url: '/ex3',
          templateUrl: 'content.html',
          controller: 'StripsController',
          controllerAs: 'ctrl',
          resolve: {
            result: function (StripsFactory) {
              console.log('ex3.resolve beginning')
              StripsFactory.example3()
                .then(function (result) {
                  console.log('resolve success')
                  console.log(result)
                  return result;
                })
                .catch(function (err) {
                  console.log('resolve fail')
                  console.log(err)
                  return {
                    moves: err
                  }
                });
            }
          }
        })
    })

})();