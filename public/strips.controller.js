(function() {

  var TIMEOUT_INTERVAL = 2000;

  angular
  .module('project2')
  .controller('StripsController', ['result', 'DemonstrationService', '$timeout', StripsController]);

  function StripsController(result, DemonstrationService, $timeout) {
    var vm = this;
    vm.result = result;
    vm.demo = [];
    vm.runDemonstration = runDemonstration;
    vm.resetDemonstration = resetDemonstration;

    function runDemonstration() {
      DemonstrationService.applyMoves(vm.result)
      .then(function(appliedMoves) {
        vm.demo = appliedMoves;
        animateDemonstration();
      });
    }

    function resetDemonstration() {
      vm.result = deepCopy(result);
    }

    function animateDemonstration() {
      function scheduleDemos(i) {
        if (i == vm.demo.length) {
          for(var j = 0; j < vm.result.moves.length; ++j) {
            vm.result.moves[j].demoCurrent = false;
          }
        } else {
          vm.result = vm.demo[i];

          // highlight this array entry 
          for(var j = 0; j < vm.result.moves.length; ++j) {
            vm.result.moves[j].demoCurrent = false;
          }
          vm.result.moves[i].demoCurrent = true;
          // for(var j = 0; j < vm.result.moves.length; ++j) {
          //   console.log('vm.result['+j+'].demoCurrent is ' + vm.result.moves[j].demoCurrent);
          // }

          if (i < vm.demo.length) {
            $timeout(function() {
              scheduleDemos(i + 1);
            }, TIMEOUT_INTERVAL);
          }
        }

      }
      scheduleDemos(0);
    }
  }

  function deepCopy(oldObj) {
    var newObj = oldObj;
    if (oldObj && typeof oldObj === 'object') {
      newObj = Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {};
      for (var i in oldObj) {
        newObj[i] = deepCopy(oldObj[i]);
      }
    }
    return newObj;
  }

})();