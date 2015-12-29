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
              // console.log('ex1.resolve beginning')
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
            result: function (StripsFactory) {
              console.log('calling StripsFactory.example2() from router')
              // console.log('ex2.resolve beginning')
              return StripsFactory.example2()
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
              // console.log('ex3.resolve beginning')
              return StripsFactory.example3()
                // .then(function (result) {
                //   // console.log('resolve success')
                //   return result;
                // })
                // .catch(function (err) {
                //   console.log('resolve fail')
                //   return err;
                // });
            }
          }
        })
    })

})();