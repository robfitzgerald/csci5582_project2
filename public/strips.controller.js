(function() {

  angular
    .module('project2')
    .controller('StripsController', ['result', StripsController]);

  function StripsController(result) {
    var vm = this;
    vm.result = result;
    console.log(result);
    vm.solution = {};
/*    reorderResult();

   function reorderResult() {
      for (var i = result.length - 1; i >= 0; --i) {
        vm.result.push(result[i]);
      }
    }*/

  }


})();